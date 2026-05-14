const Product = require('../models/Product');

const getProducts = async (req, res) => {
  try {
    const { category, subCategory, city, minRent, maxRent, search, page=1, limit=20 } = req.query;
    const filter = { isActive: true };
    if (category)    filter.category    = category;
    if (subCategory) filter.subCategory = subCategory;
    if (city)        filter.city        = { $in: [city, 'All'] };
    if (minRent || maxRent) {
      filter.monthlyRent = {};
      if (minRent) filter.monthlyRent.$gte = Number(minRent);
      if (maxRent) filter.monthlyRent.$lte = Number(maxRent);
    }
    if (search) {
      filter.$or = [
        { name:        { $regex: search, $options:'i' } },
        { description: { $regex: search, $options:'i' } },
        { brand:       { $regex: search, $options:'i' } },
      ];
    }
    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Product.countDocuments(filter);
    const products = await Product.find(filter).sort({ createdAt:-1 }).skip(skip).limit(Number(limit));
    res.json({ success:true, count:products.length, total, page:Number(page), pages:Math.ceil(total/Number(limit)), products });
  } catch (err) { res.status(500).json({ success:false, message:err.message }); }
};

const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product || !product.isActive) return res.status(404).json({ success:false, message:'Product not found' });
    res.json({ success:true, product });
  } catch (err) { res.status(500).json({ success:false, message:err.message }); }
};

const createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ success:true, product });
  } catch (err) { res.status(400).json({ success:false, message:err.message }); }
};

const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new:true, runValidators:true });
    if (!product) return res.status(404).json({ success:false, message:'Product not found' });
    res.json({ success:true, product });
  } catch (err) { res.status(400).json({ success:false, message:err.message }); }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, { isActive:false }, { new:true });
    if (!product) return res.status(404).json({ success:false, message:'Product not found' });
    res.json({ success:true, message:'Product deactivated' });
  } catch (err) { res.status(500).json({ success:false, message:err.message }); }
};

module.exports = { getProducts, getProduct, createProduct, updateProduct, deleteProduct };
