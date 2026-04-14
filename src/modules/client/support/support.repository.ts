import { SupportTicket, SupportTicketDocument } from '@models/support-ticket.model.js';

export const createTicket = (
  clientId: string,
  data: {
    email: string;
    phoneNumber: string;
    subject: string;
    message: string;
    attachmentUrl?: string;
  },
): Promise<SupportTicketDocument> =>
  new SupportTicket({ client: clientId, ...data }).save();
