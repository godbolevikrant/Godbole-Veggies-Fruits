const Product = require('../models/Product');

exports.getProducts = async (req, res, next) => {
  try {
    const products = await Product.find().lean();
    res.json(products);
  } catch (err) {
    next(err);
  }
};

exports.createProduct = async (req, res, next) => {
  try {
    const { name, price } = req.body;
    if (!name || typeof name !== 'string') {
      return res.status(400).json({ success: false, error: 'name is required' });
    }
    if (price == null || typeof price !== 'number' || price < 0) {
      return res.status(400).json({ success: false, error: 'price must be a non-negative number' });
    }
    const product = new Product({ name, price });
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
};

exports.updateProduct = async (req, res, next) => {
  try {
    const { name, price } = req.body;
    const update = {};
    if (name != null) {
      if (typeof name !== 'string' || name.trim() === '') return res.status(400).json({ success: false, error: 'invalid name' });
      update.name = name;
    }
    if (price != null) {
      if (typeof price !== 'number' || price < 0) return res.status(400).json({ success: false, error: 'invalid price' });
      update.price = price;
    }
    const product = await Product.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!product) return res.status(404).json({ success: false, error: 'Product not found' });
    res.json(product);
  } catch (err) {
    next(err);
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, error: 'Product not found' });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};


