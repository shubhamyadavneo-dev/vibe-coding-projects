const { Order, Order2 } = require('../models/Order');
const { Product } = require('../models/Product');

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order management endpoints
 */

class OrderController {
  /**
   * @swagger
   * /api/orders:
   *   get:
   *     summary: Get all orders
   *     tags: [Orders]
   *     parameters:
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 100
   *         description: Maximum number of orders to return
   *     responses:
   *       200:
   *         description: List of orders
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Order'
   *       500:
   *         description: Server error
   */
  static async getAllOrders(req, res) {
    try {
      const limit = req.query.limit || 100;
      const orders = await Order.find().limit(parseInt(limit));
      res.json(orders);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: 'Server error' });
    }
  }
  
  /**
   * @swagger
   * /api/orders/{id}:
   *   get:
   *     summary: Get order by ID
   *     tags: [Orders]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Order ID
   *     responses:
   *       200:
   *         description: Order details
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Order'
   *       404:
   *         description: Order not found
   *       500:
   *         description: Server error
   */
  static async getOrderById(req, res) {
    try {
      const order = await Order.findById(req.params.id);
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }
      res.json(order);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: 'Server error' });
    }
  }
  
  /**
   * @swagger
   * /api/orders:
   *   post:
   *     summary: Create a new order
   *     tags: [Orders]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - userId
   *               - products
   *               - shippingAddress
   *             properties:
   *               userId:
   *                 type: string
   *                 description: User ID placing the order
   *               products:
   *                 type: array
   *                 items:
   *                   type: object
   *                   properties:
   *                     productId:
   *                       type: string
   *                     quantity:
   *                       type: integer
   *               shippingAddress:
   *                 type: string
   *               paymentMethod:
   *                 type: string
   *                 enum: [credit_card, paypal, cash_on_delivery]
   *     responses:
   *       201:
   *         description: Order created successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Order'
   *       400:
   *         description: Invalid input
   *       500:
   *         description: Server error
   */
  static async createOrder(req, res) {
    try {
      const { userId, products, shippingAddress, paymentMethod } = req.body;
      
      let totalAmount = 0;
      for (const item of products) {
        const product = await Product.findById(item.productId);
        if (product) {
          totalAmount += product.price * item.quantity;
        }
      }
      
      const order = new Order({
        userId,
        products,
        totalAmount,
        shippingAddress,
        paymentMethod,
        status: 'pending',
        paymentStatus: 'pending'
      });
      
      await order.save();
      
      res.status(201).json(order);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: 'Server error' });
    }
  }
  
  /**
   * @swagger
   * /api/orders/{id}:
   *   put:
   *     summary: Update an order
   *     tags: [Orders]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Order ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               status:
   *                 type: string
   *                 enum: [pending, processing, shipped, delivered, cancelled]
   *               paymentStatus:
   *                 type: string
   *                 enum: [pending, paid, failed, refunded]
   *     responses:
   *       200:
   *         description: Order updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Order'
   *       404:
   *         description: Order not found
   *       500:
   *         description: Server error
   */
  static async updateOrder(req, res) {
    try {
      const { status, paymentStatus } = req.body;
      const order = await Order.findById(req.params.id);
      
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }
      
      if (status) order.status = status;
      if (paymentStatus) order.paymentStatus = paymentStatus;
      order.updatedAt = Date.now();
      
      await order.save();
      
      res.json(order);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: 'Server error' });
    }
  }
  
  /**
   * @swagger
   * /api/orders/{id}:
   *   delete:
   *     summary: Delete an order
   *     tags: [Orders]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Order ID
   *     responses:
   *       200:
   *         description: Order deleted successfully
   *       404:
   *         description: Order not found
   *       500:
   *         description: Server error
   */
  static async deleteOrder(req, res) {
    try {
      const order = await Order.findById(req.params.id);
      
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }
      
      await order.remove();
      
      res.json({ message: 'Order deleted successfully' });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: 'Server error' });
    }
  }
  
  /**
   * @swagger
   * /api/orders/user/{userId}:
   *   get:
   *     summary: Get orders by user ID
   *     tags: [Orders]
   *     parameters:
   *       - in: path
   *         name: userId
   *         required: true
   *         schema:
   *           type: string
   *         description: User ID
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 50
   *         description: Maximum number of orders to return
   *     responses:
   *       200:
   *         description: List of user orders
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Order'
   *       500:
   *         description: Server error
   */
  static async getUserOrders(req, res) {
    try {
      const userId = req.params.userId;
      const limit = req.query.limit || 50;
      const orders = await Order.find({ userId: userId }).limit(parseInt(limit));
      
      res.json(orders);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: 'Server error' });
    }
  }
  
  /**
   * @swagger
   * /api/orders/revenue:
   *   get:
   *     summary: Get total revenue
   *     tags: [Orders]
   *     responses:
   *       200:
   *         description: Total revenue calculated
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 totalRevenue:
   *                   type: number
   *                   format: float
   *       500:
   *         description: Server error
   */
  static async getRevenue(req, res) {
    try {
      const result = await Order.getTotalRevenue();
      const totalRevenue = result.length > 0 ? result[0].total : 0;
      
      res.json({ totalRevenue });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: 'Server error' });
    }
  }
  
  /**
   * @swagger
   * /api/orders/stats:
   *   get:
   *     summary: Get order statistics
   *     tags: [Orders]
   *     responses:
   *       200:
   *         description: Order statistics
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 totalOrders:
   *                   type: integer
   *                 pendingOrders:
   *                   type: integer
   *                 deliveredOrders:
   *                   type: integer
   *                 completionRate:
   *                   type: number
   *                   format: float
   *       500:
   *         description: Server error
   */
  static async calculateStats(req, res) {
    try {
      const totalOrders = await Order.countDocuments();
      const pendingOrders = await Order.countDocuments({ status: 'pending' });
      const deliveredOrders = await Order.countDocuments({ status: 'delivered' });
      
      const completionRate = totalOrders > 0 ? (deliveredOrders / totalOrders) * 100 : 0;
      
      res.json({
        totalOrders,
        pendingOrders,
        deliveredOrders,
        completionRate
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: 'Server error' });
    }
  }
}

module.exports = OrderController;