const Maintenance  = require('../models/Maintenance');
const Order        = require('../models/Order');
const User         = require('../models/User');
const Notification = require('../models/Notification');

// @desc    Raise a maintenance request
// @route   POST /api/maintenance
// @access  Private
const createRequest = async (req, res) => {
  try {
    const { orderId, issue, priority } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    if (order.status !== 'active') {
      return res.status(400).json({ success: false, message: 'Maintenance only for active rentals' });
    }

    const request = await Maintenance.create({
      order:   orderId,
      user:    req.user._id,
      product: order.product,
      issue,
      priority: priority || 'medium',
    });

    // Populate user info for notification
    await request.populate('user', 'name email');
    await request.populate('product', 'name');

    const admins = await User.find({ role: 'admin' }).select('_id');
    if (admins.length) {
      const adminNotifications = admins.map((admin) => ({
        user: admin._id,
        type: 'maintenance',
        title: 'Maintenance Request',
        message: `New maintenance request from ${request.user.name}`,
        data: {
          maintenanceId: request._id,
          issue: request.issue,
          priority: request.priority,
          productName: request.product.name,
        },
      }));
      await Notification.insertMany(adminNotifications);
    }

    res.status(201).json({ success: true, request });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get my maintenance requests
// @route   GET /api/maintenance/my
// @access  Private
const getMyRequests = async (req, res) => {
  try {
    const requests = await Maintenance.find({ user: req.user._id })
      .populate('product', 'name category')
      .populate('order', 'startDate endDate status')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: requests.length, requests });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get all maintenance requests (admin)
// @route   GET /api/maintenance
// @access  Admin
const getAllRequests = async (req, res) => {
  try {
    const { status, priority } = req.query;
    const filter = {};
    if (status)   filter.status   = status;
    if (priority) filter.priority = priority;

    const requests = await Maintenance.find(filter)
      .populate('user',    'name email phone')
      .populate('product', 'name category')
      .populate('order',   'startDate endDate deliveryAddress')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: requests.length, requests });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Update maintenance status (admin)
// @route   PUT /api/maintenance/:id
// @access  Admin
const updateRequest = async (req, res) => {
  try {
    const { status, adminNote } = req.body;
    const update = { status, adminNote };
    if (status === 'resolved') update.resolvedAt = new Date();

    const request = await Maintenance.findByIdAndUpdate(req.params.id, update, { new: true })
      .populate('user', 'name email');
    
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });

    if (status === 'resolved') {
      await Notification.create({
        user: request.user._id,
        type: 'maintenance_status',
        title: 'Maintenance Resolved',
        message: 'Your maintenance request has been resolved.',
        data: {
          maintenanceId: request._id,
          adminNote: request.adminNote,
        },
      });
    }

    res.json({ success: true, request });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { createRequest, getMyRequests, getAllRequests, updateRequest };
