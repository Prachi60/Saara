import api from '../../../shared/utils/api';

export const getUserChatThreads = async () => {
    const res = await api.get('/user/chat/threads');
    return res.data || res;
};

export const getUserChatMessages = async (threadId) => {
    const res = await api.get(`/user/chat/threads/${threadId}/messages`);
    return res.data || res;
};

export const sendUserChatMessage = async (threadId, message) => {
    const res = await api.post(`/user/chat/threads/${threadId}/messages`, { message });
    return res.data || res;
};

export const initiateChat = async (vendorId, productId) => {
    const res = await api.post('/user/chat/initiate', { vendorId, productId });
    return res.data || res;
};
