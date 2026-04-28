import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000';

let socket = null;

export const getSocket = (token) => {
    if (!socket && token) {
        socket = io(SOCKET_URL, {
            auth: { token },
            transports: ['websocket', 'polling'],
            withCredentials: true
        });

        socket.on('connect', () => {
            console.log('🔌 Connected to socket server');
        });

        socket.on('disconnect', () => {
            console.log('🔌 Disconnected from socket server');
        });

        socket.on('error', (err) => {
            console.error('🔌 Socket error:', err);
        });
    }
    return socket;
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};

export const joinRoom = (room) => {
    if (socket) {
        socket.emit('join', room);
    }
};

export const leaveRoom = (room) => {
    if (socket) {
        // socket.io doesn't have a default leave event we can emit manually unless we implement it on backend
        // but we can just disconnect or rely on room management.
        // Our backend doesn't have a 'leave' listener, it just cleans up on disconnect.
        // Actually, we should probably add a leave listener on backend if we want to be clean.
    }
};
