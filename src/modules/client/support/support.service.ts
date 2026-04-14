import * as supportRepository from './support.repository.js';
import type { SubmitSupportDto } from './support.validation.js';

export const submitSupportTicket = async (clientId: string, dto: SubmitSupportDto) => {
  const ticket = await supportRepository.createTicket(clientId, dto);
  return {
    ticketId:  ticket.id,
    subject:   ticket.subject,
    createdAt: ticket.createdAt,
  };
};
