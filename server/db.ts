import { IStorage, MemStorage } from "./storage";
import { PrismaStorage } from "./prisma-storage";

// Choose which storage implementation to use
// We'll use MongoDB with Prisma for both development and production
const useMongoDB = true; // Set to true to use MongoDB, false to use in-memory storage
const storage: IStorage = useMongoDB
  ? new PrismaStorage() // MongoDB with Prisma
  : new MemStorage();   // In-memory storage

// Initialize data if needed
(async () => {
  try {
    if (storage instanceof PrismaStorage) {
      await storage.seedData();
      console.log("MongoDB data seeded successfully");
    }
  } catch (error) {
    console.error("Error initializing MongoDB storage:", error);
  }
})();

export { storage };