import express, { Response, Request, NextFunction } from "express";
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./db";
import { PrismaStorage } from "./prisma-storage";
import { 
  insertUserSchema, 
  insertProductSchema, 
  insertCartItemSchema, 
  insertOrderSchema,
  insertOrderItemSchema
} from "@shared/schema";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "my-super-secret-key-that-should-be-in-env";

// Auth middleware
const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Forbidden" });
    }
    
    (req as any).user = decoded;
    next();
  });
};

// Admin middleware
const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if ((req as any).user?.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  const router = express.Router();

  // Auth routes
  router.post("/auth/register", async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      // Create user
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
        role: userData.role || "user"
      });
      
      // Generate token
      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: "24h" }
      );
      
      // Return user without password
      const { password, ...userWithoutPassword } = user;
      res.status(201).json({ 
        user: userWithoutPassword, 
        token 
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  router.post("/auth/login", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      
      // Find user
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Generate token
      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: "24h" }
      );
      
      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      res.json({ 
        user: userWithoutPassword, 
        token 
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // User routes
  router.get("/users/me", authenticateToken, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Return user without password
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Product routes
  router.get("/products", async (req: Request, res: Response) => {
    try {
      const category = req.query.category as string | undefined;
      
      const products = category
        ? await storage.getProductsByCategory(category)
        : await storage.getProducts();
        
      res.json(products);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  router.get("/products/:id", async (req: Request, res: Response) => {
    try {
      const productId = parseInt(req.params.id);
      const product = await storage.getProduct(productId);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(product);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  router.post("/products", authenticateToken, isAdmin, async (req: Request, res: Response) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(productData);
      
      res.status(201).json(product);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  router.put("/products/:id", authenticateToken, isAdmin, async (req: Request, res: Response) => {
    try {
      const productId = parseInt(req.params.id);
      const productData = insertProductSchema.partial().parse(req.body);
      
      const product = await storage.updateProduct(productId, productData);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(product);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  router.delete("/products/:id", authenticateToken, isAdmin, async (req: Request, res: Response) => {
    try {
      const productId = parseInt(req.params.id);
      const result = await storage.deleteProduct(productId);
      
      if (!result) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Cart routes
  router.get("/cart", authenticateToken, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const cartItems = await storage.getCartItems(userId);
      
      res.json(cartItems);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  router.post("/cart", authenticateToken, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const cartItemData = insertCartItemSchema.parse({ 
        ...req.body, 
        userId 
      });
      
      const cartItem = await storage.addCartItem(cartItemData);
      
      res.status(201).json(cartItem);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  router.put("/cart/:id", authenticateToken, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const cartItemId = parseInt(req.params.id);
      const { quantity } = req.body;
      
      // Make sure cart item belongs to user
      const cartItems = await storage.getCartItems(userId);
      const userOwnItem = cartItems.some(item => item.id === cartItemId);
      
      if (!userOwnItem) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const cartItem = await storage.updateCartItem(cartItemId, quantity);
      
      if (!cartItem) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      
      res.json(cartItem);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  router.delete("/cart/:id", authenticateToken, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const cartItemId = parseInt(req.params.id);
      
      // Make sure cart item belongs to user
      const cartItems = await storage.getCartItems(userId);
      const userOwnItem = cartItems.some(item => item.id === cartItemId);
      
      if (!userOwnItem) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const result = await storage.removeCartItem(cartItemId);
      
      if (!result) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  router.delete("/cart", authenticateToken, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      await storage.clearCart(userId);
      
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Order routes
  router.get("/orders", authenticateToken, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const isAdminUser = (req as any).user.role === "admin";
      
      const orders = isAdminUser
        ? await storage.getAllOrders()
        : await storage.getOrders(userId);
        
      res.json(orders);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  router.get("/orders/:id", authenticateToken, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const isAdminUser = (req as any).user.role === "admin";
      const orderId = parseInt(req.params.id);
      
      const order = await storage.getOrder(orderId);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Make sure order belongs to user or user is admin
      if (!isAdminUser && order.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      res.json(order);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  router.post("/orders", authenticateToken, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      
      const { shippingAddress, items } = req.body;
      
      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: "Order must have at least one item" });
      }
      
      // Get cart items to calculate total
      const cartItems = await storage.getCartItems(userId);
      
      if (cartItems.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
      }
      
      // Calculate total
      const total = cartItems.reduce(
        (sum, item) => sum + (item.product.price * item.quantity),
        0
      );
      
      // Create order
      const orderData = insertOrderSchema.parse({
        userId,
        status: "pending",
        total,
        shippingAddress
      });
      
      // Create order items
      const orderItemsData = cartItems.map(item => 
        insertOrderItemSchema.parse({
          productId: item.productId,
          quantity: item.quantity,
          price: item.product.price,
          orderId: 0 // Will be set in storage
        })
      );
      
      const order = await storage.createOrder(orderData, orderItemsData);
      
      // Clear cart
      await storage.clearCart(userId);
      
      res.status(201).json(order);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  router.put("/orders/:id/status", authenticateToken, isAdmin, async (req: Request, res: Response) => {
    try {
      const orderId = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }
      
      const order = await storage.updateOrderStatus(orderId, status);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      res.json(order);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });
  
  // Route to reset and reseed product data (admin only)
  router.post("/admin/reset-products", authenticateToken, isAdmin, async (req: Request, res: Response) => {
    try {
      if (storage instanceof PrismaStorage) {
        await (storage as PrismaStorage).resetProducts();
        await (storage as PrismaStorage).seedData();
        res.json({ message: "Products have been reset and reseeded successfully" });
      } else {
        res.status(400).json({ error: "This operation is only supported with PrismaStorage" });
      }
    } catch (error: any) {
      console.error("Error in reset-products:", error);
      res.status(500).json({ error: "Failed to reset products" });
    }
  });

  // Mount API routes
  app.use("/api", router);

  const httpServer = createServer(app);
  return httpServer;
}
