import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
    ChevronLeft, Phone, Video, Info, Camera, Mic, 
    Image, Smile, Plus, Play, MoreVertical 
} from 'lucide-react';

const CreatorChat = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [message, setMessage] = useState('');
    const scrollRef = useRef(null);

    const messages = [
        { id: 1, text: "Hey! I saw your recent reel about the new collection. It looks amazing! 😍", sender: 'other', time: 'Wed, 10:08' },
        { id: 2, text: "Thanks so much! I'm really glad you liked it. The quality is actually incredible in person.", sender: 'me', time: 'Wed, 10:15' },
        { id: 3, text: "I'm thinking of buying that denim jacket. Is it true to size?", sender: 'other', time: 'Wed, 14:41' },
        { id: 4, text: "Yes, it fits perfectly. I'm wearing a Medium in the video for a slightly oversized look.", sender: 'me', time: 'Wed, 14:45' },
        { 
            id: 5, 
            type: 'reel', 
            sender: 'me', 
            time: 'Wed, 22:28',
            reelData: {
                creator: id || 'style_curator',
                caption: 'Styling the new Denim Collection - Check the fit and fabric details! ✨',
                thumbnail: 'https://picsum.photos/seed/style1/300/400'
            },
            reaction: '🙌'
        },
        { id: 6, text: "You visited your blend.", type: 'system', time: 'Today 09:59' }
    ];

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, []);

    return (
        <div className="flex flex-col h-screen bg-[#0a0514] text-white font-sans overflow-hidden relative">
            {/* Background Image Overlay */}
            <div 
                className="absolute inset-0 opacity-15 pointer-events-none"
                style={{
                    backgroundImage: 'url("https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                }}
            />

            {/* Header */}
            <header className="z-10 flex items-center justify-between px-2 py-3 bg-[#0a0514]/80 backdrop-blur-md border-b border-white/5">
                <div className="flex items-center gap-1.5">
                    <button onClick={() => navigate(-1)} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                        <ChevronLeft size={22} />
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="h-9 w-9 rounded-full overflow-hidden border border-purple-500/30">
                            <img 
                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${id || 'user'}`} 
                                alt="avatar" 
                                className="h-full w-full object-cover" 
                            />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-bold text-[13px] uppercase tracking-wide leading-tight">
                                {id?.replace('_', ' ') || 'CREATOR NAME'}
                            </span>
                            <span className="text-xs text-white/50 lowercase">
                                {id || 'username'}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-5 pr-2">
                    <button className="hover:opacity-70 transition-opacity">
                        <Info size={24} />
                    </button>
                </div>
            </header>

            {/* Messages Area */}
            <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-6 z-10 no-scrollbar"
            >
                {messages.map((msg, idx) => (
                    <div key={msg.id} className="flex flex-col">
                        {/* Time Separator */}
                        {(idx === 0 || messages[idx-1].time !== msg.time) && (
                            <div className="text-[10px] text-center text-white/40 mb-4 font-medium uppercase tracking-widest">
                                {msg.time}
                            </div>
                        )}

                        {msg.type === 'system' ? (
                            <div className="text-[10px] text-center text-white/30 italic my-2">
                                {msg.text}
                            </div>
                        ) : (
                            <div className={`flex items-end gap-2 ${msg.sender === 'me' ? 'flex-row-reverse' : 'flex-row'}`}>
                                {msg.sender === 'other' && (
                                    <div className="h-7 w-7 rounded-full overflow-hidden flex-shrink-0 mb-1">
                                        <img 
                                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${id || 'user'}`} 
                                            alt="avatar" 
                                            className="h-full w-full object-cover" 
                                        />
                                    </div>
                                )}
                                
                                <div className="flex flex-col gap-1 max-w-[80%] relative">
                                    {msg.type === 'reel' ? (
                                        <div className="bg-[#1a1229] rounded-2xl overflow-hidden border border-white/10 shadow-lg group relative cursor-pointer">
                                            <div className="p-2.5 flex items-center gap-2 border-b border-white/5">
                                                <div className="h-5 w-5 rounded-full overflow-hidden">
                                                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.reelData.creator}`} alt="" />
                                                </div>
                                                <span className="text-[11px] font-bold text-white/90">{msg.reelData.creator}</span>
                                            </div>
                                            <div className="relative aspect-[3/4]">
                                                <img src={msg.reelData.thumbnail} className="h-full w-full object-cover opacity-60" alt="" />
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <Play size={40} className="fill-white text-white drop-shadow-lg" />
                                                </div>
                                                <div className="absolute bottom-3 left-3 right-3 text-[10px] font-medium leading-tight">
                                                    {msg.reelData.caption}
                                                </div>
                                                <div className="absolute right-3 bottom-10 flex flex-col gap-4">
                                                    <div className="bg-white/10 backdrop-blur-md p-2 rounded-full border border-white/20">
                                                        <Plus size={14} className="rotate-45" />
                                                    </div>
                                                    <div className="bg-white/10 backdrop-blur-md p-2 rounded-full border border-white/20">
                                                        <Smile size={14} />
                                                    </div>
                                                </div>
                                                <div className="absolute left-3 bottom-3 bg-white/20 backdrop-blur-md p-1.5 rounded-full border border-white/20">
                                                    <Play size={12} className="fill-white text-white" />
                                                </div>
                                            </div>
                                            {msg.reaction && (
                                                <div className="absolute -bottom-2 -right-1 bg-[#1a1229] border border-white/10 rounded-full w-8 h-8 flex items-center justify-center text-lg shadow-xl scale-90">
                                                    {msg.reaction}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className={`px-4 py-2.5 rounded-[22px] text-[15px] shadow-sm ${
                                            msg.sender === 'me' 
                                            ? 'bg-purple-600 text-white rounded-br-md' 
                                            : 'bg-[#1a1229] text-white rounded-bl-md border border-white/10'
                                        }`}>
                                            {msg.text}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Footer Input */}
            <footer className="z-10 p-3 bg-[#0a0514]/95 backdrop-blur-lg">
                <div className="flex items-center gap-2 bg-[#1a1229] rounded-[28px] p-1.5 px-3 border border-white/5">
                    <button className="h-10 w-10 min-w-[40px] bg-purple-600 rounded-full flex items-center justify-center hover:bg-purple-500 transition-all active:scale-95 shadow-lg shadow-purple-500/20">
                        <Camera size={22} className="text-white" />
                    </button>
                    
                    <input 
                        type="text" 
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Message..."
                        className="flex-1 bg-transparent border-none outline-none text-[15px] px-2 text-white placeholder:text-white/30"
                    />

                    <div className="flex items-center gap-3 pr-1">
                        {!message ? (
                            <>
                                <Mic size={22} className="text-white/60 hover:text-white cursor-pointer transition-colors" />
                                <Image size={22} className="text-white/60 hover:text-white cursor-pointer transition-colors" />
                                <Smile size={22} className="text-white/60 hover:text-white cursor-pointer transition-colors" />
                                <Plus size={22} className="text-white/60 hover:text-white cursor-pointer transition-colors" />
                            </>
                        ) : (
                            <button className="text-purple-400 font-bold text-sm px-2 animate-in fade-in slide-in-from-right-1">Send</button>
                        )}
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default CreatorChat;
