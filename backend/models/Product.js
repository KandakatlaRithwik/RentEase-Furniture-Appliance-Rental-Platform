const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    description: { type: String, trim: true },
    category: {
      type: String,
      required: true,
      enum: ['furniture', 'appliance'],
    },
    subCategory: {
      type: String,
      // furniture: bed | sofa | table | chair | wardrobe
      // appliance: fridge | washing_machine | tv | ac | microwave
    },
    monthlyRent: {
      type: Number,
      required: [true, 'Monthly rent is required'],
      min: 0,
    },
    securityDeposit: {
      type: Number,
      required: [true, 'Security deposit is required'],
      min: 0,
    },
    tenureOptions: {
      type: [Number], // months: [3, 6, 12]
      default: [3, 6, 12],
    },
    totalQuantity: { type: Number, required: true, default: 1 },
    availableQuantity: { type: Number, required: true, default: 1 },
    images: [{ type: String }],
    brand: { type: String, trim: true },
    condition: {
      type: String,
      enum: ['new', 'like_new', 'good', 'fair'],
      default: 'good',
    },
    isActive: { type: Boolean, default: true },
    city: { type: String, default: 'All' },
  },
  { timestamps: true }
);

// Index for fast category + city queries
productSchema.index({ category: 1, city: 1, isActive: 1 });

module.exports = mongoose.model('Product', productSchema);
