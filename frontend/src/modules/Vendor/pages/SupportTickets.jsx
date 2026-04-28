import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FiMessageSquare,
  FiSearch,
  FiPlus,
  FiEye,
  FiArrowLeft,
  FiCalendar,
  FiTag,
  FiSend
} from "react-icons/fi";
import { motion } from "framer-motion";
import DataTable from "../../Admin/components/DataTable";
import Badge from "../../../shared/components/Badge";
import AnimatedSelect from "../../Admin/components/AnimatedSelect";
import { useVendorAuthStore } from "../store/vendorAuthStore";
import toast from "react-hot-toast";
import { 
    getVendorSupportTickets, 
    getVendorSupportTicketTypes,
    createVendorSupportTicket, 
    replyToVendorSupportTicket 
} from "../services/vendorService";
import { getSocket, joinRoom } from "../../../shared/utils/socket";

const SupportTickets = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { vendor } = useVendorAuthStore();
  const [tickets, setTickets] = useState([]);
  const [ticketTypes, setTicketTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchTickets();
    fetchTicketTypes();
  }, []);

  const fetchTicketTypes = async () => {
    try {
      const res = await getVendorSupportTicketTypes();
      setTicketTypes(res.data || []);
    } catch (err) {
      console.error("Failed to load ticket types", err);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('vendor-token') || localStorage.getItem('token');
    if (!token) return;
    
    const socket = getSocket(token);
    if (!socket) return;

    const handleNotification = (payload) => {
        if (payload.type === 'support_ticket_update' || payload.type === 'new_support_message') {
            fetchTickets();
        }
    };

    socket.on('new_notification', handleNotification);
    
    return () => {
        socket.off('new_notification', handleNotification);
    };
  }, []);

  const fetchTickets = async () => {
    setIsLoading(true);
    try {
        const res = await getVendorSupportTickets();
        setTickets(res.data || []);
    } catch (err) {
        toast.error("Failed to load tickets");
    } finally {
        setIsLoading(false);
    }
  };

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      !searchQuery ||
      ticket._id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.subject?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || ticket.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSave = async (ticketData) => {
    try {
        await createVendorSupportTicket({
            subject: ticketData.subject,
            message: ticketData.description,
            priority: ticketData.priority,
            ticketTypeId: ticketData.ticketTypeId
        });
        setShowForm(false);
        toast.success("Ticket created successfully");
        fetchTickets();
    } catch (err) {
        toast.error(err.message || "Failed to create ticket");
    }
  };

  const getStatusVariant = (status) => {
    const statusMap = {
      open: "error",
      in_progress: "warning",
      resolved: "success",
      closed: "default",
    };
    return statusMap[status] || "default";
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: "bg-red-100 text-red-800",
      medium: "bg-yellow-100 text-yellow-800",
      low: "bg-blue-100 text-blue-800",
    };
    return colors[priority] || "bg-gray-100 text-gray-800";
  };

  const columns = [
    {
      key: "_id",
      label: "Ticket ID",
      sortable: true,
      render: (value) => (
        <span className="font-semibold text-gray-800">
          #{value ? value.substring(value.length - 6) : 'N/A'}
        </span>
      ),
    },
    {
      key: "subject",
      label: "Subject",
      sortable: true,
    },
    {
      key: "priority",
      label: "Priority",
      sortable: true,
      render: (value) => (
        <span
          className={`px-2 py-1 rounded text-xs font-medium uppercase ${getPriorityColor(
            value
          )}`}>
          {value}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (value) => (
        <Badge variant={getStatusVariant(value)}>{value.replace('_', ' ')}</Badge>
      ),
    },
    {
      key: "createdAt",
      label: "Created",
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString(),
    },
    {
      key: "actions",
      label: "Actions",
      render: (_, row) => (
        <button
          onClick={() => navigate(`/vendor/support-tickets/${row._id}`)}
          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
          <FiEye />
        </button>
      ),
    },
  ];

  if (id) {
    const ticket = tickets.find(t => t._id === id);
    if (ticket) {
        return (
            <TicketDetail
              ticket={ticket}
              navigate={navigate}
              getStatusVariant={getStatusVariant}
              getPriorityColor={getPriorityColor}
              onReply={fetchTickets}
            />
        );
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2 flex items-center gap-2">
            <FiMessageSquare className="text-primary-600" />
            Support Tickets
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Create and manage support tickets with platform admin
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold">
          <FiPlus />
          <span>Create Ticket</span>
        </button>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 sm:gap-4">
          <div className="relative flex-1 w-full sm:min-w-[200px]">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tickets..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm sm:text-base"
            />
          </div>

          <AnimatedSelect
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: "all", label: "All Status" },
              { value: "open", label: "Open" },
              { value: "in_progress", label: "In Progress" },
              { value: "resolved", label: "Resolved" },
              { value: "closed", label: "Closed" },
            ]}
            className="w-full sm:w-auto min-w-[140px]"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">Loading tickets...</div>
      ) : filteredTickets.length > 0 ? (
        <DataTable
          data={filteredTickets}
          columns={columns}
          pagination={true}
          itemsPerPage={10}
        />
      ) : (
        <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-200 text-center">
          <p className="text-gray-500">No tickets found</p>
        </div>
      )}

      {showForm && (
        <TicketForm 
          onSave={handleSave} 
          onClose={() => setShowForm(false)} 
          ticketTypes={ticketTypes}
        />
      )}
    </motion.div>
  );
};

const TicketDetail = ({
  ticket,
  navigate,
  getStatusVariant,
  getPriorityColor,
  onReply
}) => {
  const [reply, setReply] = useState("");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    joinRoom(`ticket_${ticket._id}`);
  }, [ticket._id]);

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!reply.trim()) return;

    setIsSending(true);
    try {
        await replyToVendorSupportTicket(ticket._id, reply);
        setReply("");
        toast.success("Reply sent");
        onReply();
    } catch (err) {
        toast.error("Failed to send reply");
    } finally {
        setIsSending(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate("/vendor/support-tickets")}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <FiArrowLeft className="text-xl" />
        </button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            Ticket Details
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            #{ticket._id}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
              {/* Messages Area */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[600px]">
                  <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                      <h2 className="font-bold text-gray-800">{ticket.subject}</h2>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {ticket.messages?.map((msg, idx) => (
                          <div key={idx} className={`flex ${msg.senderType === 'vendor' ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-[80%] rounded-2xl px-4 py-2 shadow-sm ${
                                  msg.senderType === 'vendor' 
                                  ? 'bg-primary-600 text-white rounded-tr-none' 
                                  : 'bg-gray-100 text-gray-800 rounded-tl-none'
                              }`}>
                                  <p className="text-sm">{msg.message}</p>
                                  <p className={`text-[10px] mt-1 ${msg.senderType === 'vendor' ? 'text-primary-100' : 'text-gray-400'}`}>
                                      {new Date(msg.createdAt).toLocaleTimeString()}
                                  </p>
                              </div>
                          </div>
                      ))}
                  </div>

                  <form onSubmit={handleSendReply} className="p-4 border-t border-gray-100 bg-white">
                      <div className="flex gap-2">
                          <input 
                            value={reply}
                            onChange={(e) => setReply(e.target.value)}
                            placeholder="Type your message..."
                            disabled={ticket.status === 'closed'}
                            className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
                          />
                          <button 
                            type="submit"
                            disabled={isSending || ticket.status === 'closed' || !reply.trim()}
                            className="p-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50"
                          >
                              <FiSend />
                          </button>
                      </div>
                      {ticket.status === 'closed' && (
                          <p className="text-xs text-red-500 mt-2 text-center">This ticket is closed and cannot be replied to.</p>
                      )}
                  </form>
              </div>
          </div>

          <div className="space-y-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <h3 className="font-bold text-gray-800 mb-4 pb-2 border-b border-gray-50">Ticket Info</h3>
                  <div className="space-y-4">
                      <div>
                          <label className="text-xs font-bold text-gray-400 uppercase">Status</label>
                          <div className="mt-1">
                            <Badge variant={getStatusVariant(ticket.status)}>{ticket.status}</Badge>
                          </div>
                      </div>
                      <div>
                          <label className="text-xs font-bold text-gray-400 uppercase">Priority</label>
                          <div className={`mt-1 inline-block px-2 py-1 rounded text-xs font-bold uppercase ${getPriorityColor(ticket.priority)}`}>
                              {ticket.priority}
                          </div>
                      </div>
                      <div>
                          <label className="text-xs font-bold text-gray-400 uppercase">Created At</label>
                          <p className="text-sm text-gray-700 mt-1">{new Date(ticket.createdAt).toLocaleString()}</p>
                      </div>
                  </div>
              </div>
          </div>
      </div>
    </motion.div>
  );
};

const TicketForm = ({ onSave, onClose, ticketTypes = [] }) => {
  const [formData, setFormData] = useState({
    subject: "",
    ticketTypeId: ticketTypes[0]?._id || "",
    priority: "medium",
    description: "",
  });

  useEffect(() => {
    if (ticketTypes.length > 0 && !formData.ticketTypeId) {
      setFormData(prev => ({ ...prev, ticketTypeId: ticketTypes[0]._id }));
    }
  }, [ticketTypes]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[10000] flex items-center justify-center p-4 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
      >
        <h3 className="text-xl font-bold mb-6 text-gray-800">Create Support Ticket</h3>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Subject *
            </label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) =>
                setFormData({ ...formData, subject: e.target.value })
              }
              placeholder="Brief summary of your issue"
              required
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Type</label>
              <select
                value={formData.ticketTypeId}
                onChange={(e) =>
                  setFormData({ ...formData, ticketTypeId: e.target.value })
                }
                required
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none">
                <option value="">Select Category</option>
                {ticketTypes.map(type => (
                  <option key={type._id} value={type._id}>{type.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) =>
                  setFormData({ ...formData, priority: e.target.value })
                }
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none uppercase">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Please provide as much detail as possible..."
              required
              rows="6"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none resize-none"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-colors shadow-lg shadow-primary-200">
              Create Ticket
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default SupportTickets;
