import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import jwt from 'jsonwebtoken';
import { storage } from "./storage";
import { 
  insertUserSchema, loginSchema, insertProductSchema, insertCategorySchema,
  insertOrderSchema, insertOrderItemSchema, insertReviewSchema
} from "@shared/schema";
import { ZodError } from "zod";

// JWT secret key
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Authentication middleware
const authenticate = async (req: Request, res: Response, next: Function) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    
    const user = await storage.getUser(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: 'Invalid authentication token' });
    }
    
    // Attach user to request object
    (req as any).user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid authentication token' });
  }
};

// Admin authorization middleware
const authorizeAdmin = (req: Request, res: Response, next: Function) => {
  const user = (req as any).user;
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // ============================
  // Payment Processing (Simulated)
  // ============================
  
  app.post('/api/payment/process', authenticate, async (req, res) => {
    try {
      const { amount, paymentMethod, cardDetails } = req.body;
      
      if (!amount || !paymentMethod) {
        return res.status(400).json({ 
          success: false, 
          message: 'Amount and payment method are required' 
        });
      }
      
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Always return success in this simulated environment
      // In a real implementation, this would connect to Razorpay or another payment gateway
      
      return res.json({
        success: true,
        paymentId: `sim_${Math.random().toString(36).substring(2, 15)}`,
        message: "Payment processed successfully",
        transactionDetails: {
          amount: Number(amount),
          currency: "INR",
          paymentMethod,
          timestamp: new Date().toISOString(),
          status: "completed"
        }
      });
    } catch (error) {
      console.error("Payment processing error:", error);
      res.status(500).json({ 
        success: false, 
        message: 'Payment processing failed' 
      });
    }
  });
  
  // ============================
  // Authentication routes
  // ============================
  
  // Register new user
  app.post('/api/auth/register', async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUserByEmail = await storage.getUserByEmail(userData.email);
      if (existingUserByEmail) {
        return res.status(400).json({ message: 'Email already registered' });
      }
      
      const existingUserByUsername = await storage.getUserByUsername(userData.username);
      if (existingUserByUsername) {
        return res.status(400).json({ message: 'Username already taken' });
      }
      
      // Create user
      const user = await storage.createUser(userData);
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      
      // Generate JWT token
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
      
      res.status(201).json({ user: userWithoutPassword, token });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: 'Validation error', errors: error.errors });
      }
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  // Login user
  app.post('/api/auth/login', async (req, res) => {
    try {
      const loginData = loginSchema.parse(req.body);
      
      const user = await storage.validateUser(loginData);
      if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      
      // Generate JWT token
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
      
      res.json({ user: userWithoutPassword, token });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: 'Validation error', errors: error.errors });
      }
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  // Get current user profile
  app.get('/api/auth/me', authenticate, async (req, res) => {
    const user = (req as any).user;
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  });
  
  // ============================
  // Product routes
  // ============================
  
  // Get all products with filtering and pagination
  app.get('/api/products', async (req, res) => {
    try {
      const {
        limit = 10,
        page = 1,
        category,
        search,
        featured,
        new: isNew,
        onSale,
        minPrice,
        maxPrice,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;
      
      // Convert query params to appropriate types
      const options: any = {
        limit: Number(limit),
        offset: (Number(page) - 1) * Number(limit),
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'asc' | 'desc'
      };
      
      if (category) {
        const categoryObj = await storage.getCategoryBySlug(category as string);
        if (categoryObj) {
          options.categoryId = categoryObj.id;
        }
      }
      
      if (search) options.search = search as string;
      if (featured) options.isFeatured = featured === 'true';
      if (isNew) options.isNew = isNew === 'true';
      if (onSale) options.isOnSale = onSale === 'true';
      if (minPrice) options.minPrice = Number(minPrice);
      if (maxPrice) options.maxPrice = Number(maxPrice);
      
      // Get products and total count
      const products = await storage.getProducts(options);
      const total = await storage.getProductCount({
        categoryId: options.categoryId,
        search: options.search,
        isFeatured: options.isFeatured,
        isNew: options.isNew,
        isOnSale: options.isOnSale,
        minPrice: options.minPrice,
        maxPrice: options.maxPrice
      });
      
      res.json({
        products,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit))
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  // Get featured products
  app.get('/api/products/featured', async (req, res) => {
    try {
      const featuredProducts = await storage.getProducts({ isFeatured: true, limit: 8 });
      res.json(featuredProducts);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  // Get new arrivals
  app.get('/api/products/new-arrivals', async (req, res) => {
    try {
      const newArrivals = await storage.getProducts({ isNew: true, limit: 8 });
      res.json(newArrivals);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  // Get a single product by slug
  app.get('/api/products/:slug', async (req, res) => {
    try {
      const { slug } = req.params;
      const product = await storage.getProductBySlug(slug);
      
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  // Create a new product (admin only)
  app.post('/api/products', authenticate, authorizeAdmin, async (req, res) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(productData);
      res.status(201).json(product);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: 'Validation error', errors: error.errors });
      }
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  // Update a product (admin only)
  app.put('/api/products/:id', authenticate, authorizeAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const productData = req.body;
      
      const product = await storage.updateProduct(Number(id), productData);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      
      res.json(product);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: 'Validation error', errors: error.errors });
      }
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  // Delete a product (admin only)
  app.delete('/api/products/:id', authenticate, authorizeAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteProduct(Number(id));
      
      if (!deleted) {
        return res.status(404).json({ message: 'Product not found' });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  // ============================
  // Category routes
  // ============================
  
  // Get all categories
  app.get('/api/categories', async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  // Get a single category by slug
  app.get('/api/categories/:slug', async (req, res) => {
    try {
      const { slug } = req.params;
      const category = await storage.getCategoryBySlug(slug);
      
      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }
      
      res.json(category);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  // Create a new category (admin only)
  app.post('/api/categories', authenticate, authorizeAdmin, async (req, res) => {
    try {
      const categoryData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(categoryData);
      res.status(201).json(category);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: 'Validation error', errors: error.errors });
      }
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  // Update a category (admin only)
  app.put('/api/categories/:id', authenticate, authorizeAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const categoryData = req.body;
      
      const category = await storage.updateCategory(Number(id), categoryData);
      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }
      
      res.json(category);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: 'Validation error', errors: error.errors });
      }
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  // Delete a category (admin only)
  app.delete('/api/categories/:id', authenticate, authorizeAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteCategory(Number(id));
      
      if (!deleted) {
        return res.status(404).json({ message: 'Category not found' });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  // ============================
  // Cart routes
  // ============================
  
  // Get user's cart
  app.get('/api/cart', authenticate, async (req, res) => {
    try {
      const user = (req as any).user;
      const cart = await storage.getCartWithItems(user.id);
      
      if (!cart) {
        // Return empty cart if none exists
        return res.json({ items: [], totalItems: 0, totalPrice: 0 });
      }
      
      // Calculate totals
      const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
      const totalPrice = cart.items.reduce((sum, item) => sum + (Number(item.product.price) * item.quantity), 0);
      
      res.json({ items: cart.items, totalItems, totalPrice });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  // Add item to cart
  app.post('/api/cart/items', authenticate, async (req, res) => {
    try {
      const user = (req as any).user;
      const { productId, quantity } = req.body;
      
      if (!productId || !quantity || quantity < 1) {
        return res.status(400).json({ message: 'Product ID and quantity are required' });
      }
      
      // Check if product exists
      const product = await storage.getProduct(Number(productId));
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      
      // Add to cart
      const cartItem = await storage.addToCart(user.id, Number(productId), Number(quantity));
      
      // Get updated cart
      const cart = await storage.getCartWithItems(user.id);
      
      // Calculate totals
      const totalItems = cart!.items.reduce((sum, item) => sum + item.quantity, 0);
      const totalPrice = cart!.items.reduce((sum, item) => sum + (Number(item.product.price) * item.quantity), 0);
      
      res.status(201).json({ items: cart!.items, totalItems, totalPrice });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  // Update cart item quantity
  app.put('/api/cart/items/:id', authenticate, async (req, res) => {
    try {
      const user = (req as any).user;
      const { id } = req.params;
      const { quantity } = req.body;
      
      if (!quantity || quantity < 1) {
        return res.status(400).json({ message: 'Quantity must be at least 1' });
      }
      
      // Get cart to verify ownership
      const cart = await storage.getCartByUser(user.id);
      if (!cart) {
        return res.status(404).json({ message: 'Cart not found' });
      }
      
      // Update cart item
      const updatedItem = await storage.updateCartItem(Number(id), Number(quantity));
      if (!updatedItem) {
        return res.status(404).json({ message: 'Cart item not found' });
      }
      
      // Get updated cart
      const updatedCart = await storage.getCartWithItems(user.id);
      
      // Calculate totals
      const totalItems = updatedCart!.items.reduce((sum, item) => sum + item.quantity, 0);
      const totalPrice = updatedCart!.items.reduce((sum, item) => sum + (Number(item.product.price) * item.quantity), 0);
      
      res.json({ items: updatedCart!.items, totalItems, totalPrice });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  // Remove item from cart
  app.delete('/api/cart/items/:id', authenticate, async (req, res) => {
    try {
      const user = (req as any).user;
      const { id } = req.params;
      
      // Get cart to verify ownership
      const cart = await storage.getCartByUser(user.id);
      if (!cart) {
        return res.status(404).json({ message: 'Cart not found' });
      }
      
      // Remove from cart
      const deleted = await storage.removeFromCart(Number(id));
      if (!deleted) {
        return res.status(404).json({ message: 'Cart item not found' });
      }
      
      // Get updated cart
      const updatedCart = await storage.getCartWithItems(user.id);
      
      // If cart is now empty
      if (!updatedCart || updatedCart.items.length === 0) {
        return res.json({ items: [], totalItems: 0, totalPrice: 0 });
      }
      
      // Calculate totals
      const totalItems = updatedCart.items.reduce((sum, item) => sum + item.quantity, 0);
      const totalPrice = updatedCart.items.reduce((sum, item) => sum + (Number(item.product.price) * item.quantity), 0);
      
      res.json({ items: updatedCart.items, totalItems, totalPrice });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  // ============================
  // Wishlist routes
  // ============================
  
  // Get user's wishlist
  app.get('/api/wishlist', authenticate, async (req, res) => {
    try {
      const user = (req as any).user;
      const wishlist = await storage.getWishlistWithItems(user.id);
      
      if (!wishlist) {
        // Return empty wishlist if none exists
        return res.json({ items: [] });
      }
      
      res.json({ items: wishlist.items });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  // Add item to wishlist
  app.post('/api/wishlist/items', authenticate, async (req, res) => {
    try {
      const user = (req as any).user;
      const { productId } = req.body;
      
      if (!productId) {
        return res.status(400).json({ message: 'Product ID is required' });
      }
      
      // Check if product exists
      const product = await storage.getProduct(Number(productId));
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      
      // Add to wishlist
      const wishlistItem = await storage.addToWishlist(user.id, Number(productId));
      
      // Get updated wishlist
      const wishlist = await storage.getWishlistWithItems(user.id);
      
      res.status(201).json({ items: wishlist!.items });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  // Remove item from wishlist
  app.delete('/api/wishlist/items/:id', authenticate, async (req, res) => {
    try {
      const user = (req as any).user;
      const { id } = req.params;
      
      // Get wishlist to verify ownership
      const wishlist = await storage.getWishlistByUser(user.id);
      if (!wishlist) {
        return res.status(404).json({ message: 'Wishlist not found' });
      }
      
      // Remove from wishlist
      const deleted = await storage.removeFromWishlist(Number(id));
      if (!deleted) {
        return res.status(404).json({ message: 'Wishlist item not found' });
      }
      
      // Get updated wishlist
      const updatedWishlist = await storage.getWishlistWithItems(user.id);
      
      // If wishlist is now empty
      if (!updatedWishlist || updatedWishlist.items.length === 0) {
        return res.json({ items: [] });
      }
      
      res.json({ items: updatedWishlist.items });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  // ============================
  // Order routes
  // ============================
  
  // Get user's orders
  app.get('/api/orders', authenticate, async (req, res) => {
    try {
      const user = (req as any).user;
      const orders = await storage.getOrdersByUser(user.id);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  // Get a single order
  app.get('/api/orders/:id', authenticate, async (req, res) => {
    try {
      const user = (req as any).user;
      const { id } = req.params;
      
      const order = await storage.getOrder(Number(id));
      
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
      
      // Only admin or order owner can access
      if (user.role !== 'admin' && order.userId !== user.id) {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  // Create a new order
  app.post('/api/orders', authenticate, async (req, res) => {
    try {
      const user = (req as any).user;
      const { shippingAddress, paymentMethod, items } = req.body;
      
      if (!shippingAddress || !paymentMethod || !items || !items.length) {
        return res.status(400).json({ message: 'Missing required order information' });
      }
      
      // Calculate total from items
      let total = 0;
      const orderItems = [];
      
      for (const item of items) {
        const product = await storage.getProduct(item.productId);
        if (!product) {
          return res.status(400).json({ message: `Product with ID ${item.productId} not found` });
        }
        
        total += Number(product.price) * item.quantity;
        // We don't need to specify orderId here - it will be added in the storage implementation
        // when the order is created with its ID
        orderItems.push({
          productId: Number(item.productId),
          quantity: Number(item.quantity),
          price: product.price,
          orderId: 0 // This will be overwritten in the storage implementation
        });
      }
      
      // Create order
      const order = await storage.createOrder(
        {
          userId: user.id,
          total: String(total),
          shippingAddress,
          paymentMethod,
          paymentStatus: 'pending',
          status: 'pending'
        },
        orderItems
      );
      
      res.status(201).json(order);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  // Update order status (admin only)
  app.put('/api/orders/:id/status', authenticate, authorizeAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      if (!status) {
        return res.status(400).json({ message: 'Status is required' });
      }
      
      const order = await storage.updateOrderStatus(Number(id), status);
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
      
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  // Get all orders (admin only)
  app.get('/api/admin/orders', authenticate, authorizeAdmin, async (req, res) => {
    try {
      const { 
        limit = 10, 
        page = 1,
        status
      } = req.query;
      
      const options: any = {
        limit: Number(limit),
        offset: (Number(page) - 1) * Number(limit)
      };
      
      if (status) options.status = status;
      
      const orders = await storage.getAllOrders(options);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  // ============================
  // Review routes
  // ============================
  
  // Get reviews for a product
  app.get('/api/products/:productId/reviews', async (req, res) => {
    try {
      const { productId } = req.params;
      
      // Check if product exists
      const product = await storage.getProduct(Number(productId));
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      
      const reviews = await storage.getProductReviews(Number(productId));
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  // Create a review for a product
  app.post('/api/products/:productId/reviews', authenticate, async (req, res) => {
    try {
      const user = (req as any).user;
      const { productId } = req.params;
      const { rating, comment } = req.body;
      
      if (!rating) {
        return res.status(400).json({ message: 'Rating is required' });
      }
      
      // Check if product exists
      const product = await storage.getProduct(Number(productId));
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      
      const review = await storage.createReview({
        productId: Number(productId),
        userId: user.id,
        rating,
        comment
      });
      
      res.status(201).json(review);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  // Create HTTP server
  const httpServer = createServer(app);
  
  return httpServer;
}
