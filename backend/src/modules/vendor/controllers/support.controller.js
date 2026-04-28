import mongoose from 'mongoose';
import { asyncHandler } from '../../../utils/asyncHandler.js';
import { ApiResponse } from '../../../utils/ApiResponse.js';
import { ApiError } from '../../../utils/ApiError.js';
import SupportTicket from '../../../models/SupportTicket.model.js';
import TicketType from '../../../models/TicketType.model.js';
import { emitToRoom } from '../../../services/socket.service.js';

// GET /api/vendor/support/ticket-types
export const getTicketTypes = asyncHandler(async (req, res) => {
    const types = await TicketType.find({ isActive: true }).select('name description');
    res.status(200).json(new ApiResponse(200, types, 'Ticket types fetched.'));
});

// GET /api/vendor/support/tickets
export const getMyTickets = asyncHandler(async (req, res) => {
    const tickets = await SupportTicket.find({ vendorId: req.user.id })
        .populate('ticketTypeId', 'name')
        .sort({ updatedAt: -1 })
        .lean();
    res.status(200).json(new ApiResponse(200, tickets, 'Support tickets fetched.'));
});

// POST /api/vendor/support/tickets
export const createTicket = asyncHandler(async (req, res) => {
    const { subject, message, priority = 'medium', ticketTypeId } = req.body;

    if (!subject || !message) throw new ApiError(400, 'Subject and message are required.');

    const ticket = await SupportTicket.create({
        vendorId: req.user.id,
        ticketTypeId,
        subject,
        priority,
        messages: [{
            senderId: req.user.id,
            senderType: 'vendor',
            message
        }],
    });

    // Fetch vendor for store name
    const vendor = await mongoose.model('Vendor').findById(req.user.id);

    // Notify Admin
    emitToRoom('admin_room', 'new_notification', {
        type: 'new_support_ticket',
        ticketId: ticket._id,
        from: vendor?.storeName || 'Vendor',
        subject: ticket.subject
    });

    res.status(201).json(new ApiResponse(201, ticket, 'Support ticket created.'));
});

// POST /api/vendor/support/tickets/:id/message
export const replyToTicket = asyncHandler(async (req, res) => {
    const { message } = req.body;
    const ticket = await SupportTicket.findOne({ _id: req.params.id, vendorId: req.user.id });

    if (!ticket) throw new ApiError(404, 'Ticket not found.');
    if (ticket.status === 'closed') throw new ApiError(400, 'Cannot reply to a closed ticket.');

    const newMessage = {
        senderId: req.user.id,
        senderType: 'vendor',
        message
    };
    
    ticket.messages.push(newMessage);
    ticket.status = 'open'; // Re-open if it was resolved
    await ticket.save();

    // Fetch vendor for store name
    const vendor = await mongoose.model('Vendor').findById(req.user.id);

    // Notify Admin
    emitToRoom(`ticket_${ticket._id}`, 'new_support_message', newMessage);
    emitToRoom('admin_room', 'new_notification', {
        type: 'support_reply',
        ticketId: ticket._id,
        from: vendor?.storeName || 'Vendor'
    });

    res.status(200).json(new ApiResponse(200, ticket, 'Reply added.'));
});
