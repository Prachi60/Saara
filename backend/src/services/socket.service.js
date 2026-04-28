import { Server } from 'socket.io';
import { verifyAccessToken } from '../config/jwt.js';

let io;

const ALLOWED_ORIGINS = process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(',').map((o) => o.trim())
    : ['http://localhost:5173'];

// Rooms that require authentication to join
const PROTECTED_ROOM_PREFIXES = ['user_', 'vendor_', 'delivery_', 'order_', 'chat_', 'admin_'];

const isProtectedRoom = (room) =>
    PROTECTED_ROOM_PREFIXES.some((prefix) => String(room || '').startsWith(prefix));

export const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: ALLOWED_ORIGINS,
            methods: ['GET', 'POST'],
            credentials: true,
        },
    });

    // Authenticate socket connection via JWT in handshake
    io.use((socket, next) => {
        const token =
            socket.handshake.auth?.token ||
            socket.handshake.headers?.authorization?.replace('Bearer ', '');

        if (token) {
            try {
                socket.user = verifyAccessToken(token);
            } catch {
                // Non-fatal: public clients won't have a token.
                // Protected rooms will be blocked at join time.
                socket.user = null;
            }
        } else {
            socket.user = null;
        }

        next();
    });

    io.on('connection', (socket) => {
        socket.on('join', (room) => {
            const roomStr = String(room || '').trim();
            if (!roomStr) return;

            // Block unauthenticated clients from joining protected rooms
            if (isProtectedRoom(roomStr) && !socket.user) {
                socket.emit('error', { message: 'Authentication required to join this room.' });
                return;
            }

            // Enforce private room access: role_ID (e.g., user_123)
            const privatePrefixes = ['user_', 'vendor_', 'delivery_'];
            const matchedPrefix = privatePrefixes.find(p => roomStr.startsWith(p));
            
            if (matchedPrefix && socket.user) {
                const requestedId = roomStr.replace(matchedPrefix, '');
                const currentId = String(socket.user.id || '');
                const isAdmin = socket.user.role === 'admin' || socket.user.role === 'superadmin';
                
                if (!isAdmin && requestedId !== currentId) {
                    socket.emit('error', { message: 'Access denied to this private room.' });
                    return;
                }
            }

            socket.join(roomStr);
        });

        socket.on('disconnect', () => {
            // cleanup handled automatically by socket.io
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) throw new Error('Socket.io not initialized!');
    return io;
};

// Helper to emit events to a specific room
export const emitToRoom = (room, event, data) => {
    if (io) io.to(room).emit(event, data);
};
