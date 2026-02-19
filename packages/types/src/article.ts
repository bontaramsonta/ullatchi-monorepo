import { z } from "zod";

export const articleSubmissionSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .min(10, "Title must be at least 10 characters")
    .max(200, "Title must be less than 200 characters"),
  description: z
    .string()
    .trim()
    .max(500, "Description must be less than 500 characters")
    .optional()
    .default(""),
  cardDescription: z
    .string()
    .trim()
    .max(200, "Card description must be less than 200 characters")
    .optional()
    .default(""),
  content: z.string().min(1, "Article content is required"),
  authorName: z
    .string()
    .trim()
    .min(1, "Author display name is required")
    .min(2, "Author display name must be at least 2 characters")
    .max(100, "Author display name must be less than 100 characters"),
  authorBio: z
    .string()
    .trim()
    .max(500, "Author bio must be less than 500 characters")
    .optional()
    .default(""),
});

export type ArticleSubmission = z.infer<typeof articleSubmissionSchema>;
