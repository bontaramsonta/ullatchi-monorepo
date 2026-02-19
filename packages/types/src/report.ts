import { z } from "zod";

export const reportSubmissionSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().trim().optional().default(""),
  location: z.string().optional(),
  category: z.string().optional(),
});

export type ReportSubmission = z.infer<typeof reportSubmissionSchema>;
