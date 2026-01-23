import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  role: z.enum(["mentor", "student"], {
    required_error: "Role is required",
    invalid_type_error: "Role must be either 'mentor' or 'student'"
  }),
  email: z.string().email("Please provide a valid email"),
  password: z.string()
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password cannot exceed 100 characters"),
  phoneNumber: z.string().optional()
});

export const loginSchema = z.object({
  email: z.string().email("Please provide a valid email"),
  password: z.string().min(1, "Password is required")
});

export const updateUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  phoneNumber: z.string().optional(),
  bio: z.string().optional(),
  hourlyRate: z.number().min(0, "Hourly rate must be positive").optional()
});

export const createSkillSchema = z.object({
  name: z.string().min(1, "Skill name is required").trim()
});

export const addSkillsToMentorSchema = z.object({
  skillIds: z.array(z.string()).min(1, "At least one skill ID is required")
});

export const createSessionSchema = z.object({
  mentorId: z.string().min(1, "Mentor ID is required"),
  studentId: z.string().min(1, "Student ID is required"),
  start: z.string().datetime("Invalid start date format"),
  end: z.string().datetime("Invalid end date format")
});

export const updateSessionStatusSchema = z.object({
  status: z.enum(["pending", "paid", "cancelled", "completed"], {
    required_error: "Status is required",
    invalid_type_error: "Invalid status value"
  })
});

export const createPaymentSchema = z.object({
  sessionId: z.string().min(1, "Session ID is required"),
  amount: z.number().min(0, "Amount must be positive"),
  providerTxnId: z.string().optional()
});

export const updatePaymentStatusSchema = z.object({
  status: z.enum(["initiated", "success", "failed"], {
    required_error: "Status is required",
    invalid_type_error: "Invalid status value"
  }),
  providerTxnId: z.string().optional()
});

export const createReviewSchema = z.object({
  sessionId: z.string().min(1, "Session ID is required"),
  rating: z.number().min(1, "Rating must be at least 1").max(5, "Rating cannot exceed 5"),
  review: z.string().optional()
});
