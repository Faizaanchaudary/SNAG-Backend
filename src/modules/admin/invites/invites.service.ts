import { NotFoundError, ConflictError } from '@core/errors/app-error.js';
import * as invitesRepository from './invites.repository.js';
import { CreateInviteDto, UpdateInviteDto } from './invites.validation.js';

/**
 * List invites with pagination and search
 */
export const listInvites = async (params: {
  q: string;
  status?: string;
  page: number;
  limit: number;
}) => {
  const { invites, total } = await invitesRepository.findInvitesWithPagination(params);
  
  // Map invites to admin-friendly format
  const items = invites.map((invite) => {
    const invitedBy = invite.invitedBy as any; // Type assertion for populated field
    return {
      id: invite._id.toString(),
      email: invite.email,
      role: invite.role,
      status: invite.status,
      invitedBy: invitedBy?.firstName && invitedBy?.lastName 
        ? `${invitedBy.firstName} ${invitedBy.lastName}` 
        : 'Unknown',
      message: invite.message,
      expiresAt: invite.expiresAt.toISOString(),
      acceptedAt: invite.acceptedAt?.toISOString(),
      createdAt: invite.createdAt.toISOString(),
    };
  });

  return { items, total };
};

/**
 * Get invite by ID
 */
export const getInviteById = async (id: string) => {
  const invite = await invitesRepository.findInviteById(id);
  if (!invite) {
    throw new NotFoundError('Invite not found');
  }

  const invitedBy = invite.invitedBy as any; // Type assertion for populated field
  return {
    id: invite._id.toString(),
    email: invite.email,
    role: invite.role,
    status: invite.status,
    invitedBy: invitedBy?.firstName && invitedBy?.lastName 
      ? `${invitedBy.firstName} ${invitedBy.lastName}` 
      : 'Unknown',
    invitedByEmail: invitedBy?.email,
    message: invite.message,
    token: invite.token,
    expiresAt: invite.expiresAt.toISOString(),
    acceptedAt: invite.acceptedAt?.toISOString(),
    createdAt: invite.createdAt.toISOString(),
    updatedAt: invite.updatedAt.toISOString(),
  };
};

/**
 * Create new invite
 */
export const createInvite = async (dto: CreateInviteDto, invitedById: string) => {
  // Check if there's already a pending invite for this email
  const existingInvites = await invitesRepository.findInvitesWithPagination({
    q: dto.email,
    status: 'pending',
    page: 1,
    limit: 1,
  });

  if (existingInvites.total > 0) {
    throw new ConflictError('Pending invite already exists for this email');
  }

  const invite = await invitesRepository.createInvite({
    ...dto,
    invitedBy: invitedById,
  });

  // TODO: Send invitation email with token

  const invitedBy = invite.invitedBy as any; // Type assertion for populated field
  return {
    id: invite._id.toString(),
    email: invite.email,
    role: invite.role,
    status: invite.status,
    invitedBy: invitedBy?.firstName && invitedBy?.lastName 
      ? `${invitedBy.firstName} ${invitedBy.lastName}` 
      : 'Unknown',
    message: invite.message,
    expiresAt: invite.expiresAt.toISOString(),
    createdAt: invite.createdAt.toISOString(),
  };
};

/**
 * Update invite
 */
export const updateInvite = async (id: string, dto: UpdateInviteDto) => {
  const invite = await invitesRepository.findInviteById(id);
  if (!invite) {
    throw new NotFoundError('Invite not found');
  }

  const updatedInvite = await invitesRepository.updateInvite(id, dto);
  if (!updatedInvite) {
    throw new NotFoundError('Invite not found after update');
  }

  const invitedBy = updatedInvite.invitedBy as any; // Type assertion for populated field
  return {
    id: updatedInvite._id.toString(),
    email: updatedInvite.email,
    role: updatedInvite.role,
    status: updatedInvite.status,
    invitedBy: invitedBy?.firstName && invitedBy?.lastName 
      ? `${invitedBy.firstName} ${invitedBy.lastName}` 
      : 'Unknown',
    message: updatedInvite.message,
    expiresAt: updatedInvite.expiresAt.toISOString(),
    acceptedAt: updatedInvite.acceptedAt?.toISOString(),
    createdAt: updatedInvite.createdAt.toISOString(),
  };
};

/**
 * Cancel invite
 */
export const cancelInvite = async (id: string) => {
  return await updateInvite(id, { status: 'cancelled' });
};

/**
 * Delete invite
 */
export const deleteInvite = async (id: string) => {
  const invite = await invitesRepository.findInviteById(id);
  if (!invite) {
    throw new NotFoundError('Invite not found');
  }

  await invitesRepository.deleteInvite(id);
};