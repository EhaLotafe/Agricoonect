import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertProductSchema, insertOrderSchema, insertReviewSchema, insertContactSchema } from "@shared/schema";
import bcrypt from "bcrypt";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "Un utilisateur avec cet email existe déjà" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
      });

      // Remove password from response
      const { password, ...userResponse } = user;
      res.json(userResponse);
    } catch (error) {
      console.error("Registration error:", error);
      res.status(400).json({ message: "Erreur lors de l'inscription" });
    }
  });

  app.post("/api/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Email ou mot de passe incorrect" });
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ message: "Email ou mot de passe incorrect" });
      }

      // Remove password from response
      const { password: _, ...userResponse } = user;
      res.json(userResponse);
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Erreur lors de la connexion" });
    }
  });

  // Product routes
  app.get("/api/products", async (req, res) => {
    try {
      const { category, province, search, saleMode, approved } = req.query;
      
      const filters: any = {
        isActive: true,
      };
      
      if (approved !== 'false') {
        filters.isApproved = true;
      }
      
      if (category) filters.category = category as string;
      if (province) filters.province = province as string;
      if (search) filters.search = search as string;
      if (saleMode) filters.saleMode = saleMode as string;

      const products = await storage.getAllProducts(filters);
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Erreur lors de la récupération des produits" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const product = await storage.getProduct(id);
      
      if (!product) {
        return res.status(404).json({ message: "Produit non trouvé" });
      }

      res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ message: "Erreur lors de la récupération du produit" });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      
      const product = await storage.createProduct({
        ...productData,
        availableQuantity: productData.quantity,
      });

      res.json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(400).json({ message: "Erreur lors de la création du produit" });
    }
  });

  app.put("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const productData = req.body;
      
      const product = await storage.updateProduct(id, productData);
      res.json(product);
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(400).json({ message: "Erreur lors de la mise à jour du produit" });
    }
  });

  app.delete("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteProduct(id);
      res.json({ message: "Produit supprimé avec succès" });
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ message: "Erreur lors de la suppression du produit" });
    }
  });

  app.get("/api/farmer/:farmerId/products", async (req, res) => {
    try {
      const farmerId = parseInt(req.params.farmerId);
      const products = await storage.getProductsByFarmer(farmerId);
      res.json(products);
    } catch (error) {
      console.error("Error fetching farmer products:", error);
      res.status(500).json({ message: "Erreur lors de la récupération des produits de l'agriculteur" });
    }
  });

  // Order routes
  app.post("/api/orders", async (req, res) => {
    try {
      const orderData = insertOrderSchema.parse(req.body);
      
      // Check if product has enough quantity
      const product = await storage.getProduct(orderData.productId);
      if (!product || product.availableQuantity < orderData.quantity) {
        return res.status(400).json({ message: "Quantité insuffisante disponible" });
      }

      const order = await storage.createOrder(orderData);
      
      // Update product available quantity
      await storage.updateProduct(orderData.productId, {
        availableQuantity: product.availableQuantity - orderData.quantity,
      });

      res.json(order);
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(400).json({ message: "Erreur lors de la création de la commande" });
    }
  });

  app.get("/api/buyer/:buyerId/orders", async (req, res) => {
    try {
      const buyerId = parseInt(req.params.buyerId);
      const orders = await storage.getOrdersByBuyer(buyerId);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching buyer orders:", error);
      res.status(500).json({ message: "Erreur lors de la récupération des commandes" });
    }
  });

  app.get("/api/farmer/:farmerId/orders", async (req, res) => {
    try {
      const farmerId = parseInt(req.params.farmerId);
      const orders = await storage.getOrdersByFarmer(farmerId);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching farmer orders:", error);
      res.status(500).json({ message: "Erreur lors de la récupération des commandes" });
    }
  });

  app.put("/api/orders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const orderData = req.body;
      
      const order = await storage.updateOrder(id, orderData);
      res.json(order);
    } catch (error) {
      console.error("Error updating order:", error);
      res.status(400).json({ message: "Erreur lors de la mise à jour de la commande" });
    }
  });

  // Review routes
  app.get("/api/products/:productId/reviews", async (req, res) => {
    try {
      const productId = parseInt(req.params.productId);
      const reviews = await storage.getReviewsByProduct(productId);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: "Erreur lors de la récupération des avis" });
    }
  });

  app.post("/api/reviews", async (req, res) => {
    try {
      const reviewData = insertReviewSchema.parse(req.body);
      const review = await storage.createReview(reviewData);
      res.json(review);
    } catch (error) {
      console.error("Error creating review:", error);
      res.status(400).json({ message: "Erreur lors de la création de l'avis" });
    }
  });

  app.get("/api/products/:productId/rating", async (req, res) => {
    try {
      const productId = parseInt(req.params.productId);
      const rating = await storage.getAverageRating(productId);
      res.json({ rating });
    } catch (error) {
      console.error("Error fetching rating:", error);
      res.status(500).json({ message: "Erreur lors de la récupération de la note" });
    }
  });

  // Contact routes
  app.post("/api/contacts", async (req, res) => {
    try {
      const contactData = insertContactSchema.parse(req.body);
      const contact = await storage.createContact(contactData);
      res.json(contact);
    } catch (error) {
      console.error("Error creating contact:", error);
      res.status(400).json({ message: "Erreur lors de la création du contact" });
    }
  });

  app.get("/api/farmer/:farmerId/contacts", async (req, res) => {
    try {
      const farmerId = parseInt(req.params.farmerId);
      const contacts = await storage.getContactsByFarmer(farmerId);
      res.json(contacts);
    } catch (error) {
      console.error("Error fetching contacts:", error);
      res.status(500).json({ message: "Erreur lors de la récupération des contacts" });
    }
  });

  app.put("/api/contacts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const contactData = req.body;
      
      const contact = await storage.updateContact(id, contactData);
      res.json(contact);
    } catch (error) {
      console.error("Error updating contact:", error);
      res.status(400).json({ message: "Erreur lors de la mise à jour du contact" });
    }
  });

  // Admin routes
  app.get("/api/admin/users", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Erreur lors de la récupération des utilisateurs" });
    }
  });

  app.get("/api/admin/products", async (req, res) => {
    try {
      const products = await storage.getAllProducts({ isActive: true });
      res.json(products);
    } catch (error) {
      console.error("Error fetching admin products:", error);
      res.status(500).json({ message: "Erreur lors de la récupération des produits" });
    }
  });

  app.put("/api/admin/products/:id/approve", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const product = await storage.approveProduct(id);
      res.json(product);
    } catch (error) {
      console.error("Error approving product:", error);
      res.status(400).json({ message: "Erreur lors de l'approbation du produit" });
    }
  });

  // Statistics
  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Erreur lors de la récupération des statistiques" });
    }
  });

  // Categories and provinces (static data for DRC)
  app.get("/api/categories", async (req, res) => {
    res.json([
      "Légumes",
      "Fruits",
      "Céréales",
      "Légumineuses",
      "Tubercules",
      "Épices",
      "Produits laitiers",
      "Viandes",
      "Poissons",
      "Autres"
    ]);
  });

  app.get("/api/provinces", async (req, res) => {
    res.json([
      "Kinshasa",
      "Haut-Katanga",
      "Lualaba",
      "Kasaï-Oriental",
      "Kasaï",
      "Kasaï-Central",
      "Lomami",
      "Sankuru",
      "Maniema",
      "Sud-Kivu",
      "Nord-Kivu",
      "Ituri",
      "Haut-Uele",
      "Bas-Uele",
      "Tshopo",
      "Mongala",
      "Sud-Ubangi",
      "Nord-Ubangi",
      "Équateur",
      "Tshuapa",
      "Mai-Ndombe",
      "Kwilu",
      "Kwango",
      "Kongo-Central"
    ]);
  });

  const httpServer = createServer(app);
  return httpServer;
}
