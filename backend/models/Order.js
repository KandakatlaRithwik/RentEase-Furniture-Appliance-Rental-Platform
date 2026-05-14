const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    tenureMonths: {
      type: Number,
      required: true,
    },
    monthlyRent: { type: Number, required: true },       // snapshot at booking time
    securityDeposit: { type: Number, required: true },   // snapshot at booking time
    totalRent: { type: Number, required: true },         // monthlyRent × tenureMonths
    totalAmount: { type: Number, required: true },       // totalRent + securityDeposit

    status: {
      type: String,
      enum: ['pending', 'approved', 'delivered', 'active', 'returned', 'cancelled', 'closed'],
      default: 'pending',
    },

    deliveryAddress: {
      street:  { type: String, required: true },
      city:    { type: String, required: true },
      state:   { type: String, required: true },
      pincode: { type: String, required: true },
    },

    deliveryDate: { type: Date },
    returnDate:   { type: Date },

    // Extension support
    isExtended:        { type: Boolean, default: false },
    extensionMonths:   { type: Number,  default: 0 },
    extensionAmount:   { type: Number,  default: 0 },

    // Admin notes
    adminNote: { type: String },
  },
  { timestamps: true }
);

// ── Index for the availability engine ──────────────────────
// This makes the date overlap query very fast
orderSchema.index({ product: 1, status: 1, startDate: 1, endDate: 1 });

module.exports = mongoose.model('Order', orderSchema);
