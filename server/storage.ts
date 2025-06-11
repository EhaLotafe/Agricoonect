import {
  users,
  products,
  orders,
  reviews,
  contacts,
  type User,
  type InsertUser,
  type Product,
  type InsertProduct,
  type Order,
  type InsertOrder,
  type Review,
  type InsertReview,
  type Contact,
  type InsertContact,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, like, sql, asc } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User>;
  getAllUsers(): Promise<User[]>;

  // Product operations
  getProduct(id: number): Promise<Product | undefined>;
  getProductWithFarmer(id: number): Promise<(Product & { farmer: User }) | undefined>;
  getProductsByFarmer(farmerId: number): Promise<Product[]>;
  getAllProducts(filters?: {
    category?: string;
    province?: string;
    search?: string;
    saleMode?: string;
    isActive?: boolean;
    isApproved?: boolean;
  }): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product>;
  deleteProduct(id: number): Promise<void>;
  approveProduct(id: number): Promise<Product>;

  // Order operations
  getOrder(id: number): Promise<Order | undefined>;
  getOrderWithDetails(id: number): Promise<(Order & { product: Product; farmer: User; buyer: User }) | undefined>;
  getOrdersByBuyer(buyerId: number): Promise<(Order & { product: Product; farmer: User })[]>;
  getOrdersByFarmer(farmerId: number): Promise<(Order & { product: Product; buyer: User })[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: number, order: Partial<InsertOrder>): Promise<Order>;

  // Review operations
  getReviewsByProduct(productId: number): Promise<(Review & { buyer: User })[]>;
  createReview(review: InsertReview): Promise<Review>;
  getAverageRating(productId: number): Promise<number>;

  // Contact operations
  getContactsByFarmer(farmerId: number): Promise<(Contact & { buyer: User; product: Product })[]>;
  createContact(contact: InsertContact): Promise<Contact>;
  updateContact(id: number, contact: Partial<InsertContact>): Promise<Contact>;

  // Statistics
  getStats(): Promise<{
    totalFarmers: number;
    totalProducts: number;
    totalOrders: number;
    totalProvinces: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...userData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async getProductWithFarmer(id: number): Promise<(Product & { farmer: User }) | undefined> {
    const result = await db
      .select({
        id: products.id,
        farmerId: products.farmerId,
        name: products.name,
        description: products.description,
        category: products.category,
        price: products.price,
        unit: products.unit,
        quantity: products.quantity,
        availableQuantity: products.availableQuantity,
        saleMode: products.saleMode,
        location: products.location,
        province: products.province,
        images: products.images,
        isActive: products.isActive,
        isApproved: products.isApproved,
        createdAt: products.createdAt,
        updatedAt: products.updatedAt,
        farmer: users,
      })
      .from(products)
      .leftJoin(users, eq(products.farmerId, users.id))
      .where(eq(products.id, id));

    if (result.length === 0) return undefined;

    const row = result[0];
    return {
      ...row,
      farmer: row.farmer!,
    };
  }

  async getProductsByFarmer(farmerId: number): Promise<Product[]> {
    return await db
      .select()
      .from(products)
      .where(eq(products.farmerId, farmerId))
      .orderBy(desc(products.createdAt));
  }

  async getAllProducts(filters?: {
    category?: string;
    province?: string;
    search?: string;
    saleMode?: string;
    isActive?: boolean;
    isApproved?: boolean;
  }): Promise<Product[]> {
    let query = db.select().from(products);
    
    const conditions = [];
    
    if (filters?.isActive !== undefined) {
      conditions.push(eq(products.isActive, filters.isActive));
    }
    
    if (filters?.isApproved !== undefined) {
      conditions.push(eq(products.isApproved, filters.isApproved));
    }
    
    if (filters?.category) {
      conditions.push(eq(products.category, filters.category));
    }
    
    if (filters?.province) {
      conditions.push(eq(products.province, filters.province));
    }
    
    if (filters?.saleMode) {
      conditions.push(eq(products.saleMode, filters.saleMode));
    }
    
    if (filters?.search) {
      conditions.push(like(products.name, `%${filters.search}%`));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    return await query.orderBy(desc(products.createdAt));
  }

  async createProduct(productData: InsertProduct): Promise<Product> {
    const [product] = await db.insert(products).values(productData).returning();
    return product;
  }

  async updateProduct(id: number, productData: Partial<InsertProduct>): Promise<Product> {
    const [product] = await db
      .update(products)
      .set({ ...productData, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    return product;
  }

  async deleteProduct(id: number): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }

  async approveProduct(id: number): Promise<Product> {
    const [product] = await db
      .update(products)
      .set({ isApproved: true, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    return product;
  }

  async getOrder(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }

  async getOrderWithDetails(id: number): Promise<(Order & { product: Product; farmer: User; buyer: User }) | undefined> {
    const result = await db
      .select({
        order: orders,
        product: products,
        farmer: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          phone: users.phone,
          email: users.email,
        },
        buyer: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          phone: users.phone,
          email: users.email,
        },
      })
      .from(orders)
      .leftJoin(products, eq(orders.productId, products.id))
      .leftJoin(users, eq(orders.farmerId, users.id))
      .where(eq(orders.id, id));

    if (result.length === 0) return undefined;

    const row = result[0];
    return {
      ...row.order,
      product: row.product!,
      farmer: row.farmer as User,
      buyer: row.buyer as User,
    };
  }

  async getOrdersByBuyer(buyerId: number): Promise<(Order & { product: Product; farmer: User })[]> {
    const result = await db
      .select({
        order: orders,
        product: products,
        farmer: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          phone: users.phone,
          email: users.email,
        },
      })
      .from(orders)
      .leftJoin(products, eq(orders.productId, products.id))
      .leftJoin(users, eq(orders.farmerId, users.id))
      .where(eq(orders.buyerId, buyerId))
      .orderBy(desc(orders.createdAt));

    return result.map(row => ({
      ...row.order,
      product: row.product!,
      farmer: row.farmer as User,
    }));
  }

  async getOrdersByFarmer(farmerId: number): Promise<(Order & { product: Product; buyer: User })[]> {
    const result = await db
      .select({
        order: orders,
        product: products,
        buyer: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          phone: users.phone,
          email: users.email,
        },
      })
      .from(orders)
      .leftJoin(products, eq(orders.productId, products.id))
      .leftJoin(users, eq(orders.buyerId, users.id))
      .where(eq(orders.farmerId, farmerId))
      .orderBy(desc(orders.createdAt));

    return result.map(row => ({
      ...row.order,
      product: row.product!,
      buyer: row.buyer as User,
    }));
  }

  async createOrder(orderData: InsertOrder): Promise<Order> {
    const [order] = await db.insert(orders).values(orderData).returning();
    return order;
  }

  async updateOrder(id: number, orderData: Partial<InsertOrder>): Promise<Order> {
    const [order] = await db
      .update(orders)
      .set({ ...orderData, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return order;
  }

  async getReviewsByProduct(productId: number): Promise<(Review & { buyer: User })[]> {
    const result = await db
      .select({
        review: reviews,
        buyer: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
        },
      })
      .from(reviews)
      .leftJoin(users, eq(reviews.buyerId, users.id))
      .where(eq(reviews.productId, productId))
      .orderBy(desc(reviews.createdAt));

    return result.map(row => ({
      ...row.review,
      buyer: row.buyer as User,
    }));
  }

  async createReview(reviewData: InsertReview): Promise<Review> {
    const [review] = await db.insert(reviews).values(reviewData).returning();
    return review;
  }

  async getAverageRating(productId: number): Promise<number> {
    const result = await db
      .select({ avg: sql<number>`avg(${reviews.rating})` })
      .from(reviews)
      .where(eq(reviews.productId, productId));
    
    return result[0]?.avg || 0;
  }

  async getContactsByFarmer(farmerId: number): Promise<(Contact & { buyer: User; product: Product })[]> {
    const result = await db
      .select({
        contact: contacts,
        buyer: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
          phone: users.phone,
        },
        product: {
          id: products.id,
          name: products.name,
        },
      })
      .from(contacts)
      .leftJoin(users, eq(contacts.buyerId, users.id))
      .leftJoin(products, eq(contacts.productId, products.id))
      .where(eq(contacts.farmerId, farmerId))
      .orderBy(desc(contacts.createdAt));

    return result.map(row => ({
      ...row.contact,
      buyer: row.buyer as User,
      product: row.product as Product,
    }));
  }

  async createContact(contactData: InsertContact): Promise<Contact> {
    const [contact] = await db.insert(contacts).values(contactData).returning();
    return contact;
  }

  async updateContact(id: number, contactData: Partial<InsertContact>): Promise<Contact> {
    const [contact] = await db
      .update(contacts)
      .set(contactData)
      .where(eq(contacts.id, id))
      .returning();
    return contact;
  }

  async getStats(): Promise<{
    totalFarmers: number;
    totalProducts: number;
    totalOrders: number;
    totalProvinces: number;
  }> {
    const [farmerCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(eq(users.userType, 'farmer'));

    const [productCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(products)
      .where(and(eq(products.isActive, true), eq(products.isApproved, true)));

    const [orderCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(orders);

    const provinces = await db
      .select({ province: products.province })
      .from(products)
      .groupBy(products.province);

    return {
      totalFarmers: farmerCount.count,
      totalProducts: productCount.count,
      totalOrders: orderCount.count,
      totalProvinces: provinces.length,
    };
  }
}

export const storage = new DatabaseStorage();
