const { Cart, Cart2 } = require('../models/Cart');
const { Product } = require('../models/Product');

class CartController {
  static async getCart(req, res) {
    try {
      const userId = req.params.userId;
      const cart = await Cart.findOne({ userId: userId });
      
      if (!cart) {
        return res.status(404).json({ error: 'Cart not found' });
      }
      
      res.json(cart);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: 'Server error' });
    }
  }
  
  static async addToCart(req, res) {
    try {
      const { userId, productId, quantity } = req.body;
      
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
      
      let cart = await Cart.findOne({ userId: userId });
      
      if (!cart) {
        cart = new Cart({
          userId,
          items: []
        });
      }
      
      // Check if item already exists
      const existingItemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
      if (existingItemIndex >= 0) {
        cart.items[existingItemIndex].quantity += quantity || 1;
        cart.items[existingItemIndex].price = product.price;
        cart.items[existingItemIndex].addedAt = Date.now();
      } else {
        cart.items.push({
          productId,
          quantity: quantity || 1,
          price: product.price,
          addedAt: Date.now()
        });
      }
      
      cart.updatedAt = Date.now();
      await cart.save();
      
      res.json(cart);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: 'Server error' });
    }
  }
  
  static async removeFromCart(req, res) {
    try {
      const { userId, productId } = req.body;
      
      const cart = await Cart.findOne({ userId: userId });
      
      if (!cart) {
        return res.status(404).json({ error: 'Cart not found' });
      }
      
      cart.items = cart.items.filter(item => item.productId.toString() !== productId);
      cart.updatedAt = Date.now();
      await cart.save();
      
      res.json(cart);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: 'Server error' });
    }
  }
  
  static async updateCartItem(req, res) {
    try {
      const { userId, productId, quantity } = req.body;
      
      const cart = await Cart.findOne({ userId: userId });
      
      if (!cart) {
        return res.status(404).json({ error: 'Cart not found' });
      }
      
      const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
      if (itemIndex >= 0) {
        if (quantity <= 0) {
          cart.items.splice(itemIndex, 1);
        } else {
          cart.items[itemIndex].quantity = quantity;
          cart.items[itemIndex].updatedAt = Date.now();
        }
      } else {
        return res.status(404).json({ error: 'Item not found in cart' });
      }
      
      cart.updatedAt = Date.now();
      await cart.save();
      
      res.json(cart);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: 'Server error' });
    }
  }
  
  static async clearCart(req, res) {
    try {
      const userId = req.params.userId;
      
      const cart = await Cart.findOne({ userId: userId });
      
      if (!cart) {
        return res.status(404).json({ error: 'Cart not found' });
      }
      
      cart.items = [];
      cart.updatedAt = Date.now();
      await cart.save();
      
      res.json({ message: 'Cart cleared successfully' });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: 'Server error' });
    }
  }
  
  static async getCartTotal(req, res) {
    try {
      const userId = req.params.userId;
      
      const cart = await Cart.findOne({ userId: userId });
      
      if (!cart) {
        return res.status(404).json({ error: 'Cart not found' });
      }
      
      const total = cart.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
      const itemCount = cart.items.reduce((count, item) => count + item.quantity, 0);
      
      res.json({
        total,
        itemCount,
        items: cart.items
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: 'Server error' });
    }
  }
  
  static async checkout(req, res) {
    try {
      const { userId, shippingAddress, paymentMethod } = req.body;
      
      const cart = await Cart.findOne({ userId: userId });
      
      if (!cart || cart.items.length === 0) {
        return res.status(400).json({ error: 'Cart is empty' });
      }
      
      const totalAmount = cart.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
      
      const orderData = {
        userId,
        products: cart.items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price
        })),
        totalAmount,
        shippingAddress,
        paymentMethod,
        status: 'pending',
        paymentStatus: 'pending'
      };
      
      // Clear the cart
      cart.items = [];
      cart.updatedAt = Date.now();
      await cart.save();
      
      res.json({
        message: 'Checkout successful',
        order: orderData,
        totalAmount
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: 'Server error' });
    }
  }
  
  static async getAbandonedCarts(req, res) {
    try {
      const days = req.query.days || 7;
      const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      
      const abandonedCarts = await Cart.find({
        updatedAt: { $lt: cutoffDate },
        'items.0': { $exists: true }
      });
      
      res.json(abandonedCarts);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: 'Server error' });
    }
  }
}

module.exports = CartController;