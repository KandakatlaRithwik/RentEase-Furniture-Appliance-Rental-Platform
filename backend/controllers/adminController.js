const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Maintenance = require('../models/Maintenance');

// @desc    Admin dashboard analytics (KPIs)
// @route   GET /api/admin/analytics
// @access  Admin
const getAnalytics = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalUsers,
      totalProducts,
      activeRentals,
      pendingOrders,
      totalOrders,
      openMaintenance,
      monthlyOrders,
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Product.countDocuments({ isActive: true }),
      Order.countDocuments({ status: 'active' }),
      Order.countDocuments({ status: 'pending' }),
      Order.countDocuments(),
      Maintenance.countDocuments({ status: { $in: ['open', 'in_progress'] } }),
      Order.find({ createdAt: { $gte: startOfMonth }, status: { $ne: 'cancelled' } }),
    ]);

    // MRR = sum of monthlyRent for all active orders
    const activeOrders = await Order.find({ status: 'active' });
    const mrr = activeOrders.reduce((sum, o) => sum + o.monthlyRent, 0);

    // Monthly revenue
    const monthlyRevenue = monthlyOrders.reduce((sum, o) => sum + o.totalAmount, 0);

    res.json({
      success: true,
      analytics: {
        totalUsers,
        totalProducts,
        activeRentals,
        pendingOrders,
        totalOrders,
        openMaintenance,
        mrr,
        monthlyRevenue,
        newOrdersThisMonth: monthlyOrders.length,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get all orders (admin)
// @route   GET /api/admin/orders
// @access  Admin
const getAllOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const orders = await Order.find(filter)
      .populate('user',    'name email phone')
      .populate('product', 'name category subCategory')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Order.countDocuments(filter);

    res.json({ success: true, total, page: Number(page), orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get all users (admin)
// @route   GET /api/admin/users
// @access  Admin
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }).sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get all maintenance requests (admin)
// @route   GET /api/admin/maintenance
// @access  Admin
const getAllMaintenance = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const maintenance = await Maintenance.find(filter)
      .populate('user',    'name email phone')
      .populate('order',   'product startDate endDate')
      .populate('order.product', 'name category subCategory')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Maintenance.countDocuments(filter);

    res.json({ success: true, total, page: Number(page), maintenance });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getAnalytics, getAllOrders, getAllUsers, getAllMaintenance };
