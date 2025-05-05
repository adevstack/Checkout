import { PrismaClient } from "@prisma/client";
import { IStorage } from "./storage";
import {
  User,
  InsertUser,
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
          role: userData.role || "user"
        }
      });
      return this.mapPrismaUserToUser(user);
    } catch (error) {
      console.error("Error in createUser:", error);
      throw error;
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
      const product = await this.prisma.product.update({
        where: { id: String(id) },
        data: productData
      });
      return this.mapPrismaProductToProduct(product);
    } catch (error) {
      console.error("Error in updateProduct:", error);
      return undefined;
    }
  }

  async deleteProduct(id: number): Promise<boolean> {
    try {
      await this.prisma.product.delete({
        where: { id: String(id) }
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
      const cartItems = await this.prisma.cartItem.findMany({
        where: { userId: String(userId) },
        include: { product: true }
      });
      
      return cartItems.map(item => ({
        id: parseInt(item.id),
        userId: parseInt(item.userId),
        productId: parseInt(item.productId),
        quantity: item.quantity,
        createdAt: item.createdAt,
        product: this.mapPrismaProductToProduct(item.product)
      }));
    } catch (error) {
      console.error("Error in getCartItems:", error);
      return [];
    }
  }

  async addCartItem(cartItemData: InsertCartItem): Promise<CartItem> {
    try {
      // Check if cart item already exists
      const existingCartItem = await this.prisma.cartItem.findFirst({
        where: {
          userId: String(cartItemData.userId),
          productId: String(cartItemData.productId)
        }
      });

      let cartItem;
      if (existingCartItem) {
        // Update quantity
        cartItem = await this.prisma.cartItem.update({
          where: { id: existingCartItem.id },
          data: { quantity: existingCartItem.quantity + cartItemData.quantity }
        });
      } else {
        // Create new cart item
        cartItem = await this.prisma.cartItem.create({
          data: {
            userId: String(cartItemData.userId),
            productId: String(cartItemData.productId),
            quantity: cartItemData.quantity
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
      await this.prisma.cartItem.deleteMany({
        where: { userId: String(userId) }
      });
      return true;
    } catch (error) {
      console.error("Error in clearCart:", error);
      return false;
    }
  }

  // Order operations
  async getOrders(userId: number): Promise<Order[]> {
    try {
      const orders = await this.prisma.order.findMany({
        where: { userId: String(userId) }
      });
      
      return orders.map(order => ({
        id: parseInt(order.id),
        userId: parseInt(order.userId),
        status: order.status,
        total: order.total,
        shippingAddress: order.shippingAddress,
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
        createdAt: order.createdAt
      }));
    } catch (error) {
      console.error("Error in getAllOrders:", error);
      return [];
    }
  }

  async getOrder(id: number): Promise<OrderWithItems | undefined> {
    try {
      const order = await this.prisma.order.findUnique({
        where: { id: String(id) },
        include: {
          items: {
            include: { product: true }
          }
        }
      });

      if (!order) return undefined;

      return {
        id: parseInt(order.id),
        userId: parseInt(order.userId),
        status: order.status,
        total: order.total,
        shippingAddress: order.shippingAddress,
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
      // Create order
      const order = await this.prisma.order.create({
        data: {
          userId: String(orderData.userId),
          status: orderData.status,
          total: orderData.total,
          shippingAddress: orderData.shippingAddress,
          items: {
            create: items.map(item => ({
              productId: String(item.productId),
              quantity: item.quantity,
              price: item.price
            }))
          }
        }
      });

      return {
        id: parseInt(order.id),
        userId: parseInt(order.userId),
        status: order.status,
        total: order.total,
        shippingAddress: order.shippingAddress,
        createdAt: order.createdAt
      };
    } catch (error) {
      console.error("Error in createOrder:", error);
      throw error;
    }
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    try {
      const order = await this.prisma.order.update({
        where: { id: String(id) },
        data: { status }
      });

      return {
        id: parseInt(order.id),
        userId: parseInt(order.userId),
        status: order.status,
        total: order.total,
        shippingAddress: order.shippingAddress,
        createdAt: order.createdAt
      };
    } catch (error) {
      console.error("Error in updateOrderStatus:", error);
      return undefined;
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

      // Check for existing products
      const productCount = await this.prisma.product.count();
      console.log(`Found ${productCount} existing products`);
      
      if (productCount === 0) {
        console.log("Creating demo products...");
        
        // Create products one by one
        const demoProducts = [
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
            name: "Smartphone",
            description: "Latest model with high-resolution camera and fast processor",
            price: 799.99,
            imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=700",
            category: "Electronics",
            rating: 4.8,
            stock: 25
          },
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
            name: "Coffee Maker",
            description: "Automatic coffee maker with programmable settings",
            price: 79.99,
            imageUrl: "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=700",
            category: "Home",
            rating: 4.0,
            stock: 30
          },
          {
            name: "Fitness Tracker",
            description: "Track your daily activity, sleep, and workout metrics",
            price: 59.99,
            imageUrl: "https://images.unsplash.com/photo-1576243345690-4e4b79b63eaa?auto=format&fit=crop&w=700",
            category: "Electronics",
            rating: 4.3,
            stock: 75
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