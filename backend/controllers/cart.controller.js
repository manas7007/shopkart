import mongoose from 'mongoose';
import Customer from '../models/customer.model.js';
import Product from '../models/product.model.js';

// Helper to populate customer cart with product details
const populateCart = async (customer) => {
  return await customer.populate({
    path: 'cart.product',
    select: 'name price image stock category',
  });
};

// @desc    Add product to cart or increment quantity
// @route   POST /cart/:productId
// @access  Protected
export const addToCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;
    const qtyToAdd = quantity ? Math.max(1, parseInt(quantity, 10)) : 1;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format',
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    const customer = await Customer.findById(req.user._id);

    const existingItemIndex = customer.cart.findIndex(
      (item) => item.product.toString() === productId
    );

    let newQuantity = qtyToAdd;
    if (existingItemIndex > -1) {
      newQuantity = customer.cart[existingItemIndex].quantity + qtyToAdd;
    }

    // Stock validation
    if (newQuantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock. Only ${product.stock} units available.`,
      });
    }

    if (existingItemIndex > -1) {
      customer.cart[existingItemIndex].quantity = newQuantity;
    } else {
      customer.cart.push({ product: productId, quantity: newQuantity });
    }

    await customer.save();
    await populateCart(customer);

    return res.status(200).json({
      success: true,
      message: 'Cart updated',
      cart: customer.cart,
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error updating cart',
    });
  }
};

// @desc    Get authenticated customer's cart
// @route   GET /cart
// @access  Protected
export const getCart = async (req, res) => {
  try {
    const customer = await Customer.findById(req.user._id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found',
      });
    }

    await populateCart(customer);

    // Calculate derived subtotal and total units for convenience
    let subtotal = 0;
    let totalUnits = 0;

    customer.cart.forEach((item) => {
      if (item.product) {
        subtotal += (item.product.price || 0) * item.quantity;
        totalUnits += item.quantity;
      }
    });

    return res.status(200).json({
      success: true,
      count: customer.cart.length,
      totalUnits,
      subtotal,
      cart: customer.cart,
    });
  } catch (error) {
    console.error('Get cart error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving cart',
    });
  }
};

// @desc    Update product quantity in cart
// @route   PATCH /cart/:productId
// @access  Protected
export const updateCartQuantity = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format',
      });
    }

    const numQty = parseInt(quantity, 10);
    if (isNaN(numQty) || numQty < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be a valid number of at least 1',
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    if (numQty > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Requested quantity exceeds available stock (${product.stock} units)`,
      });
    }

    const customer = await Customer.findById(req.user._id);
    const itemIndex = customer.cart.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Product not found in cart',
      });
    }

    customer.cart[itemIndex].quantity = numQty;
    await customer.save();
    await populateCart(customer);

    return res.status(200).json({
      success: true,
      message: 'Cart quantity updated',
      cart: customer.cart,
    });
  } catch (error) {
    console.error('Update cart quantity error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error updating cart quantity',
    });
  }
};

// @desc    Remove product from cart
// @route   DELETE /cart/:productId
// @access  Protected
export const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format',
      });
    }

    const customer = await Customer.findById(req.user._id);
    const initialCount = customer.cart.length;

    customer.cart = customer.cart.filter(
      (item) => item.product.toString() !== productId
    );

    if (customer.cart.length === initialCount) {
      return res.status(404).json({
        success: false,
        message: 'Product not in cart',
      });
    }

    await customer.save();
    await populateCart(customer);

    return res.status(200).json({
      success: true,
      message: 'Item removed from cart',
      cart: customer.cart,
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error removing item from cart',
    });
  }
};
