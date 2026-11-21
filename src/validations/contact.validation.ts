import { z } from 'zod';

export const contactInquirySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be under 100 characters'),

  email: z
    .string()
    .trim()
    .email('Please enter a valid email address')
    .max(255, 'Email must be under 255 characters'),

  phone: z.string().trim().max(50).optional(),

  message: z
    .string()
    .trim()
    .min(10, 'Message must be at least 10 characters long')
    .max(3000, 'Message must be under 3000 characters'),

  budget: z.string().trim().max(100).optional(),
  timeline: z.string().trim().max(100).optional(),
  service: z.string().trim().max(100).optional(),
});

export type ContactInquiryInput = z.infer<typeof contactInquirySchema>;
