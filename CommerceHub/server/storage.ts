import { 
  User, InsertUser, Product, InsertProduct, 
  Category, InsertCategory, Order, InsertOrder,
  OrderItem, InsertOrderItem, Review, InsertReview,
  Cart, InsertCart, CartItem, InsertCartItem,
  Wishlist, InsertWishlist, WishlistItem, InsertWishlistItem,
  users, products, categories, orders, orderItems, reviews,
  carts, cartItems, wishlists, wishlistItems, LoginUser
} from "@shared/schema";
import * as bcrypt from 'bcrypt';

// Interface for all storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  validateUser(loginData: LoginUser): Promise<User | undefined>;
  
  // Product operations
  getProduct(id: number): Promise<Product | undefined>;
  getProductBySlug(slug: string): Promise<Product | undefined>;
  getProducts(options?: { 
    limit?: number, 
    offset?: number, 
    categoryId?: number, 
    search?: string,
    isFeatured?: boolean,
    isNew?: boolean,
    isOnSale?: boolean,
    minPrice?: number,
    maxPrice?: number,
    sortBy?: string,
    sortOrder?: 'asc' | 'desc'
  }): Promise<Product[]>;
  getProductCount(options?: {
    categoryId?: number,
    search?: string,
    isFeatured?: boolean,
    isNew?: boolean,
    isOnSale?: boolean,
    minPrice?: number,
    maxPrice?: number
  }): Promise<number>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;
  
  // Category operations
  getCategory(id: number): Promise<Category | undefined>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  getCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: number): Promise<boolean>;
  
  // Order operations
  getOrder(id: number): Promise<Order | undefined>;
  getOrdersByUser(userId: number): Promise<Order[]>;
  getAllOrders(options?: { limit?: number, offset?: number, status?: string }): Promise<Order[]>;
  createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;
  
  // Review operations
  getProductReviews(productId: number): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  
  // Cart operations
  getCartByUser(userId: number): Promise<Cart | undefined>;
  getCartWithItems(userId: number): Promise<{ cart: Cart, items: (CartItem & { product: Product })[] } | undefined>;
  addToCart(userId: number, productId: number, quantity: number): Promise<CartItem>;
  updateCartItem(cartItemId: number, quantity: number): Promise<CartItem | undefined>;
  removeFromCart(cartItemId: number): Promise<boolean>;
  
  // Wishlist operations
  getWishlistByUser(userId: number): Promise<Wishlist | undefined>;
  getWishlistWithItems(userId: number): Promise<{ wishlist: Wishlist, items: (WishlistItem & { product: Product })[] } | undefined>;
  addToWishlist(userId: number, productId: number): Promise<WishlistItem>;
  removeFromWishlist(wishlistItemId: number): Promise<boolean>;
}

// Implementation of storage operations using in-memory storage
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private products: Map<number, Product>;
  private categories: Map<number, Category>;
  private orders: Map<number, Order>;
  private orderItems: Map<number, OrderItem>;
  private reviews: Map<number, Review>;
  private carts: Map<number, Cart>;
  private cartItems: Map<number, CartItem>;
  private wishlists: Map<number, Wishlist>;
  private wishlistItems: Map<number, WishlistItem>;
  
  private userId: number;
  private productId: number;
  private categoryId: number;
  private orderId: number;
  private orderItemId: number;
  private reviewId: number;
  private cartId: number;
  private cartItemId: number;
  private wishlistId: number;
  private wishlistItemId: number;
  
  constructor() {
    this.users = new Map();
    this.products = new Map();
    this.categories = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    this.reviews = new Map();
    this.carts = new Map();
    this.cartItems = new Map();
    this.wishlists = new Map();
    this.wishlistItems = new Map();
    
    this.userId = 1;
    this.productId = 1;
    this.categoryId = 1;
    this.orderId = 1;
    this.orderItemId = 1;
    this.reviewId = 1;
    this.cartId = 1;
    this.cartItemId = 1;
    this.wishlistId = 1;
    this.wishlistItemId = 1;
    
    // Seed initial data
    this.seedData();
  }
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    // Hash password
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    
    const id = this.userId++;
    const user: User = { 
      ...insertUser, 
      id,
      password: hashedPassword,
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    // If password is being updated, hash it
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10);
    }
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async validateUser(loginData: LoginUser): Promise<User | undefined> {
    const user = await this.getUserByEmail(loginData.email);
    if (!user) return undefined;
    
    const isValid = await bcrypt.compare(loginData.password, user.password);
    return isValid ? user : undefined;
  }
  
  // Product operations
  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }
  
  async getProductBySlug(slug: string): Promise<Product | undefined> {
    return Array.from(this.products.values()).find(product => product.slug === slug);
  }
  
  async getProducts(options: {
    limit?: number, 
    offset?: number, 
    categoryId?: number, 
    search?: string,
    isFeatured?: boolean,
    isNew?: boolean,
    isOnSale?: boolean,
    minPrice?: number,
    maxPrice?: number,
    sortBy?: string,
    sortOrder?: 'asc' | 'desc'
  } = {}): Promise<Product[]> {
    let products = Array.from(this.products.values());
    
    // Filter by category
    if (options.categoryId !== undefined) {
      products = products.filter(product => product.categoryId === options.categoryId);
    }
    
    // Filter by search term
    if (options.search) {
      const searchTerm = options.search.toLowerCase();
      products = products.filter(product => 
        product.name.toLowerCase().includes(searchTerm) || 
        product.description.toLowerCase().includes(searchTerm) ||
        (product.brand && product.brand.toLowerCase().includes(searchTerm))
      );
    }
    
    // Filter by featured
    if (options.isFeatured !== undefined) {
      products = products.filter(product => product.isFeatured === options.isFeatured);
    }
    
    // Filter by new
    if (options.isNew !== undefined) {
      products = products.filter(product => product.isNew === options.isNew);
    }
    
    // Filter by on sale
    if (options.isOnSale !== undefined) {
      products = products.filter(product => product.isOnSale === options.isOnSale);
    }
    
    // Filter by price range
    if (options.minPrice !== undefined) {
      products = products.filter(product => Number(product.price) >= options.minPrice!);
    }
    
    if (options.maxPrice !== undefined) {
      products = products.filter(product => Number(product.price) <= options.maxPrice!);
    }
    
    // Sort
    if (options.sortBy) {
      const sortOrder = options.sortOrder === 'desc' ? -1 : 1;
      products.sort((a, b) => {
        const aValue = a[options.sortBy as keyof Product];
        const bValue = b[options.sortBy as keyof Product];
        
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortOrder * aValue.localeCompare(bValue);
        } else if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortOrder * (aValue - bValue);
        } else if (aValue instanceof Date && bValue instanceof Date) {
          return sortOrder * (aValue.getTime() - bValue.getTime());
        }
        return 0;
      });
    }
    
    // Pagination
    if (options.offset !== undefined || options.limit !== undefined) {
      const offset = options.offset || 0;
      const limit = options.limit || products.length;
      products = products.slice(offset, offset + limit);
    }
    
    return products;
  }
  
  async getProductCount(options: {
    categoryId?: number,
    search?: string,
    isFeatured?: boolean,
    isNew?: boolean,
    isOnSale?: boolean,
    minPrice?: number,
    maxPrice?: number
  } = {}): Promise<number> {
    let products = Array.from(this.products.values());
    
    // Filter by category
    if (options.categoryId !== undefined) {
      products = products.filter(product => product.categoryId === options.categoryId);
    }
    
    // Filter by search term
    if (options.search) {
      const searchTerm = options.search.toLowerCase();
      products = products.filter(product => 
        product.name.toLowerCase().includes(searchTerm) || 
        product.description.toLowerCase().includes(searchTerm) ||
        (product.brand && product.brand.toLowerCase().includes(searchTerm))
      );
    }
    
    // Filter by featured
    if (options.isFeatured !== undefined) {
      products = products.filter(product => product.isFeatured === options.isFeatured);
    }
    
    // Filter by new
    if (options.isNew !== undefined) {
      products = products.filter(product => product.isNew === options.isNew);
    }
    
    // Filter by on sale
    if (options.isOnSale !== undefined) {
      products = products.filter(product => product.isOnSale === options.isOnSale);
    }
    
    // Filter by price range
    if (options.minPrice !== undefined) {
      products = products.filter(product => Number(product.price) >= options.minPrice!);
    }
    
    if (options.maxPrice !== undefined) {
      products = products.filter(product => Number(product.price) <= options.maxPrice!);
    }
    
    return products.length;
  }
  
  async createProduct(product: InsertProduct): Promise<Product> {
    const id = this.productId++;
    const newProduct: Product = {
      ...product,
      id,
      createdAt: new Date()
    };
    this.products.set(id, newProduct);
    return newProduct;
  }
  
  async updateProduct(id: number, productData: Partial<InsertProduct>): Promise<Product | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;
    
    const updatedProduct = { ...product, ...productData };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }
  
  async deleteProduct(id: number): Promise<boolean> {
    return this.products.delete(id);
  }
  
  // Category operations
  async getCategory(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }
  
  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    return Array.from(this.categories.values()).find(category => category.slug === slug);
  }
  
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }
  
  async createCategory(category: InsertCategory): Promise<Category> {
    const id = this.categoryId++;
    const newCategory: Category = { ...category, id };
    this.categories.set(id, newCategory);
    return newCategory;
  }
  
  async updateCategory(id: number, categoryData: Partial<InsertCategory>): Promise<Category | undefined> {
    const category = this.categories.get(id);
    if (!category) return undefined;
    
    const updatedCategory = { ...category, ...categoryData };
    this.categories.set(id, updatedCategory);
    return updatedCategory;
  }
  
  async deleteCategory(id: number): Promise<boolean> {
    return this.categories.delete(id);
  }
  
  // Order operations
  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }
  
  async getOrdersByUser(userId: number): Promise<Order[]> {
    return Array.from(this.orders.values())
      .filter(order => order.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async getAllOrders(options: { limit?: number, offset?: number, status?: string } = {}): Promise<Order[]> {
    let orders = Array.from(this.orders.values());
    
    // Filter by status
    if (options.status) {
      orders = orders.filter(order => order.status === options.status);
    }
    
    // Sort by date (newest first)
    orders = orders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    // Pagination
    if (options.offset !== undefined || options.limit !== undefined) {
      const offset = options.offset || 0;
      const limit = options.limit || orders.length;
      orders = orders.slice(offset, offset + limit);
    }
    
    return orders;
  }
  
  async createOrder(orderData: InsertOrder, items: InsertOrderItem[]): Promise<Order> {
    const id = this.orderId++;
    const order: Order = {
      ...orderData,
      id,
      createdAt: new Date()
    };
    this.orders.set(id, order);
    
    // Create order items
    for (const item of items) {
      const orderItemId = this.orderItemId++;
      const orderItem: OrderItem = {
        ...item,
        id: orderItemId,
        orderId: id
      };
      this.orderItems.set(orderItemId, orderItem);
    }
    
    return order;
  }
  
  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;
    
    const updatedOrder = { ...order, status: status as any };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }
  
  // Review operations
  async getProductReviews(productId: number): Promise<Review[]> {
    return Array.from(this.reviews.values())
      .filter(review => review.productId === productId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async createReview(reviewData: InsertReview): Promise<Review> {
    const id = this.reviewId++;
    const review: Review = {
      ...reviewData,
      id,
      createdAt: new Date()
    };
    this.reviews.set(id, review);
    
    // Update product rating
    const product = this.products.get(reviewData.productId);
    if (product) {
      const productReviews = await this.getProductReviews(reviewData.productId);
      const totalRating = productReviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = totalRating / productReviews.length;
      
      const updatedProduct = {
        ...product,
        rating: averageRating,
        reviewCount: productReviews.length
      };
      this.products.set(product.id, updatedProduct);
    }
    
    return review;
  }
  
  // Cart operations
  async getCartByUser(userId: number): Promise<Cart | undefined> {
    return Array.from(this.carts.values()).find(cart => cart.userId === userId);
  }
  
  async getCartWithItems(userId: number): Promise<{ cart: Cart, items: (CartItem & { product: Product })[] } | undefined> {
    const cart = await this.getCartByUser(userId);
    if (!cart) return undefined;
    
    const cartItems = Array.from(this.cartItems.values())
      .filter(item => item.cartId === cart.id)
      .map(item => {
        const product = this.products.get(item.productId);
        if (!product) throw new Error(`Product with id ${item.productId} not found`);
        return { ...item, product };
      });
    
    return { cart, items: cartItems };
  }
  
  async addToCart(userId: number, productId: number, quantity: number): Promise<CartItem> {
    // Get or create cart
    let cart = await this.getCartByUser(userId);
    if (!cart) {
      const cartId = this.cartId++;
      cart = {
        id: cartId,
        userId,
        updatedAt: new Date()
      };
      this.carts.set(cartId, cart);
    } else {
      // Update cart timestamp
      cart = { ...cart, updatedAt: new Date() };
      this.carts.set(cart.id, cart);
    }
    
    // Check if product already in cart
    const existingCartItem = Array.from(this.cartItems.values())
      .find(item => item.cartId === cart!.id && item.productId === productId);
    
    if (existingCartItem) {
      // Update quantity
      const updatedItem = {
        ...existingCartItem,
        quantity: existingCartItem.quantity + quantity
      };
      this.cartItems.set(existingCartItem.id, updatedItem);
      return updatedItem;
    } else {
      // Create new cart item
      const cartItemId = this.cartItemId++;
      const cartItem: CartItem = {
        id: cartItemId,
        cartId: cart.id,
        productId,
        quantity
      };
      this.cartItems.set(cartItemId, cartItem);
      return cartItem;
    }
  }
  
  async updateCartItem(cartItemId: number, quantity: number): Promise<CartItem | undefined> {
    const cartItem = this.cartItems.get(cartItemId);
    if (!cartItem) return undefined;
    
    const updatedItem = { ...cartItem, quantity };
    this.cartItems.set(cartItemId, updatedItem);
    
    // Update cart timestamp
    const cart = this.carts.get(cartItem.cartId);
    if (cart) {
      const updatedCart = { ...cart, updatedAt: new Date() };
      this.carts.set(cart.id, updatedCart);
    }
    
    return updatedItem;
  }
  
  async removeFromCart(cartItemId: number): Promise<boolean> {
    const cartItem = this.cartItems.get(cartItemId);
    if (!cartItem) return false;
    
    // Update cart timestamp
    const cart = this.carts.get(cartItem.cartId);
    if (cart) {
      const updatedCart = { ...cart, updatedAt: new Date() };
      this.carts.set(cart.id, updatedCart);
    }
    
    return this.cartItems.delete(cartItemId);
  }
  
  // Wishlist operations
  async getWishlistByUser(userId: number): Promise<Wishlist | undefined> {
    return Array.from(this.wishlists.values()).find(wishlist => wishlist.userId === userId);
  }
  
  async getWishlistWithItems(userId: number): Promise<{ wishlist: Wishlist, items: (WishlistItem & { product: Product })[] } | undefined> {
    const wishlist = await this.getWishlistByUser(userId);
    if (!wishlist) return undefined;
    
    const wishlistItems = Array.from(this.wishlistItems.values())
      .filter(item => item.wishlistId === wishlist.id)
      .map(item => {
        const product = this.products.get(item.productId);
        if (!product) throw new Error(`Product with id ${item.productId} not found`);
        return { ...item, product };
      });
    
    return { wishlist, items: wishlistItems };
  }
  
  async addToWishlist(userId: number, productId: number): Promise<WishlistItem> {
    // Get or create wishlist
    let wishlist = await this.getWishlistByUser(userId);
    if (!wishlist) {
      const wishlistId = this.wishlistId++;
      wishlist = {
        id: wishlistId,
        userId
      };
      this.wishlists.set(wishlistId, wishlist);
    }
    
    // Check if product already in wishlist
    const existingWishlistItem = Array.from(this.wishlistItems.values())
      .find(item => item.wishlistId === wishlist!.id && item.productId === productId);
    
    if (existingWishlistItem) {
      return existingWishlistItem;
    } else {
      // Create new wishlist item
      const wishlistItemId = this.wishlistItemId++;
      const wishlistItem: WishlistItem = {
        id: wishlistItemId,
        wishlistId: wishlist.id,
        productId
      };
      this.wishlistItems.set(wishlistItemId, wishlistItem);
      return wishlistItem;
    }
  }
  
  async removeFromWishlist(wishlistItemId: number): Promise<boolean> {
    return this.wishlistItems.delete(wishlistItemId);
  }
  
  // Seed initial data
  private seedData() {
    // Seed admin user
    this.createUser({
      username: 'admin',
      email: 'admin@example.com',
      password: 'password123',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      avatarUrl: 'https://randomuser.me/api/portraits/men/1.jpg'
    });
    
    // Seed regular user
    this.createUser({
      username: 'user',
      email: 'user@example.com',
      password: 'password123',
      firstName: 'Regular',
      lastName: 'User',
      role: 'user',
      avatarUrl: 'https://randomuser.me/api/portraits/women/1.jpg'
    });
    
    // Seed categories
    const categories = [
      { name: 'Electronics', slug: 'electronics', icon: 'mobile-alt', imageUrl: 'https://images.unsplash.com/photo-1519183071298-a2962feb14f4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' },
      { name: 'Fashion', slug: 'fashion', icon: 'tshirt', imageUrl: 'https://images.unsplash.com/photo-1542060748-10c28b62716f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' },
      { name: 'Home', slug: 'home', icon: 'home', imageUrl: 'https://images.unsplash.com/photo-1558882224-dda166733046?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' },
      { name: 'Health', slug: 'health', icon: 'heartbeat', imageUrl: 'https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' },
      { name: 'Sports', slug: 'sports', icon: 'dumbbell', imageUrl: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' },
      { name: 'Kids', slug: 'kids', icon: 'baby', imageUrl: 'https://images.unsplash.com/photo-1505692795793-89db22b73ee6?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' },
      { name: 'Kitchen', slug: 'kitchen', icon: 'utensils', imageUrl: 'https://images.unsplash.com/photo-1523289333742-be1143f6b766?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' }
    ];
    
    const categoryIds: Record<string, number> = {};
    categories.forEach(category => {
      const newCategory = this.createCategory(category);
      categoryIds[category.slug] = this.categoryId - 1;
    });
    
    // Seed products - Featured Products (at least 10)
    const featuredProducts = [
      {
        name: 'Nike Air Max',
        slug: 'nike-air-max',
        description: 'Comfortable running shoes with excellent cushioning for daily use.',
        price: 129.99,
        compareAtPrice: 149.99,
        categoryId: categoryIds['fashion'],
        imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff',
        additionalImages: [
          'https://images.unsplash.com/photo-1608231387042-66d1773070a5',
          'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa',
          'https://images.unsplash.com/photo-1587563871167-1ee9c731aefb'
        ],
        brand: 'Nike',
        stock: 50,
        isNew: false,
        isFeatured: true,
        isOnSale: true
      },
      {
        name: 'Smart Watch X3',
        slug: 'smart-watch-x3',
        description: 'Advanced smartwatch with health tracking, notifications, and app support.',
        price: 199.99,
        compareAtPrice: null,
        categoryId: categoryIds['electronics'],
        imageUrl: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12',
        additionalImages: [
          'https://images.unsplash.com/photo-1579586337278-3befd40fd17a',
          'https://images.unsplash.com/photo-1523275335684-37898b6baf30',
          'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1'
        ],
        brand: 'TechGear',
        stock: 25,
        isNew: false,
        isFeatured: true,
        isOnSale: false
      },
      {
        name: 'Wireless Headphones',
        slug: 'wireless-headphones',
        description: 'Premium noise-cancelling headphones with incredible sound quality and battery life.',
        price: 89.99,
        compareAtPrice: 99.99,
        categoryId: categoryIds['electronics'],
        imageUrl: 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad',
        additionalImages: [
          'https://images.unsplash.com/photo-1588423474128-1bb74e8b0f05',
          'https://images.unsplash.com/photo-1577174881658-0f30ed549adc',
          'https://images.unsplash.com/photo-1575057804123-3539d90cacc4'
        ],
        brand: 'SoundMax',
        stock: 30,
        isNew: true,
        isFeatured: true,
        isOnSale: true
      },
      {
        name: 'Premium Headset',
        slug: 'premium-headset',
        description: 'High-quality over-ear headphones for immersive audio experience.',
        price: 149.99,
        compareAtPrice: null,
        categoryId: categoryIds['electronics'],
        imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e',
        additionalImages: [
          'https://images.unsplash.com/photo-1606143132393-5f7ce0cfccf0',
          'https://images.unsplash.com/photo-1554153836-d3020d95331c',
          'https://images.unsplash.com/photo-1613123178507-761fc107ce3a'
        ],
        brand: 'AudioPro',
        stock: 15,
        isNew: false,
        isFeatured: true,
        isOnSale: false
      },
      {
        name: 'Levi\'s 501 Jeans',
        slug: 'levis-501-jeans',
        description: 'Classic straight-fit jeans that never go out of style.',
        price: 79.99,
        compareAtPrice: 89.99,
        categoryId: categoryIds['fashion'],
        imageUrl: 'https://images.unsplash.com/photo-1542272604-787c3835535d',
        additionalImages: [
          'https://images.unsplash.com/photo-1598554747436-c9293d6a588f',
          'https://images.unsplash.com/photo-1541099649105-f69ad21f3246',
          'https://images.unsplash.com/photo-1555689502-c4b22d76c56f'
        ],
        brand: 'Levi\'s',
        stock: 40,
        isNew: false,
        isFeatured: true,
        isOnSale: true
      },
      {
        name: 'Modern Coffee Table',
        slug: 'modern-coffee-table',
        description: 'Stylish coffee table with wooden top and metal legs.',
        price: 229.99,
        compareAtPrice: 279.99,
        categoryId: categoryIds['home'],
        imageUrl: 'https://images.unsplash.com/photo-1532372576444-dda954194ad0',
        additionalImages: [
          'https://images.unsplash.com/photo-1593494042323-518043f21671',
          'https://images.unsplash.com/photo-1560830889-7990dcedf775',
          'https://images.unsplash.com/photo-1564222243703-28f9b49773fa'
        ],
        brand: 'HomeStyles',
        stock: 12,
        isNew: false,
        isFeatured: true,
        isOnSale: true
      },
      {
        name: 'Professional Camera',
        slug: 'professional-camera',
        description: 'High-resolution DSLR camera with 24MP sensor and 4K video recording.',
        price: 1299.99,
        compareAtPrice: 1499.99,
        categoryId: categoryIds['electronics'],
        imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32',
        additionalImages: [
          'https://images.unsplash.com/photo-1502982720700-bfff97f2ecac',
          'https://images.unsplash.com/photo-1520390138845-fd2d229dd553',
          'https://images.unsplash.com/photo-1492136344046-866c85e0bf04'
        ],
        brand: 'CanonTech',
        stock: 8,
        isNew: false,
        isFeatured: true,
        isOnSale: true
      },
      {
        name: 'Premium Yoga Mat',
        slug: 'premium-yoga-mat',
        description: 'Eco-friendly, non-slip yoga mat with optimal cushioning.',
        price: 49.99,
        compareAtPrice: 59.99,
        categoryId: categoryIds['sports'],
        imageUrl: 'https://images.unsplash.com/photo-1590432183878-711d8f9bb4e5',
        additionalImages: [
          'https://images.unsplash.com/photo-1518611012118-696072aa579a',
          'https://images.unsplash.com/photo-1608405908558-3e9d3d295049',
          'https://images.unsplash.com/photo-1518609878373-06d740f60d8b'
        ],
        brand: 'YogaEssentials',
        stock: 30,
        isNew: false,
        isFeatured: true,
        isOnSale: true
      },
      {
        name: 'Designer Desk Lamp',
        slug: 'designer-desk-lamp',
        description: 'Modern LED desk lamp with adjustable brightness and color temperature.',
        price: 79.99,
        compareAtPrice: null,
        categoryId: categoryIds['home'],
        imageUrl: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15',
        additionalImages: [
          'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85',
          'https://images.unsplash.com/photo-1540932239986-30128078f3c5',
          'https://images.unsplash.com/photo-1517991104123-1d56a6e81ed9'
        ],
        brand: 'LightCraft',
        stock: 18,
        isNew: false,
        isFeatured: true,
        isOnSale: false
      },
      {
        name: 'Smart Home Speaker',
        slug: 'smart-home-speaker',
        description: 'Voice-controlled smart speaker with premium sound quality.',
        price: 149.99,
        compareAtPrice: 179.99,
        categoryId: categoryIds['electronics'],
        imageUrl: 'https://images.unsplash.com/photo-1512446816042-444d641267d4',
        additionalImages: [
          'https://images.unsplash.com/photo-1543512214-318c7553f230',
          'https://images.unsplash.com/photo-1589465885857-44edb59bbff2',
          'https://images.unsplash.com/photo-1596170272476-9a0fecbca046'
        ],
        brand: 'EchoTech',
        stock: 22,
        isNew: false,
        isFeatured: true,
        isOnSale: true
      }
    ];

    // Seed products - New Arrivals (at least 10)
    const newArrivalsProducts = [
      {
        name: 'Smartwatch Pro',
        slug: 'smartwatch-pro',
        description: 'Advanced fitness tracking smartwatch with heart rate monitor and GPS.',
        price: 249.99,
        compareAtPrice: null,
        categoryId: categoryIds['electronics'],
        imageUrl: 'https://images.unsplash.com/photo-1611930022073-84f59b95951d',
        additionalImages: [
          'https://images.unsplash.com/photo-1518131672697-613becd4fab5',
          'https://images.unsplash.com/photo-1565829669130-28255913d179',
          'https://images.unsplash.com/photo-1575311373937-040b8e1fd94e'
        ],
        brand: 'TechFit',
        stock: 20,
        isNew: true,
        isFeatured: false,
        isOnSale: false
      },
      {
        name: 'Bluetooth Speaker',
        slug: 'bluetooth-speaker',
        description: 'Portable Bluetooth speaker with powerful bass and 24-hour battery life.',
        price: 79.99,
        compareAtPrice: null,
        categoryId: categoryIds['electronics'],
        imageUrl: 'https://images.unsplash.com/photo-1555487505-8603a1a69755',
        additionalImages: [
          'https://images.unsplash.com/photo-1543512214-318c7553f230',
          'https://images.unsplash.com/photo-1558756520-22cfe5d382ca',
          'https://images.unsplash.com/photo-1608501267184-3c1bea2f818e'
        ],
        brand: 'SoundMax',
        stock: 35,
        isNew: true,
        isFeatured: false,
        isOnSale: false
      },
      {
        name: 'Fitness Tracker',
        slug: 'fitness-tracker',
        description: 'Lightweight fitness band with heart rate monitoring and sleep tracking.',
        price: 59.99,
        compareAtPrice: 69.99,
        categoryId: categoryIds['health'],
        imageUrl: 'https://images.unsplash.com/photo-1546868871-0d0e4aa4839a',
        additionalImages: [
          'https://images.unsplash.com/photo-1576243345690-4e4b79b63288',
          'https://images.unsplash.com/photo-1583175499379-4c8a696c83a1',
          'https://images.unsplash.com/photo-1575311386875-5d5b5f51a7f1'
        ],
        brand: 'FitLife',
        stock: 45,
        isNew: true,
        isFeatured: false,
        isOnSale: true
      },
      {
        name: 'Wireless Earbuds',
        slug: 'wireless-earbuds',
        description: 'Compact wireless earbuds with noise isolation and touch controls.',
        price: 99.99,
        compareAtPrice: 119.99,
        categoryId: categoryIds['electronics'],
        imageUrl: 'https://images.unsplash.com/photo-1608156639585-b3a032e39d60',
        additionalImages: [
          'https://images.unsplash.com/photo-1614179817864-88bf945896e2',
          'https://images.unsplash.com/photo-1610386403038-e9585cf4b5a9',
          'https://images.unsplash.com/photo-1610386402270-9479e64dc4d6'
        ],
        brand: 'AudioPro',
        stock: 30,
        isNew: true,
        isFeatured: false,
        isOnSale: true
      },
      {
        name: 'Smart Blender',
        slug: 'smart-blender',
        description: 'WiFi-enabled blender with app control and preset programs.',
        price: 129.99,
        compareAtPrice: 149.99,
        categoryId: categoryIds['kitchen'],
        imageUrl: 'https://images.unsplash.com/photo-1570222094114-d054a817e56b',
        additionalImages: [
          'https://images.unsplash.com/photo-1578167635636-b716c1707075',
          'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf',
          'https://images.unsplash.com/photo-1585237017125-24baf8d7406f'
        ],
        brand: 'KitchenTech',
        stock: 20,
        isNew: true,
        isFeatured: false,
        isOnSale: true
      },
      {
        name: 'Ultra-light Laptop',
        slug: 'ultra-light-laptop',
        description: 'Powerful laptop weighing just 2.2 pounds with 12-hour battery life.',
        price: 1299.99,
        compareAtPrice: null,
        categoryId: categoryIds['electronics'],
        imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853',
        additionalImages: [
          'https://images.unsplash.com/photo-1541807084-5c52b6b3adef',
          'https://images.unsplash.com/photo-1504707748692-419802cf939d',
          'https://images.unsplash.com/photo-1527698266440-12104e498b76'
        ],
        brand: 'TechBook',
        stock: 15,
        isNew: true,
        isFeatured: false,
        isOnSale: false
      },
      {
        name: 'Stylish Backpack',
        slug: 'stylish-backpack',
        description: 'Water-resistant backpack with laptop compartment and USB charging port.',
        price: 59.99,
        compareAtPrice: 79.99,
        categoryId: categoryIds['fashion'],
        imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62',
        additionalImages: [
          'https://images.unsplash.com/photo-1584917865442-de89df76afd3',
          'https://images.unsplash.com/photo-1581605405217-97d8e164fdb6',
          'https://images.unsplash.com/photo-1491637639811-60e2756cc1c7'
        ],
        brand: 'UrbanPack',
        stock: 28,
        isNew: true,
        isFeatured: false,
        isOnSale: true
      },
      {
        name: 'Smart Plant Pot',
        slug: 'smart-plant-pot',
        description: 'Self-watering pot that monitors soil moisture, light, and temperature.',
        price: 49.99,
        compareAtPrice: null,
        categoryId: categoryIds['home'],
        imageUrl: 'https://images.unsplash.com/photo-1583828480318-4b64b5daf6ae',
        additionalImages: [
          'https://images.unsplash.com/photo-1604881988758-f76ad2f7aac1',
          'https://images.unsplash.com/photo-1617104678098-de229db51175',
          'https://images.unsplash.com/photo-1622547748225-3fc4abd2cca0'
        ],
        brand: 'GreenTech',
        stock: 25,
        isNew: true,
        isFeatured: false,
        isOnSale: false
      },
      {
        name: 'Kids Smart Watch',
        slug: 'kids-smart-watch',
        description: 'Child-friendly smartwatch with location tracking and SOS feature.',
        price: 89.99,
        compareAtPrice: 99.99,
        categoryId: categoryIds['kids'],
        imageUrl: 'https://images.unsplash.com/photo-1543310465-797the918410c',
        additionalImages: [
          'https://images.unsplash.com/photo-1593681641033-f7f5717cdf2b',
          'https://images.unsplash.com/photo-1566838318639-8971f40a33cc',
          'https://images.unsplash.com/photo-1559297661-b6d6f3e15b67'
        ],
        brand: 'KidSafe',
        stock: 22,
        isNew: true,
        isFeatured: false,
        isOnSale: true
      },
      {
        name: 'Digital Art Tablet',
        slug: 'digital-art-tablet',
        description: 'High-precision drawing tablet with tilt recognition and customizable buttons.',
        price: 169.99,
        compareAtPrice: 199.99,
        categoryId: categoryIds['electronics'],
        imageUrl: 'https://images.unsplash.com/photo-1587740902008-c5e3d92d52f2',
        additionalImages: [
          'https://images.unsplash.com/photo-1558097243-8011a4fcc7e3',
          'https://images.unsplash.com/photo-1629208850937-99433f217500',
          'https://images.unsplash.com/photo-1602837385569-08fba3fa49b3'
        ],
        brand: 'CreativeTech',
        stock: 18,
        isNew: true,
        isFeatured: false,
        isOnSale: true
      }
    ];

    // Seed products - Regular Products
    const regularProducts = [
      {
        name: 'Gaming Keyboard',
        slug: 'gaming-keyboard',
        description: 'Mechanical RGB gaming keyboard with programmable keys and wrist rest.',
        price: 129.99,
        compareAtPrice: 149.99,
        categoryId: categoryIds['electronics'],
        imageUrl: 'https://images.unsplash.com/photo-1541140532154-b024d705b90a',
        additionalImages: [
          'https://images.unsplash.com/photo-1587829741301-dc798b83add3',
          'https://images.unsplash.com/photo-1593878596127-008c2941a3e0',
          'https://images.unsplash.com/photo-1602097944182-c43423419422'
        ],
        brand: 'GamePro',
        stock: 20,
        isNew: false,
        isFeatured: false,
        isOnSale: true
      },
      {
        name: 'Ergonomic Office Chair',
        slug: 'ergonomic-office-chair',
        description: 'Adjustable mesh office chair with lumbar support and headrest.',
        price: 249.99,
        compareAtPrice: 299.99,
        categoryId: categoryIds['home'],
        imageUrl: 'https://images.unsplash.com/photo-1589384267710-7a170981ca78',
        additionalImages: [
          'https://images.unsplash.com/photo-1505843490578-27c335e4490d',
          'https://images.unsplash.com/photo-1580480055273-228ff5388ef8',
          'https://images.unsplash.com/photo-1519947486511-46149fa0a254'
        ],
        brand: 'ComfortPlus',
        stock: 10,
        isNew: false,
        isFeatured: false,
        isOnSale: true
      },
      {
        name: 'Portable Power Bank',
        slug: 'portable-power-bank',
        description: 'Fast-charging power bank with 20,000mAh capacity and multiple ports.',
        price: 49.99,
        compareAtPrice: 59.99,
        categoryId: categoryIds['electronics'],
        imageUrl: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5',
        additionalImages: [
          'https://images.unsplash.com/photo-1618931692805-2027a3234e8c',
          'https://images.unsplash.com/photo-1610792516820-95a3099a9bc2',
          'https://images.unsplash.com/photo-1593508512255-86ab42a8e620'
        ],
        brand: 'PowerTech',
        stock: 35,
        isNew: false,
        isFeatured: false,
        isOnSale: true
      },
      {
        name: 'Professional Hair Dryer',
        slug: 'professional-hair-dryer',
        description: 'Salon-quality hair dryer with ionic technology and multiple heat settings.',
        price: 89.99,
        compareAtPrice: 109.99,
        categoryId: categoryIds['health'],
        imageUrl: 'https://images.unsplash.com/photo-1588436706487-9d55d73a39e3',
        additionalImages: [
          'https://images.unsplash.com/photo-1562157873-818bc0726f68',
          'https://images.unsplash.com/photo-1589710751893-f9a6770ad71b',
          'https://images.unsplash.com/photo-1596377107439-59d306e025e8'
        ],
        brand: 'BeautyPro',
        stock: 18,
        isNew: false,
        isFeatured: false,
        isOnSale: true
      },
      {
        name: 'Chef\'s Knife Set',
        slug: 'chefs-knife-set',
        description: 'Professional 6-piece knife set with German steel and wooden block.',
        price: 129.99,
        compareAtPrice: 159.99,
        categoryId: categoryIds['kitchen'],
        imageUrl: 'https://images.unsplash.com/photo-1593618998160-e34014e67546',
        additionalImages: [
          'https://images.unsplash.com/photo-1614213824357-7a5b478e0b4d',
          'https://images.unsplash.com/photo-1592423777039-51fa40a1a79d',
          'https://images.unsplash.com/photo-1591104143577-e01f4cca3cd7'
        ],
        brand: 'CulinaryPro',
        stock: 15,
        isNew: false,
        isFeatured: false,
        isOnSale: true
      }
    ];
    
    // Combine all products
    const allProducts = [...featuredProducts, ...newArrivalsProducts, ...regularProducts];
    
    // Create products
    allProducts.forEach(product => {
      this.createProduct(product as any);
    });
    
    // Seed reviews
    const reviews = [
      {
        productId: 1,
        userId: 2,
        rating: 5,
        comment: "These Nike Air Max shoes are amazing! So comfortable and stylish."
      },
      {
        productId: 1,
        userId: 1,
        rating: 4,
        comment: "Great shoes, but runs a bit small. Order half a size up."
      },
      {
        productId: 2,
        userId: 2,
        rating: 5,
        comment: "The Smart Watch X3 has incredible battery life and features."
      },
      {
        productId: 3,
        userId: 1,
        rating: 4,
        comment: "Good noise cancellation, but the ear cups could be more comfortable."
      },
      {
        productId: 5,
        userId: 2,
        rating: 5,
        comment: "These jeans are perfect! Fit exactly as expected and great quality."
      },
      {
        productId: 6,
        userId: 1,
        rating: 4,
        comment: "Beautiful coffee table, easy to assemble. Looks more expensive than it is!"
      },
      {
        productId: 7,
        userId: 2,
        rating: 5,
        comment: "Amazing image quality, worth every penny. The battery life is impressive too."
      },
      {
        productId: 8,
        userId: 1,
        rating: 5,
        comment: "Best yoga mat I've ever used. Great grip and perfect thickness."
      },
      {
        productId: 11,
        userId: 2,
        rating: 4,
        comment: "Impressive fitness tracking accuracy. The sleep tracking is particularly helpful."
      },
      {
        productId: 12,
        userId: 1,
        rating: 5,
        comment: "Sound quality is amazing for such small earbuds. Comfortable for long periods too."
      }
    ];
    
    reviews.forEach(review => {
      this.createReview(review);
    });
  }
}

export const storage = new MemStorage();
