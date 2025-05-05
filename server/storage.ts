import { 
  users, type User, type InsertUser,
  products, type Product, type InsertProduct,
  cartItems, type CartItem, type InsertCartItem,
  orders, type Order, type InsertOrder,
  orderItems, type OrderItem, type InsertOrderItem,
  CartItemWithProduct, OrderWithItems
} from "@shared/schema";
import bcrypt from "bcryptjs";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Product operations
  getProducts(): Promise<Product[]>;
  getProductsByCategory(category: string): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;
  
  // Cart operations
  getCartItems(userId: number): Promise<CartItemWithProduct[]>;
  addCartItem(cartItem: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: number, quantity: number): Promise<CartItem | undefined>;
  removeCartItem(id: number): Promise<boolean>;
  clearCart(userId: number): Promise<boolean>;
  
  // Order operations
  getOrders(userId: number): Promise<Order[]>;
  getAllOrders(): Promise<Order[]>;
  getOrder(id: number): Promise<OrderWithItems | undefined>;
  createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private products: Map<number, Product>;
  private cartItems: Map<number, CartItem>;
  private orders: Map<number, Order>;
  private orderItems: Map<number, OrderItem>;
  private userId: number;
  private productId: number;
  private cartItemId: number;
  private orderId: number;
  private orderItemId: number;

  constructor() {
    this.users = new Map();
    this.products = new Map();
    this.cartItems = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    this.userId = 1;
    this.productId = 1;
    this.cartItemId = 1;
    this.orderId = 1;
    this.orderItemId = 1;
    
    // Add seed data
    this.seedData();
  }

  private async seedData() {
    // Create demo users
    const adminHash = await bcrypt.hash("admin123", 10);
    const userHash = await bcrypt.hash("user123", 10);
    
    this.createUser({
      username: "admin",
      email: "admin@example.com",
      password: adminHash,
      role: "admin"
    });
    
    this.createUser({
      username: "user",
      email: "user@example.com",
      password: userHash,
      role: "user"
    });
    
    // Create demo products
    const products = [
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
        name: "Smart Watch",
        description: "Fitness tracker and smart watch with heart rate monitoring",
        price: 299.99,
        imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=700",
        category: "Electronics",
        rating: 4.8,
        stock: 30
      },
      {
        name: "Smartphone",
        description: "Latest model smartphone with high resolution camera",
        price: 899.99,
        imageUrl: "https://images.unsplash.com/photo-1556656793-08538906a9f8?auto=format&fit=crop&w=700",
        category: "Electronics",
        rating: 4.7,
        stock: 20
      },
      {
        name: "Bluetooth Speaker",
        description: "Portable waterproof bluetooth speaker with deep bass",
        price: 129.99,
        imageUrl: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=700",
        category: "Electronics",
        rating: 4.3,
        stock: 45
      },
      {
        name: "Leather Backpack",
        description: "Handcrafted genuine leather backpack with laptop compartment",
        price: 89.99,
        imageUrl: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=700",
        category: "Fashion",
        rating: 4.6,
        stock: 25
      },
      {
        name: "Running Shoes",
        description: "Lightweight and comfortable running shoes with arch support",
        price: 119.99,
        imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=700",
        category: "Fashion",
        rating: 4.4,
        stock: 40
      }
    ];
    
    products.forEach(product => this.createProduct(product));
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.userId++;
    const newUser: User = { ...user, id, createdAt: new Date() };
    this.users.set(id, newUser);
    return newUser;
  }

  // Product operations
  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      (product) => product.category === category
    );
  }

  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const id = this.productId++;
    const newProduct: Product = { ...product, id, createdAt: new Date() };
    this.products.set(id, newProduct);
    return newProduct;
  }

  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined> {
    const existingProduct = this.products.get(id);
    if (!existingProduct) return undefined;
    
    const updatedProduct = { ...existingProduct, ...product };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  async deleteProduct(id: number): Promise<boolean> {
    return this.products.delete(id);
  }

  // Cart operations
  async getCartItems(userId: number): Promise<CartItemWithProduct[]> {
    const items = Array.from(this.cartItems.values()).filter(
      (item) => item.userId === userId
    );
    
    return items.map(item => {
      const product = this.products.get(item.productId);
      if (!product) throw new Error(`Product not found for cart item: ${item.id}`);
      return { ...item, product };
    });
  }

  async addCartItem(cartItem: InsertCartItem): Promise<CartItem> {
    // Check if already in cart
    const existingItem = Array.from(this.cartItems.values()).find(
      item => item.userId === cartItem.userId && item.productId === cartItem.productId
    );
    
    if (existingItem) {
      // Update quantity
      const updatedItem = { 
        ...existingItem, 
        quantity: existingItem.quantity + cartItem.quantity 
      };
      this.cartItems.set(existingItem.id, updatedItem);
      return updatedItem;
    }
    
    // Create new cart item
    const id = this.cartItemId++;
    const newCartItem: CartItem = { ...cartItem, id, createdAt: new Date() };
    this.cartItems.set(id, newCartItem);
    return newCartItem;
  }

  async updateCartItem(id: number, quantity: number): Promise<CartItem | undefined> {
    const cartItem = this.cartItems.get(id);
    if (!cartItem) return undefined;
    
    const updatedCartItem = { ...cartItem, quantity };
    this.cartItems.set(id, updatedCartItem);
    return updatedCartItem;
  }

  async removeCartItem(id: number): Promise<boolean> {
    return this.cartItems.delete(id);
  }

  async clearCart(userId: number): Promise<boolean> {
    const userCartItems = Array.from(this.cartItems.values()).filter(
      (item) => item.userId === userId
    );
    
    userCartItems.forEach(item => this.cartItems.delete(item.id));
    return true;
  }

  // Order operations
  async getOrders(userId: number): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(
      (order) => order.userId === userId
    );
  }

  async getAllOrders(): Promise<Order[]> {
    return Array.from(this.orders.values());
  }

  async getOrder(id: number): Promise<OrderWithItems | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;
    
    const items = Array.from(this.orderItems.values())
      .filter(item => item.orderId === id)
      .map(item => {
        const product = this.products.get(item.productId);
        if (!product) throw new Error(`Product not found for order item: ${item.id}`);
        return { ...item, product };
      });
    
    return { ...order, items };
  }

  async createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order> {
    const id = this.orderId++;
    const newOrder: Order = { ...order, id, createdAt: new Date() };
    this.orders.set(id, newOrder);
    
    items.forEach(item => {
      const itemId = this.orderItemId++;
      const newItem: OrderItem = { 
        ...item, 
        id: itemId, 
        orderId: id,
        createdAt: new Date()
      };
      this.orderItems.set(itemId, newItem);
    });
    
    return newOrder;
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;
    
    const updatedOrder = { ...order, status };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }
}

// No need to export anything here as db.ts handles storage initialization
