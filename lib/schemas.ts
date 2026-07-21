import { z } from "zod";

export const createBookingSchema = z.object({
  providerId: z.number().int().positive(),
  description: z
    .string()
    .trim()
    .min(5, "Description must be at least 5 characters")
    .max(500),
  amount: z.number().int().positive("Amount must be greater than 0"),
});

export const updateBookingSchema = z.object({
  status: z.enum(["PAID", "COMPLETED", "CANCELLED"]),
});

export const createReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().max(500).optional(),
});

export const createReportSchema = z
  .object({
    providerId: z.number().int().positive().optional(),
    conversationId: z.string().cuid().optional(),
    reason: z.enum([
      "SPAM",
      "SCAM_OR_FRAUD",
      "INAPPROPRIATE_BEHAVIOR",
      "FAKE_PROFILE",
      "OTHER",
    ]),
    details: z.string().trim().max(500).optional(),
  })
  .refine((data) => data.providerId || data.conversationId, {
    message: "Must specify who you're reporting",
  });

export const createPostSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters")
    .max(120),
  description: z.string().trim().max(1000).optional(),
  categoryId: z.string().cuid(),
  images: z.array(z.string().url()).max(5, "Maximum 5 photos").optional(),
});

export const updatePostSchema = createPostSchema.partial();

export const createProviderSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(100),
  phone: z.string().trim().min(9, "Enter a valid phone number").max(15),
  bio: z.string().trim().max(500).optional(),
  categoryId: z.string().cuid(),
  subcategoryIds: z.array(z.string().cuid()).optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  imageUrl: z.string().url().optional().nullable(),
});

export const updateProviderSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  phone: z.string().trim().min(9).max(15).optional(),
  bio: z.string().trim().max(500).optional(),
  isAvailable: z.boolean().optional(),
  subcategoryIds: z.array(z.string().cuid()).optional(),
  imageUrl: z.string().url().optional().nullable(),
});

export const postCommentSchema = z.object({
  text: z.string().trim().min(1, "Comment cannot be empty").max(500),
  parentId: z.string().cuid().optional(),
  mentionedUserId: z.string().optional(),
});
