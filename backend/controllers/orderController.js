const Order        = require('../models/Order');
const Product      = require('../models/Product');
const User         = require('../models/User');
const Notification = require('../models/Notification');
const { sendEmail, emailTemplates } = require('../utils/emailService');

// ── Availability Engine ──────────────────────────────────────
const checkAvailability = async (productId, startDate, endDate, excludeOrderId = null) => {
  const filter = {
    product: productId,
    status:  { $in: ['pending','approved','delivered','active'] },
    startDate: { $lte: new Date(endDate) },
    endDate:   { $gte: new Date(startDate) },
  };
  if (excludeOrderId) filter._id = { $ne: excludeOrderId };
  const overlapping = await Order.countDocuments(filter);
  const product     = await Product.findById(productId);
  return { available: overlapping < product.availableQuantity, overlappingOrders: overlapping, availableQuantity: product.availableQuantity };
};

// POST /api/orders/check-availability
const checkAvailabilityHandler = async (req, res) => {
  try {
    const { productId, startDate, endDate } = req.body;
    const result = await checkAvailability(productId, startDate, endDate);
    res.json({ success: true, ...result });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// POST /api/orders
const createOrder = async (req, res) => {
  try {
    const { productId, startDate, endDate, tenureMonths, deliveryAddress } = req.body;
    const product = await Product.findById(productId);
    if (!product || !product.isActive)
      return res.status(404).json({ success: false, message: 'Product not found' });

    if (req.user?.role === 'admin')
      return res.status(403).json({ success: false, message: 'Admins cannot place rental orders' });

    if (!product.tenureOptions.includes(Number(tenureMonths)))
      return res.status(400).json({ success: false, message: `Invalid tenure. Allowed: ${product.tenureOptions.join(', ')} months` });

    const avail = await checkAvailability(productId, startDate, endDate);
    if (!avail.available)
      return res.status(409).json({ success: false, message: 'Product not available for selected dates' });

    const totalRent   = product.monthlyRent * tenureMonths;
    const totalAmount = totalRent + product.securityDeposit;

    const order = await Order.create({
      user: req.user._id, product: productId,
      startDate: new Date(startDate), endDate: new Date(endDate),
      tenureMonths, monthlyRent: product.monthlyRent,
      securityDeposit: product.securityDeposit, totalRent, totalAmount,
      deliveryAddress,
    });

    // Reduce available stock immediately for the new rental
    product.availableQuantity = Math.max(0, product.availableQuantity - 1);
    await product.save();

    await order.populate('product', 'name category subCategory images');

    // Create admin notifications for the new order
    const admins = await User.find({ role: 'admin' }).select('_id');
    if (admins.length) {
      const adminNotifications = admins.map((admin) => ({
        user: admin._id,
        type: 'order',
        title: 'Order Received',
        message: `Order received from ${req.user.name}`,
        data: {
          orderId: order._id,
          productName: product.name,
          totalAmount,
        },
      }));
      await Notification.insertMany(adminNotifications);
    }

    // Send confirmation email (non-blocking)
    sendEmail({ to: req.user.email, ...emailTemplates.orderPlaced(req.user, order, product) });

    res.status(201).json({ success: true, order });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// GET /api/orders/my
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('product', 'name category subCategory images monthlyRent')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: orders.length, orders });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// GET /api/orders/:id
const getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('product', 'name category subCategory images')
      .populate('user', 'name email phone');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (req.user.role !== 'admin' && order.user._id.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: 'Access denied' });
    res.json({ success: true, order });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// PUT /api/orders/:id/cancel
const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.user.toString() !== req.user._id.toString()) return res.status(403).json({ success: false, message: 'Access denied' });
    if (order.status !== 'pending') return res.status(400).json({ success: false, message: `Cannot cancel order with status: ${order.status}` });

    order.status = 'cancelled';
    await order.save();

    const product = await Product.findById(order.product);
    if (product) {
      product.availableQuantity = Math.min(product.totalQuantity, product.availableQuantity + 1);
      await product.save();
    }

    res.json({ success: true, message: 'Order cancelled', order });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// PUT /api/orders/:id/extend
const extendOrder = async (req, res) => {
  try {
    const { extraMonths } = req.body;
    const order = await Order.findById(req.params.id).populate('product');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.user.toString() !== req.user._id.toString()) return res.status(403).json({ success: false, message: 'Access denied' });
    if (order.status !== 'active') return res.status(400).json({ success: false, message: 'Only active rentals can be extended' });
    const newEndDate = new Date(order.endDate);
    newEndDate.setMonth(newEndDate.getMonth() + Number(extraMonths));
    const avail = await checkAvailability(order.product._id, order.endDate, newEndDate, order._id);
    if (!avail.available) return res.status(409).json({ success: false, message: 'Extension not available for those dates' });
    const extAmt = order.product.monthlyRent * Number(extraMonths);
    order.endDate          = newEndDate;
    order.tenureMonths    += Number(extraMonths);
    order.isExtended       = true;
    order.extensionMonths += Number(extraMonths);
    order.extensionAmount += extAmt;
    order.totalRent       += extAmt;
    order.totalAmount     += extAmt;
    await order.save();
    res.json({ success: true, message: 'Rental extended', order });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// PUT /api/orders/:id/status  (admin)
const updateOrderStatus = async (req, res) => {
  try {
    const { status, adminNote, deliveryDate, returnDate } = req.body;
    const validTransitions = {
      pending:['approved','cancelled'], approved:['delivered','cancelled'],
      delivered:['active'], active:['returned'], returned:['closed'],
    };
    const order = await Order.findById(req.params.id).populate('product','name').populate('user','name email');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    const allowed = validTransitions[order.status] || [];
    if (!allowed.includes(status))
      return res.status(400).json({ success: false, message: `Cannot move from '${order.status}' to '${status}'` });

    const previousStatus = order.status;
    order.status = status;
    if (adminNote)    order.adminNote    = adminNote;
    if (deliveryDate) order.deliveryDate = new Date(deliveryDate);
    if (returnDate)   order.returnDate   = new Date(returnDate);

    await order.save();

    if (['cancelled','returned'].includes(status)) {
      const product = await Product.findById(order.product);
      if (product) {
        product.availableQuantity = Math.min(product.totalQuantity, product.availableQuantity + 1);
        await product.save();
      }
    }

    if (status === 'approved') {
      await Notification.create({
        user: order.user._id,
        type: 'order_status',
        title: 'Order Approved',
        message: 'Your order has been approved and is now being processed.',
        data: {
          orderId: order._id,
          productName: order.product.name,
          status,
        },
      });
    }

    // Send status update email (non-blocking)
    sendEmail({ to: order.user.email, ...emailTemplates.statusUpdated(order.user, order, order.product, status) });

    res.json({ success: true, order });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

module.exports = { checkAvailabilityHandler, createOrder, getMyOrders, getOrder, cancelOrder, extendOrder, updateOrderStatus };
