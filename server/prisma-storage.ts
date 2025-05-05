import { PrismaClient } from "@prisma/client";
import { IStorage } from "./storage";
import {
  User,
  InsertUser,
  UpdateUserProfile,
  Product,
  InsertProduct,
  CartItem,
  InsertCartItem,
  CartItemWithProduct,
  Order,
  InsertOrder,
  OrderItem,
  InsertOrderItem,
  OrderWithItems
} from "@shared/schema";
import bcrypt from "bcryptjs";

export class PrismaStorage implements IStorage {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient({
      log: ['query', 'info', 'warn', 'error'],
    });
    console.log("PrismaStorage initialized with connection to MongoDB");
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: String(id) }
      });
      return user ? this.mapPrismaUserToUser(user) : undefined;
    } catch (error) {
      console.error("Error in getUser:", error);
      return undefined;
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email }
      });
      return user ? this.mapPrismaUserToUser(user) : undefined;
    } catch (error) {
      console.error("Error in getUserByEmail:", error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { username }
      });
      return user ? this.mapPrismaUserToUser(user) : undefined;
    } catch (error) {
      console.error("Error in getUserByUsername:", error);
      return undefined;
    }
  }

  async createUser(userData: InsertUser): Promise<User> {
    try {
      const user = await this.prisma.user.create({
        data: {
          username: userData.username,
          email: userData.email,
          password: userData.password,
          role: userData.role || "user",
          fullName: null,
          phone: null,
          address: null,
          city: null,
          state: null,
          zipCode: null,
          country: "United States", 
          preferredPaymentMethod: "card"
        }
      });
      return this.mapPrismaUserToUser(user);
    } catch (error) {
      console.error("Error in createUser:", error);
      throw error;
    }
  }
  
  async updateUserProfile(id: number, profileData: Partial<UpdateUserProfile>): Promise<User | undefined> {
    try {
      // Get the MongoDB ObjectId for the user
      const userObjectId = await this.getUserObjectId(id);
      
      if (!userObjectId) {
        console.error(`No user found with ID ${id}`);
        return undefined;
      }
      
      const user = await this.prisma.user.update({
        where: { id: userObjectId },
        data: profileData
      });
      
      return this.mapPrismaUserToUser(user);
    } catch (error) {
      console.error("Error in updateUserProfile:", error);
      return undefined;
    }
  }

  // Product operations
  async getProducts(): Promise<Product[]> {
    try {
      const products = await this.prisma.product.findMany();
      return products.map(product => this.mapPrismaProductToProduct(product));
    } catch (error) {
      console.error("Error in getProducts:", error);
      return [];
    }
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    try {
      const products = await this.prisma.product.findMany({
        where: { category }
      });
      return products.map(product => this.mapPrismaProductToProduct(product));
    } catch (error) {
      console.error("Error in getProductsByCategory:", error);
      return [];
    }
  }

  async getProduct(id: number): Promise<Product | undefined> {
    try {
      const product = await this.prisma.product.findUnique({
        where: { id: String(id) }
      });
      return product ? this.mapPrismaProductToProduct(product) : undefined;
    } catch (error) {
      console.error("Error in getProduct:", error);
      return undefined;
    }
  }

  async createProduct(productData: InsertProduct): Promise<Product> {
    try {
      const product = await this.prisma.product.create({
        data: {
          name: productData.name,
          description: productData.description,
          price: productData.price,
          imageUrl: productData.imageUrl,
          category: productData.category,
          rating: productData.rating || 0,
          stock: productData.stock || 0
        }
      });
      return this.mapPrismaProductToProduct(product);
    } catch (error) {
      console.error("Error in createProduct:", error);
      throw error;
    }
  }

  async updateProduct(id: number, productData: Partial<InsertProduct>): Promise<Product | undefined> {
    try {
      // Handle null rating as 0 to avoid Prisma type error
      const data = {
        ...productData,
        rating: productData.rating === null ? 0 : productData.rating
      };
      
      const product = await this.prisma.product.update({
        where: { id: String(id) },
        data
      });
      return this.mapPrismaProductToProduct(product);
    } catch (error) {
      console.error("Error in updateProduct:", error);
      return undefined;
    }
  }

  async deleteProduct(id: number): Promise<boolean> {
    try {
      const productId = await this.getProductObjectId(id);
      await this.prisma.product.delete({
        where: { id: productId }
      });
      return true;
    } catch (error) {
      console.error("Error in deleteProduct:", error);
      return false;
    }
  }

  // Cart operations
  async getCartItems(userId: number): Promise<CartItemWithProduct[]> {
    try {
      // MongoDB requires a valid ObjectId format (12 bytes)
      // For safety, we'll catch issues and return an empty array rather than failing
      let cartItems: any[] = [];
      
      try {
        // Try to fetch cart items, but handle errors gracefully
        cartItems = await this.prisma.cartItem.findMany({
          include: {
            product: true // This ensures we get the joined product data
          }
        });
        
        // Filter by userId after retrieval to avoid ObjectId errors
        cartItems = cartItems.filter(item => {
          try {
            return parseInt(item.userId) === userId;
          } catch (e) {
            return false;
          }
        });
      } catch (mongoError) {
        console.error("MongoDB error in getCartItems:", mongoError);
        // Return empty array, handled below
      }
      
      // Map cart items to our schema format
      return cartItems.map(item => {
        // We check if item has the product property before accessing it
        if (!item.product) {
          console.error(`No product found for cart item with productId ${item.productId}`);
          // Return a partially complete cart item without product data
          return {
            id: parseInt(item.id),
            userId: parseInt(item.userId),
            productId: parseInt(item.productId),
            quantity: item.quantity,
            createdAt: item.createdAt,
            product: {
              id: parseInt(item.productId),
              name: "Unknown Product",
              description: "",
              price: 0,
              imageUrl: "",
              category: "",
              rating: 0,
              stock: 0,
              createdAt: new Date()
            }
          };
        }
        
        // If we have the product, we return the full cart item with product data
        return {
          id: parseInt(item.id),
          userId: parseInt(item.userId),
          productId: parseInt(item.productId),
          quantity: item.quantity,
          createdAt: item.createdAt,
          product: this.mapPrismaProductToProduct(item.product)
        };
      });
    } catch (error) {
      console.error("Error in getCartItems:", error);
      return [];
    }
  }

  async addCartItem(cartItemData: InsertCartItem): Promise<CartItem> {
    try {
      // First, try to get the user and product to ensure they exist
      const user = await this.prisma.user.findUnique({
        where: { id: await this.getUserObjectId(cartItemData.userId) }
      });
      
      const product = await this.prisma.product.findUnique({
        where: { id: await this.getProductObjectId(cartItemData.productId) }
      });
      
      if (!user || !product) {
        console.error("User or product not found when adding to cart");
        throw new Error("User or product not found");
      }
      
      // Get the validated object IDs
      const userObjectId = user.id;
      const productObjectId = product.id;
      
      // Check if cart item already exists
      const existingCartItem = await this.prisma.cartItem.findFirst({
        where: {
          userId: userObjectId,
          productId: productObjectId
        }
      });

      let cartItem;
      if (existingCartItem) {
        // Update quantity
        cartItem = await this.prisma.cartItem.update({
          where: { id: existingCartItem.id },
          data: { quantity: existingCartItem.quantity + (cartItemData.quantity || 1) }
        });
      } else {
        // Create new cart item
        cartItem = await this.prisma.cartItem.create({
          data: {
            userId: userObjectId,
            productId: productObjectId,
            quantity: cartItemData.quantity || 1
          }
        });
      }

      return {
        id: parseInt(cartItem.id),
        userId: parseInt(cartItem.userId),
        productId: parseInt(cartItem.productId),
        quantity: cartItem.quantity,
        createdAt: cartItem.createdAt
      };
    } catch (error) {
      console.error("Error in addCartItem:", error);
      throw error;
    }
  }

  async updateCartItem(id: number, quantity: number): Promise<CartItem | undefined> {
    try {
      const cartItem = await this.prisma.cartItem.update({
        where: { id: String(id) },
        data: { quantity }
      });

      return {
        id: parseInt(cartItem.id),
        userId: parseInt(cartItem.userId),
        productId: parseInt(cartItem.productId),
        quantity: cartItem.quantity,
        createdAt: cartItem.createdAt
      };
    } catch (error) {
      console.error("Error in updateCartItem:", error);
      return undefined;
    }
  }

  async removeCartItem(id: number): Promise<boolean> {
    try {
      await this.prisma.cartItem.delete({
        where: { id: String(id) }
      });
      return true;
    } catch (error) {
      console.error("Error in removeCartItem:", error);
      return false;
    }
  }

  async clearCart(userId: number): Promise<boolean> {
    try {
      console.log("Clearing cart for user ID:", userId);
      
      // Find the actual MongoDB user document with the matching ID
      const users = await this.prisma.user.findMany();
      const user = users.find(u => {
        try {
          return parseInt(u.id) === parseInt(userId.toString());
        } catch (e) {
          return false;
        }
      });

      if (!user) {
        console.error(`User with ID ${userId} not found for cart clearing`);
        return false;
      }

      console.log("Found MongoDB user with ID:", user.id);
      
      // Delete cart items using the valid MongoDB ObjectId
      await this.prisma.cartItem.deleteMany({
        where: { userId: user.id }
      });
      
      console.log("Cart cleared successfully");
      return true;
    } catch (error) {
      console.error("Error in clearCart:", error);
      return false;
    }
  }

  // Order operations
  async getOrders(userId: number): Promise<Order[]> {
    try {
      // Find the actual MongoDB user document
      const users = await this.prisma.user.findMany();
      const user = users.find(u => {
        try {
          return parseInt(u.id) === parseInt(userId.toString());
        } catch (e) {
          return false;
        }
      });
      
      if (!user) {
        console.error(`User with ID ${userId} not found for getOrders`);
        return [];
      }
      
      const orders = await this.prisma.order.findMany({
        where: { userId: user.id }
      });
      
      return orders.map(order => ({
        id: parseInt(order.id),
        userId: parseInt(order.userId),
        status: order.status,
        total: order.total,
        shippingAddress: order.shippingAddress,
        paymentMethod: order.paymentMethod || "credit-card",
        createdAt: order.createdAt
      }));
    } catch (error) {
      console.error("Error in getOrders:", error);
      return [];
    }
  }

  async getAllOrders(): Promise<Order[]> {
    try {
      const orders = await this.prisma.order.findMany();
      
      return orders.map(order => ({
        id: parseInt(order.id),
        userId: parseInt(order.userId),
        status: order.status,
        total: order.total,
        shippingAddress: order.shippingAddress,
        paymentMethod: order.paymentMethod || "credit-card",
        createdAt: order.createdAt
      }));
    } catch (error) {
      console.error("Error in getAllOrders:", error);
      return [];
    }
  }

  async getOrder(id: number): Promise<OrderWithItems | undefined> {
    try {
      console.log(`Looking for order with ID: ${id}`);
      
      // Find all orders and pick the one with matching ID
      const orders = await this.prisma.order.findMany({
        include: {
          items: {
            include: { product: true }
          }
        }
      });
      
      // Find the order with matching numeric ID
      const order = orders.find(o => {
        try {
          return parseInt(o.id) === parseInt(id.toString());
        } catch (e) {
          return false;
        }
      });
      
      console.log(`Found order:`, order ? `ID ${order.id}` : 'None');
      
      if (!order) return undefined;

      return {
        id: parseInt(order.id),
        userId: parseInt(order.userId),
        status: order.status,
        total: order.total,
        shippingAddress: order.shippingAddress,
        paymentMethod: order.paymentMethod || "credit-card",
        createdAt: order.createdAt,
        items: order.items.map(item => ({
          id: parseInt(item.id),
          orderId: parseInt(item.orderId),
          productId: parseInt(item.productId),
          quantity: item.quantity,
          price: item.price,
          createdAt: item.createdAt,
          product: this.mapPrismaProductToProduct(item.product)
        }))
      };
    } catch (error) {
      console.error("Error in getOrder:", error);
      return undefined;
    }
  }

  async createOrder(orderData: InsertOrder, items: InsertOrderItem[]): Promise<Order> {
    try {
      console.log("Creating order for user ID:", orderData.userId);
      
      // Find the actual MongoDB user document
      const users = await this.prisma.user.findMany();
      
      // Find a user that matches our expected ID
      const user = users.find(u => {
        try {
          return parseInt(u.id) === parseInt(orderData.userId.toString());
        } catch (e) {
          return false;
        }
      });

      if (!user) {
        throw new Error(`User with id ${orderData.userId} not found`);
      }

      console.log("Found MongoDB user with ID:", user.id);
      
      // Create order
      const order = await this.prisma.order.create({
        data: {
          userId: user.id, // This is a valid MongoDB ObjectId
          status: orderData.status,
          total: orderData.total,
          shippingAddress: orderData.shippingAddress,
          paymentMethod: orderData.paymentMethod || "credit-card",
          items: {
            create: await Promise.all(items.map(async item => {
              // Find the product with the matching numeric ID
              const products = await this.prisma.product.findMany();
              const product = products.find(p => {
                try {
                  return parseInt(p.id) === parseInt(item.productId.toString());
                } catch (e) {
                  return false;
                }
              });
              
              if (!product) {
                throw new Error(`Product with id ${item.productId} not found`);
              }
              
              return {
                productId: product.id, // Valid MongoDB ObjectId
                quantity: item.quantity,
                price: item.price
              };
            }))
          }
        },
        include: {
          items: true
        }
      });

      return {
        id: parseInt(order.id),
        userId: parseInt(order.userId),
        status: order.status,
        total: order.total,
        shippingAddress: order.shippingAddress,
        paymentMethod: order.paymentMethod,
        createdAt: order.createdAt
      };
    } catch (error) {
      console.error("Error in createOrder:", error);
      throw error;
    }
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    try {
      console.log(`Updating order ${id} status to ${status}`);
      
      // First find the order with matching numeric ID
      const orders = await this.prisma.order.findMany();
      const orderToUpdate = orders.find(o => {
        try {
          return parseInt(o.id) === parseInt(id.toString());
        } catch (e) {
          return false;
        }
      });
      
      if (!orderToUpdate) {
        console.error(`Order with ID ${id} not found for status update`);
        return undefined;
      }
      
      console.log(`Found MongoDB order with ID: ${orderToUpdate.id}`);
      
      // Update the order with the MongoDB ObjectId
      const order = await this.prisma.order.update({
        where: { id: orderToUpdate.id },
        data: { status }
      });

      return {
        id: parseInt(order.id),
        userId: parseInt(order.userId),
        status: order.status,
        total: order.total,
        shippingAddress: order.shippingAddress,
        paymentMethod: order.paymentMethod || "credit-card",
        createdAt: order.createdAt
      };
    } catch (error) {
      console.error("Error in updateOrderStatus:", error);
      return undefined;
    }
  }

  // Helper methods for MongoDB ObjectId handling
  private async getUserObjectId(userId: number): Promise<string> {
    try {
      // First try to find the user by numeric ID
      const users = await this.prisma.user.findMany();
      
      // Find the first user where the numeric part of the ID matches
      const matchedUser = users.find(user => {
        try {
          return parseInt(user.id) === userId;
        } catch (e) {
          return false;
        }
      });
      
      // If found, return the MongoDB ObjectId
      if (matchedUser) {
        return matchedUser.id;
      }
      
      // If not found by numeric ID, try the string directly (may be an ObjectID already)
      const userStr = await this.prisma.user.findUnique({
        where: { id: userId.toString() }
      });
      
      if (userStr) {
        return userStr.id;
      }
      
      throw new Error(`User with ID ${userId} not found`);
    } catch (error) {
      console.error(`Error finding user ObjectId for: ${userId}`, error);
      throw error;
    }
  }
  
  private async getProductObjectId(productId: number): Promise<string> {
    try {
      // First try to find the product by numeric ID
      const products = await this.prisma.product.findMany();
      
      // Find the first product where the numeric part of the ID matches
      const matchedProduct = products.find(product => {
        try {
          return parseInt(product.id) === productId;
        } catch (e) {
          return false;
        }
      });
      
      // If found, return the MongoDB ObjectId
      if (matchedProduct) {
        return matchedProduct.id;
      }
      
      // If not found by numeric ID, try the string directly (may be an ObjectID already)
      const productStr = await this.prisma.product.findUnique({
        where: { id: productId.toString() }
      });
      
      if (productStr) {
        return productStr.id;
      }
      
      throw new Error(`Product with ID ${productId} not found`);
    } catch (error) {
      console.error(`Error finding product ObjectId for: ${productId}`, error);
      throw error;
    }
  }

  // Helper mapping functions
  private mapPrismaUserToUser(prismaUser: any): User {
    return {
      id: parseInt(prismaUser.id),
      username: prismaUser.username,
      email: prismaUser.email,
      password: prismaUser.password,
      role: prismaUser.role,
      fullName: prismaUser.fullName || null,
      phone: prismaUser.phone || null,
      address: prismaUser.address || null,
      city: prismaUser.city || null,
      state: prismaUser.state || null,
      zipCode: prismaUser.zipCode || null,
      country: prismaUser.country || "United States",
      preferredPaymentMethod: prismaUser.preferredPaymentMethod || "card",
      createdAt: prismaUser.createdAt
    };
  }

  private mapPrismaProductToProduct(prismaProduct: any): Product {
    return {
      id: parseInt(prismaProduct.id),
      name: prismaProduct.name,
      description: prismaProduct.description,
      price: prismaProduct.price,
      imageUrl: prismaProduct.imageUrl,
      category: prismaProduct.category,
      rating: prismaProduct.rating,
      stock: prismaProduct.stock,
      createdAt: prismaProduct.createdAt
    };
  }

  // Reset the products in the database
  async resetProducts(): Promise<void> {
    try {
      console.log("Resetting products in the database...");
      
      // Delete all existing products
      await this.prisma.product.deleteMany({});
      
      console.log("All products have been deleted. Ready for new seed data.");
      return;
    } catch (error) {
      console.error("Error resetting products:", error);
    }
  }

  // Seed initial data if needed
  async seedData(): Promise<void> {
    try {
      console.log("Running seedData - checking for existing data");
      
      // Check for existing users
      const userCount = await this.prisma.user.count();
      console.log(`Found ${userCount} existing users`);
      
      if (userCount === 0) {
        console.log("Creating demo users...");
        // Create demo users
        const adminPassword = await bcrypt.hash("admin123", 10);
        const userPassword = await bcrypt.hash("user123", 10);
        
        // Create users one by one instead of using createMany (better for MongoDB)
        await this.prisma.user.create({
          data: {
            username: "admin",
            email: "admin@example.com",
            password: adminPassword,
            role: "admin"
          }
        });
        
        await this.prisma.user.create({
          data: {
            username: "user",
            email: "user@example.com",
            password: userPassword,
            role: "user"
          }
        });
        
        console.log("Demo users created successfully");
      }

      // Check for existing products - we'll replace all products with our updated set
      const productCount = await this.prisma.product.count();
      console.log(`Found ${productCount} existing products`);
      
      // Reset products if there are only a few (likely the initial seed)
      if (productCount > 0 && productCount < 10) {
        await this.resetProducts();
        // Set productCount to 0 to ensure we add the new products
        console.log("Previous seed products have been reset");
      }
      
      if (productCount === 0) {
        console.log("Creating demo products...");
        
        // Create products one by one
        const demoProducts = [
          // Electronics
          {
            name: "Wireless Headphones",
            description: "Premium wireless headphones with noise cancellation",
            price: 149.99,
            imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=700",
            category: "Electronics",
            rating: 4.5,
            stock: 50
          },
          {
            name: "Gaming Laptop",
            description: "High-performance gaming laptop with RGB keyboard",
            price: 1299.99,
            imageUrl: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=700",
            category: "Electronics",
            rating: 4.9,
            stock: 15
          },
          {
            name: "Wireless Mouse",
            description: "Ergonomic wireless mouse with long battery life",
            price: 49.99,
            imageUrl: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=700",
            category: "Electronics",
            rating: 4.4,
            stock: 65
          },
          {
            name: "4K Monitor",
            description: "Ultra-wide 4K monitor for professional work and gaming",
            price: 399.99,
            imageUrl: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=700",
            category: "Electronics",
            rating: 4.7,
            stock: 30
          },
          {
            name: "Smartphone",
            description: "Latest model with high-resolution camera and fast processor",
            price: 799.99,
            imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=700",
            category: "Electronics",
            rating: 4.8,
            stock: 25
          },
          {
            name: "Fitness Tracker",
            description: "Track your daily activity, sleep, and workout metrics",
            price: 59.99,
            imageUrl: "https://images.unsplash.com/photo-1576243345690-4e4b79b63eaa?auto=format&fit=crop&w=700",
            category: "Electronics",
            rating: 4.3,
            stock: 75
          },
          {
            name: "Wireless Earbuds",
            description: "True wireless earbuds with charging case and water resistance",
            price: 129.99,
            imageUrl: "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?auto=format&fit=crop&w=700",
            category: "Electronics",
            rating: 4.6,
            stock: 40
          },
          {
            name: "Smart Watch",
            description: "Feature-packed smartwatch with health monitoring",
            price: 249.99,
            imageUrl: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=700",
            category: "Electronics",
            rating: 4.7,
            stock: 35
          },
          {
            name: "Bluetooth Speaker",
            description: "Powerful portable speaker with 360° sound",
            price: 79.99,
            imageUrl: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=700",
            category: "Electronics",
            rating: 4.2,
            stock: 60
          },
          
          // Fashion
          {
            name: "Running Shoes",
            description: "Lightweight and comfortable running shoes for all terrains",
            price: 89.99,
            imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=700",
            category: "Fashion",
            rating: 4.2,
            stock: 100
          },
          {
            name: "Leather Wallet",
            description: "Genuine leather wallet with RFID protection",
            price: 39.99,
            imageUrl: "https://images.unsplash.com/photo-1559563458-527698bf5295?auto=format&fit=crop&w=700",
            category: "Fashion",
            rating: 4.5,
            stock: 120
          },
          {
            name: "Denim Jacket",
            description: "Classic denim jacket with modern styling",
            price: 59.99,
            imageUrl: "https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=700",
            category: "Fashion",
            rating: 4.3,
            stock: 80
          },
          {
            name: "Summer Dress",
            description: "Lightweight floral summer dress",
            price: 45.99,
            imageUrl: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=700",
            category: "Fashion",
            rating: 4.6,
            stock: 65
          },
          {
            name: "Aviator Sunglasses",
            description: "Classic aviator sunglasses with UV protection",
            price: 29.99,
            imageUrl: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=700",
            category: "Fashion",
            rating: 4.1,
            stock: 150
          },
          
          // Home
          {
            name: "Coffee Maker",
            description: "Automatic coffee maker with programmable settings",
            price: 79.99,
            imageUrl: "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=700",
            category: "Home",
            rating: 4.0,
            stock: 30
          },
          {
            name: "Desk Lamp",
            description: "Adjustable desk lamp with multiple brightness settings",
            price: 34.99,
            imageUrl: "https://images.unsplash.com/photo-1534965187696-11eb55982a8a?auto=format&fit=crop&w=700",
            category: "Home",
            rating: 4.4,
            stock: 55
          },
          {
            name: "Throw Blanket",
            description: "Super soft throw blanket perfect for cozy evenings",
            price: 24.99,
            imageUrl: "https://images.unsplash.com/photo-1538874165723-9f2a2b63f2c8?auto=format&fit=crop&w=700",
            category: "Home",
            rating: 4.7,
            stock: 85
          },
          {
            name: "Ceramic Vase",
            description: "Handcrafted ceramic vase for fresh or dried flowers",
            price: 19.99,
            imageUrl: "https://images.unsplash.com/photo-1612032835625-3b0cb313de17?auto=format&fit=crop&w=700",
            category: "Home",
            rating: 4.2,
            stock: 40
          },
          
          // Books
          {
            name: "The Art of Programming",
            description: "Comprehensive guide to modern programming techniques",
            price: 39.99,
            imageUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=700",
            category: "Books",
            rating: 4.8,
            stock: 25
          },
          {
            name: "Cooking Masterclass",
            description: "Step-by-step recipes from world-renowned chefs",
            price: 29.99,
            imageUrl: "https://images.unsplash.com/photo-1589998059171-988d887df646?auto=format&fit=crop&w=700",
            category: "Books",
            rating: 4.5,
            stock: 30
          },
          {
            name: "World History Encyclopedia",
            description: "Illustrated guide through world history from ancient times",
            price: 49.99,
            imageUrl: "https://images.unsplash.com/photo-1533327325824-76bc4e62d560?auto=format&fit=crop&w=700",
            category: "Books",
            rating: 4.7,
            stock: 20
          },
          
          // Sports
          {
            name: "Yoga Mat",
            description: "Non-slip yoga mat with carrying strap",
            price: 24.99,
            imageUrl: "https://images.unsplash.com/photo-1592432678016-e910b452f9a2?auto=format&fit=crop&w=700",
            category: "Sports",
            rating: 4.4,
            stock: 70
          },
          {
            name: "Basketball",
            description: "Official size indoor/outdoor basketball",
            price: 29.99,
            imageUrl: "https://images.unsplash.com/photo-1505666287802-931dc83d1b52?auto=format&fit=crop&w=700",
            category: "Sports",
            rating: 4.3,
            stock: 45
          },
          {
            name: "Tennis Racket",
            description: "Professional tennis racket for all skill levels",
            price: 89.99,
            imageUrl: "https://images.unsplash.com/photo-1617714651693-a4e3f91599ef?auto=format&fit=crop&w=700",
            category: "Sports",
            rating: 4.6,
            stock: 35
          },
          
          // Beauty
          {
            name: "Face Serum",
            description: "Hydrating face serum with vitamin C",
            price: 24.99,
            imageUrl: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=700",
            category: "Beauty",
            rating: 4.7,
            stock: 60
          },
          {
            name: "Makeup Brush Set",
            description: "Professional 12-piece makeup brush set",
            price: 19.99,
            imageUrl: "https://images.unsplash.com/photo-1631214524113-16a39c4f9dd0?auto=format&fit=crop&w=700",
            category: "Beauty",
            rating: 4.5,
            stock: 80
          },
          {
            name: "Perfume",
            description: "Elegant fragrance for everyday use",
            price: 69.99,
            imageUrl: "https://images.unsplash.com/photo-1557170334-a9632e77c6e4?auto=format&fit=crop&w=700",
            category: "Beauty",
            rating: 4.8,
            stock: 40
          },
          
          // Toys
          {
            name: "Building Blocks Set",
            description: "Creative building blocks for ages 3+",
            price: 24.99,
            imageUrl: "https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=700",
            category: "Toys",
            rating: 4.5,
            stock: 50
          },
          {
            name: "Remote Control Car",
            description: "Fast RC car with long battery life",
            price: 39.99,
            imageUrl: "https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?auto=format&fit=crop&w=700",
            category: "Toys",
            rating: 4.3,
            stock: 35
          },
          {
            name: "Stuffed Animal",
            description: "Soft plush teddy bear, perfect for all ages",
            price: 19.99,
            imageUrl: "https://images.unsplash.com/photo-1558877385-81a1c7e67d72?auto=format&fit=crop&w=700",
            category: "Toys",
            rating: 4.7,
            stock: 65
          },
          
          // Furniture
          {
            name: "Office Chair",
            description: "Ergonomic office chair with lumbar support",
            price: 149.99,
            imageUrl: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&w=700",
            category: "Furniture",
            rating: 4.6,
            stock: 25
          },
          {
            name: "Dining Table Set",
            description: "Modern 6-person dining table set with chairs",
            price: 749.99,
            imageUrl: "https://images.unsplash.com/photo-1595438280062-8a79d213afb4?auto=format&fit=crop&w=700",
            category: "Furniture",
            rating: 4.8,
            stock: 10
          },
          {
            name: "King Size Bed",
            description: "Comfortable king size bed with wooden frame",
            price: 899.99,
            imageUrl: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=700",
            category: "Furniture",
            rating: 4.7,
            stock: 8
          },
          {
            name: "Coffee Table",
            description: "Modern coffee table with storage compartment",
            price: 129.99,
            imageUrl: "https://images.unsplash.com/photo-1567016376408-0226e4d0c1ea?auto=format&fit=crop&w=700",
            category: "Furniture",
            rating: 4.5,
            stock: 15
          },
          {
            name: "Bookshelf",
            description: "5-tier bookshelf, perfect for home library",
            price: 89.99,
            imageUrl: "https://images.unsplash.com/photo-1594620302200-9a762244a156?auto=format&fit=crop&w=700",
            category: "Furniture",
            rating: 4.4,
            stock: 20
          }
        ];
        
        // Create each product individually for better compatibility with MongoDB
        for (const product of demoProducts) {
          await this.prisma.product.create({
            data: product
          });
        }
        
        console.log("Demo products created successfully");
      }
      
      console.log("Seed data process completed");
    } catch (error) {
      console.error("Error seeding data:", error);
    }
  }
}