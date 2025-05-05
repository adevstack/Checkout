import { z } from "zod";
import { 
  insertUserSchema,
  insertProductSchema,
  insertOrderSchema,
  insertReviewSchema
} from "@shared/schema";

// Enhanced user registration schema with validation
export const registerSchema = insertUserSchema.extend({
  confirmPassword: z.string().min(1, { message: "Confirm password is required" }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Login schema with validation
export const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

// Product schema with additional validation
export const productFormSchema = insertProductSchema
  .omit({ createdAt: true })
  .extend({
    imageFile: z.instanceof(File).optional(),
    additionalImageFiles: z.array(z.instanceof(File)).optional(),
  });

// Review schema with validation
export const reviewFormSchema = insertReviewSchema
  .omit({ userId: true, createdAt: true })
  .extend({
    comment: z
      .string()
      .min(5, { message: "Comment must be at least 5 characters" })
      .optional(),
  });

// Address form schema
export const addressFormSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().min(1, { message: "Last name is required" }),
  email: z.string().email({ message: "Please enter a valid email" }),
  address: z.string().min(1, { message: "Address is required" }),
  city: z.string().min(1, { message: "City is required" }),
  state: z.string().min(1, { message: "State is required" }),
  zipCode: z.string().min(1, { message: "ZIP code is required" }),
  country: z.string().min(1, { message: "Country is required" }),
});

// Payment form schema
export const paymentFormSchema = z.object({
  paymentMethod: z.enum(["creditCard", "paypal"]),
  cardNumber: z
    .string()
    .regex(/^\d{16}$/, { message: "Card number must be 16 digits" })
    .optional()
    .or(z.literal("")),
  cardName: z.string().optional(),
  expiryDate: z
    .string()
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, { message: "Expiry date must be in MM/YY format" })
    .optional()
    .or(z.literal("")),
  cvv: z
    .string()
    .regex(/^\d{3,4}$/, { message: "CVV must be 3 or 4 digits" })
    .optional()
    .or(z.literal("")),
}).refine(
  (data) => {
    if (data.paymentMethod === "creditCard") {
      return !!data.cardNumber && !!data.cardName && !!data.expiryDate && !!data.cvv;
    }
    return true;
  },
  {
    message: "Credit card details are required",
    path: ["cardNumber"],
  }
);

// Profile update schema
export const profileUpdateSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6, { message: "New password must be at least 6 characters" }).optional(),
  confirmNewPassword: z.string().optional(),
}).refine(
  (data) => {
    if (data.newPassword && data.newPassword !== data.confirmNewPassword) {
      return false;
    }
    return true;
  },
  {
    message: "New passwords don't match",
    path: ["confirmNewPassword"],
  }
).refine(
  (data) => {
    if (data.newPassword && !data.currentPassword) {
      return false;
    }
    return true;
  },
  {
    message: "Current password is required to set a new password",
    path: ["currentPassword"],
  }
);

// Order filter schema for admin
export const orderFilterSchema = z.object({
  status: z.enum(["all", "pending", "processing", "shipped", "delivered", "cancelled"]).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  customerId: z.number().optional(),
});

// Product filter schema for admin
export const productFilterSchema = z.object({
  category: z.string().optional(),
  status: z.enum(["all", "in-stock", "out-of-stock", "featured", "on-sale", "new"]).optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  search: z.string().optional(),
});
