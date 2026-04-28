import asyncHandler from '../../../utils/asyncHandler.js';
import ApiResponse from '../../../utils/ApiResponse.js';
import ApiError from '../../../utils/ApiError.js';
import VendorChatThread from '../../../models/VendorChatThread.model.js';
import VendorChatMessage from '../../../models/VendorChatMessage.model.js';
import Product from '../../../models/Product.model.js';
import { emitToRoom } from '../../../services/socket.service.js';

const serializeMessage = (messageDoc) => ({
    id: messageDoc._id,
    sender: messageDoc.senderType,
    message: messageDoc.message,
    time: messageDoc.createdAt,
});

export const getUserChatThreads = asyncHandler(async (req, res) => {
    const customerUserId = req.user.id;
    const threads = await VendorChatThread.find({ customerUserId })
        .populate('vendorId', 'storeName name logo')
        .sort({ lastActivity: -1 });
    res.status(200).json(new ApiResponse(200, threads, 'Chat threads fetched.'));
});

export const getUserChatMessages = asyncHandler(async (req, res) => {
    const thread = await VendorChatThread.findOne({
        _id: req.params.id,
        customerUserId: req.user.id,
    });
    if (!thread) throw new ApiError(404, 'Chat thread not found.');

    const messages = await VendorChatMessage.find({ threadId: thread._id }).sort({ createdAt: 1 });
    res.status(200).json(new ApiResponse(200, messages.map(serializeMessage), 'Chat messages fetched.'));
});

export const sendUserChatMessage = asyncHandler(async (req, res) => {
    const message = String(req.body?.message || '').trim();
    if (!message) throw new ApiError(400, 'Message is required.');

    const thread = await VendorChatThread.findOne({
        _id: req.params.id,
        customerUserId: req.user.id,
    });
    if (!thread) throw new ApiError(404, 'Chat thread not found.');

    const created = await VendorChatMessage.create({
        threadId: thread._id,
        senderType: 'customer',
        senderId: req.user.id,
        message,
    });

    thread.lastMessage = message;
    thread.lastActivity = created.createdAt;
    thread.unreadCount += 1;
    await thread.save();

    const serialized = serializeMessage(created);
    
    // Emit to socket room
    emitToRoom(`chat_${thread._id}`, 'new_message', serialized);
    // Also notify vendor specifically
    emitToRoom(`vendor_${thread.vendorId}`, 'new_notification', {
        type: 'new_chat_message',
        threadId: thread._id,
        message: message.substring(0, 50),
    });

    res.status(201).json(new ApiResponse(201, serialized, 'Message sent.'));
});

export const initiateChatWithVendor = asyncHandler(async (req, res) => {
    const { vendorId, productId } = req.body;
    if (!vendorId) throw new ApiError(400, 'Vendor ID is required.');

    // Check if thread already exists for this user and vendor (without order)
    let thread = await VendorChatThread.findOne({
        vendorId,
        customerUserId: req.user.id,
        orderRef: null
    });

    if (!thread) {
        let product = null;
        if (productId) {
            product = await Product.findById(productId);
        }

        thread = await VendorChatThread.create({
            vendorId,
            customerUserId: req.user.id,
            customerName: req.user.name || 'Customer',
            customerEmail: req.user.email || '',
            customerPhone: req.user.phone || '',
            lastMessage: product ? `Inquiry about: ${product.name}` : 'Started a new chat',
            status: 'active'
        });

        if (product) {
            await VendorChatMessage.create({
                threadId: thread._id,
                senderType: 'system',
                message: `User is inquiring about product: ${product.name}`
            });
        }
    }

    res.status(200).json(new ApiResponse(200, thread, 'Chat initiated.'));
});
