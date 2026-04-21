import { Invite, InviteDocument } from '@models/invite.model.js';
import { CreateInviteDto, UpdateInviteDto } from './invites.validation.js';
import crypto from 'crypto';

/**
 * Find invites with pagination and search
 */
export const findInvitesWithPagination = async (params: {
  q: string;
  status?: string;
  page: number;
  limit: number;
}) => {
  const { q, status, page, limit } = params;
  const skip = (page - 1) * limit;

  // Build search query
  const searchQuery: any = {};
  if (q) {
    searchQuery.email = { $regex: q, $options: 'i' };
  }
  if (status) {
    searchQuery.status = status;
  }

  const [invites, total] = await Promise.all([
    Invite.find(searchQuery)
      .populate('invitedBy', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec(),
    Invite.countDocuments(searchQuery),
  ]);

  return { invites, total };
};

/**
 * Find invite by ID
 */
export const findInviteById = (id: string): Promise<InviteDocument | null> => {
  return Invite.findById(id).populate('invitedBy', 'firstName lastName email').exec();
};

/**
 * Find invite by token
 */
export const findInviteByToken = (token: string): Promise<InviteDocument | null> => {
  return Invite.findOne({ token }).populate('invitedBy', 'firstName lastName email').exec();
};

/**
 * Create new invite
 */
export const createInvite = async (data: CreateInviteDto & { invitedBy: string }): Promise<InviteDocument> => {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  const inviteData = {
    ...data,
    token,
    expiresAt,
    status: 'pending' as const,
  };

  return new Invite(inviteData).save();
};

/**
 * Update invite
 */
export const updateInvite = (id: string, data: UpdateInviteDto): Promise<InviteDocument | null> => {
  return Invite.findByIdAndUpdate(id, data, { new: true })
    .populate('invitedBy', 'firstName lastName email')
    .exec();
};

/**
 * Delete invite
 */
export const deleteInvite = (id: string): Promise<InviteDocument | null> => {
  return Invite.findByIdAndDelete(id).exec();
};

/**
 * Get invite statistics
 */
export const getInviteStats = async () => {
  const [totalInvites, pendingInvites, acceptedInvites, expiredInvites] = await Promise.all([
    Invite.countDocuments(),
    Invite.countDocuments({ status: 'pending' }),
    Invite.countDocuments({ status: 'accepted' }),
    Invite.countDocuments({ status: 'expired' }),
  ]);

  return {
    totalInvites,
    pendingInvites,
    acceptedInvites,
    expiredInvites,
  };
};