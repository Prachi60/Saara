import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiPlus, FiMessageCircle, FiChevronRight, FiClock, FiCheckCircle, FiAlertCircle, FiSend, FiArrowLeft, FiTag } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import MobileLayout from '../components/Layout/MobileLayout';
import PageTransition from '../../../shared/components/PageTransition';
import * as supportService from '../services/supportService';
import toast from 'react-hot-toast';

const Support = () => {
    const navigate = useNavigate();
    const [tickets, setTickets] = useState([]);
    const [ticketTypes, setTicketTypes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [replyMessage, setReplyMessage] = useState('');
    const [isSending, setIsSending] = useState(false);

    // New Ticket Form State
    const [newTicket, setNewTicket] = useState({
        subject: '',
        ticketTypeId: '',
        message: '',
        priority: 'low'
    });

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        setIsLoading(true);
        try {
            const [ticketsRes, typesRes] = await Promise.all([
                supportService.getUserTickets(),
                supportService.getTicketTypes()
            ]);
            setTickets(ticketsRes.data.tickets);
            setTicketTypes(typesRes.data);
        } catch (error) {
            toast.error('Failed to load support data');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateTicket = async (e) => {
        e.preventDefault();
        if (!newTicket.subject || !newTicket.message || !newTicket.ticketTypeId) {
            toast.error('Please fill all required fields');
            return;
        }

        setIsSending(true);
        try {
            await supportService.createTicket(newTicket);
            toast.success('Ticket created successfully');
            setNewTicket({ subject: '', ticketTypeId: '', message: '', priority: 'low' });
            setIsCreating(false);
            fetchInitialData();
        } catch (error) {
            toast.error(error.message || 'Failed to create ticket');
        } finally {
            setIsSending(false);
        }
    };

    const handleSendReply = async (e) => {
        e.preventDefault();
        if (!replyMessage.trim()) return;

        setIsSending(true);
        try {
            const res = await supportService.addTicketMessage(selectedTicket._id, replyMessage);
            setSelectedTicket(prev => ({
                ...prev,
                messages: [...prev.messages, res.data]
            }));
            setReplyMessage('');
            // Also update in list
            setTickets(prev => prev.map(t => t._id === selectedTicket._id ? { ...t, updatedAt: new Date() } : t));
        } catch (error) {
            toast.error('Failed to send message');
        } finally {
            setIsSending(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'open': return 'bg-blue-100 text-blue-700';
            case 'in_progress': return 'bg-orange-100 text-orange-700';
            case 'resolved': return 'bg-green-100 text-green-700';
            case 'closed': return 'bg-gray-100 text-gray-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return 'text-red-600';
            case 'medium': return 'text-orange-600';
            case 'low': return 'text-green-600';
            default: return 'text-gray-600';
        }
    };

    return (
        <PageTransition>
            <MobileLayout showBottomNav={true}>
                <div className="min-h-screen bg-gray-50 pb-20">
                    {/* Header */}
                    <div className="bg-white border-b border-gray-200 sticky top-0 z-30 px-4 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <button onClick={() => selectedTicket ? setSelectedTicket(null) : isCreating ? setIsCreating(false) : navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full">
                                <FiArrowLeft className="text-xl" />
                            </button>
                            <h1 className="text-xl font-bold text-gray-800">
                                {selectedTicket ? 'Ticket Details' : isCreating ? 'New Ticket' : 'Support Tickets'}
                            </h1>
                        </div>
                        {!selectedTicket && !isCreating && (
                            <button 
                                onClick={() => setIsCreating(true)}
                                className="bg-primary-600 text-white p-2 rounded-full shadow-lg"
                            >
                                <FiPlus className="text-xl" />
                            </button>
                        )}
                    </div>

                    <div className="max-w-3xl mx-auto p-4">
                        {isLoading ? (
                            <div className="flex justify-center py-20">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                            </div>
                        ) : selectedTicket ? (
                            /* Ticket Details & Chat */
                            <div className="space-y-6">
                                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h2 className="text-lg font-bold text-gray-900">{selectedTicket.subject}</h2>
                                            <p className="text-sm text-gray-500">#{selectedTicket._id.slice(-8)} • {selectedTicket.ticketTypeId?.name}</p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedTicket.status)}`}>
                                            {selectedTicket.status.replace('_', ' ').toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm">
                                        <div className="flex items-center gap-1">
                                            <FiClock className="text-gray-400" />
                                            <span>{new Date(selectedTicket.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <FiTag className={getPriorityColor(selectedTicket.priority)} />
                                            <span className="capitalize">{selectedTicket.priority} Priority</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {selectedTicket.messages.map((msg, idx) => (
                                        <div key={idx} className={`flex ${msg.senderType === 'user' ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[85%] p-4 rounded-2xl ${
                                                msg.senderType === 'user' 
                                                ? 'bg-primary-600 text-white rounded-tr-none' 
                                                : 'bg-white text-gray-800 border border-gray-200 rounded-tl-none shadow-sm'
                                            }`}>
                                                <p className="text-sm">{msg.message}</p>
                                                <p className={`text-[10px] mt-1 ${msg.senderType === 'user' ? 'text-primary-100' : 'text-gray-400'}`}>
                                                    {new Date(msg.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {selectedTicket.status !== 'closed' && (
                                    <form onSubmit={handleSendReply} className="fixed bottom-20 left-0 right-0 p-4 bg-white border-t border-gray-200 lg:relative lg:bottom-0 lg:rounded-2xl lg:shadow-md">
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={replyMessage}
                                                onChange={(e) => setReplyMessage(e.target.value)}
                                                placeholder="Type your message..."
                                                className="flex-1 px-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            />
                                            <button 
                                                disabled={isSending}
                                                className="bg-primary-600 text-white p-3 rounded-full hover:bg-primary-700 transition-colors disabled:opacity-50"
                                            >
                                                <FiSend />
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        ) : isCreating ? (
                            /* Create Ticket Form */
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                <form onSubmit={handleCreateTicket} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                                        <input
                                            type="text"
                                            value={newTicket.subject}
                                            onChange={(e) => setNewTicket({...newTicket, subject: e.target.value})}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                                            placeholder="What is the issue?"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                        <select
                                            value={newTicket.ticketTypeId}
                                            onChange={(e) => setNewTicket({...newTicket, ticketTypeId: e.target.value})}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                                        >
                                            <option value="">Select Category</option>
                                            {ticketTypes.map(type => (
                                                <option key={type._id} value={type._id}>{type.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                                        <div className="flex gap-4">
                                            {['low', 'medium', 'high'].map(p => (
                                                <label key={p} className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name="priority"
                                                        value={p}
                                                        checked={newTicket.priority === p}
                                                        onChange={(e) => setNewTicket({...newTicket, priority: e.target.value})}
                                                        className="text-primary-600 focus:ring-primary-500"
                                                    />
                                                    <span className="capitalize text-sm">{p}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                                        <textarea
                                            value={newTicket.message}
                                            onChange={(e) => setNewTicket({...newTicket, message: e.target.value})}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none h-32 resize-none"
                                            placeholder="Describe your problem in detail..."
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isSending}
                                        className="w-full bg-primary-600 text-white py-3 rounded-xl font-bold hover:bg-primary-700 transition-colors disabled:opacity-50"
                                    >
                                        {isSending ? 'Creating...' : 'Create Ticket'}
                                    </button>
                                </form>
                            </motion.div>
                        ) : (
                            /* Ticket List */
                            <div className="space-y-3">
                                {tickets.length === 0 ? (
                                    <div className="text-center py-20">
                                        <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <FiMessageCircle className="text-3xl text-gray-400" />
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-900">No tickets yet</h3>
                                        <p className="text-gray-500">Need help? Create a support ticket.</p>
                                    </div>
                                ) : (
                                    tickets.map(ticket => (
                                        <motion.div
                                            key={ticket._id}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => setSelectedTicket(ticket)}
                                            className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between cursor-pointer"
                                        >
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${getStatusColor(ticket.status)}`}>
                                                        {ticket.status}
                                                    </span>
                                                    <span className="text-xs text-gray-400">#{ticket._id.slice(-6)}</span>
                                                </div>
                                                <h3 className="font-bold text-gray-800 line-clamp-1">{ticket.subject}</h3>
                                                <p className="text-sm text-gray-500">{ticket.ticketTypeId?.name}</p>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <span className="text-[10px] text-gray-400">{new Date(ticket.updatedAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit' })}</span>
                                                <FiChevronRight className="text-gray-400" />
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </MobileLayout>
        </PageTransition>
    );
};

export default Support;
