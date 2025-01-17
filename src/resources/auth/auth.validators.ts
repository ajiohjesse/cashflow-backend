import { z } from 'zod';

export const selectUserSchema = z.object({
  id: z
    .string()
    .uuid()
    .openapi({ example: '123e4567-e89b-12d3-a456-426614174000' }),
  fullName: z
    .string()
    .trim()
    .min(2)
    .openapi({ example: 'Jay Maxwell', minLength: 2 }),
  email: z.string().email().openapi({ example: 'sample@email.com' }),
  isEmailVerified: z.boolean().openapi({ example: true }),
});

export type SelectUserDTO = z.infer<typeof selectUserSchema>;

export const insertUserSchema = z.object({
  fullName: selectUserSchema.shape.fullName,
  email: selectUserSchema.shape.email,
  password: z
    .string()
    .min(4, 'Password must be a least 4 characters')
    .openapi({ example: 'SomePassword', minLength: 4 }),
});

export type InsertUserDTO = z.infer<typeof insertUserSchema>;

export const loginUserSchema = z.object({
  email: selectUserSchema.shape.email,
  password: insertUserSchema.shape.password,
});

export type LoginUserDTO = z.infer<typeof loginUserSchema>;

export const refreshUserSchema = z.object({
  userId: selectUserSchema.shape.id,
  accessToken: z.string(),
});

export type RefreshUserDTO = z.infer<typeof refreshUserSchema>;

export const OauthQuerySchema = z.object({
  code: z.string(),
  state: z.string(),
});
