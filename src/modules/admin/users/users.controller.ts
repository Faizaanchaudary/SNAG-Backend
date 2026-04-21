import { Request, Response } from 'express';
import { sendSuccess } from '@core/http/response.js';
import * as usersService from './users.service.js';
import { validateBody } from '@middleware/validation.js';
import { createUserSchema, updateUserSchema } from './users.validation.js';

/**
 * List all users with pagination and search
 * GET /admin/users?q=search&page=1&limit=10
 */
export const listUsers = async (req: Request, res: Response): Promise<void> => {
  const { q = '', page = 1, limit = 10, role } = req.query;
  const result = await usersService.listUsers({
    q: q as string,
    page: Number(page),
    limit: Number(limit),
    role: role as string | undefined,
  });
  sendSuccess(res, result, 'Users retrieved successfully');
};

/**
 * Get user by ID
 * GET /admin/users/:id
 */
export const getUserById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const user = await usersService.getUserById(id as string);
  sendSuccess(res, user, 'User retrieved successfully');
};

/**
 * Create new user
 * POST /admin/users
 */
export const createUser = [
  validateBody(createUserSchema),
  async (req: Request, res: Response): Promise<void> => {
    const user = await usersService.createUser(req.body);
    sendSuccess(res, user, 'User created successfully', 201);
  },
];

/**
 * Update user
 * PUT /admin/users/:id
 */
export const updateUser = [
  validateBody(updateUserSchema),
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const user = await usersService.updateUser(id as string, req.body);
    sendSuccess(res, user, 'User updated successfully');
  },
];

/**
 * Delete user (soft delete)
 * DELETE /admin/users/:id
 */
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  await usersService.deleteUser(id as string);
  sendSuccess(res, { ok: true }, 'User deleted successfully');
};

/**
 * Suspend user
 * PATCH /admin/users/:id/suspend
 */
export const suspendUser = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const user = await usersService.suspendUser(id as string);
  sendSuccess(res, user, 'User suspended successfully');
};

/**
 * Activate user
 * PATCH /admin/users/:id/activate
 */
export const activateUser = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const user = await usersService.activateUser(id as string);
  sendSuccess(res, user, 'User activated successfully');
};