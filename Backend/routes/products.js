const express = require('express');
const {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productsController');
const router = express.Router();

// Get all products
router.get('/', getProducts);

// Add a product
router.post('/', createProduct);

// Update a product
router.put('/:id', updateProduct);

// Delete a product
router.delete('/:id', deleteProduct);

module.exports = router;
