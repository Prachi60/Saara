import React from 'react';
import { Heart, Share2, Bookmark, Flag } from 'lucide-react';

const ReelActions = ({ reel, onLike, onShare, onSave, onReport }) => {
    return (
        <div className="flex flex-col items-center gap-6 text-white">
            {/* Like */}
            <button
                onClick={() => onLike(reel.id)}
                className="flex flex-col items-center gap-1 group"
            >
                <div className={`p-3 rounded-full bg-black/20 backdrop-blur-sm transition-all group-active:scale-125 ${reel.isLiked ? 'text-red-500' : 'text-white'}`}>
                    <Heart size={28} fill={reel.isLiked ? "currentColor" : "none"} strokeWidth={2.5} />
                </div>
                <span className="text-xs font-semibold drop-shadow-md">{reel.likes.toLocaleString()}</span>
            </button>

            {/* Share */}
            <button
                onClick={() => onShare(reel.id)}
                className="flex flex-col items-center gap-1 group"
            >
                <div className="p-3 rounded-full bg-black/20 backdrop-blur-sm transition-all group-active:scale-110 text-white">
                    <Share2 size={28} strokeWidth={2.5} />
                </div>
                <span className="text-xs font-semibold drop-shadow-md">Share</span>
            </button>

            {/* Save */}
            <button
                onClick={() => onSave(reel.id)}
                className="flex flex-col items-center gap-1 group"
            >
                <div className="p-3 rounded-full bg-black/20 backdrop-blur-sm transition-all group-active:scale-110 text-white">
                    <Bookmark size={28} strokeWidth={2.5} />
                </div>
                <span className="text-xs font-semibold drop-shadow-md">Save</span>
            </button>

            {/* Report */}
            <button
                onClick={() => onReport(reel.id)}
                className="flex flex-col items-center gap-1 group opacity-80"
            >
                <div className="p-3 rounded-full bg-black/20 backdrop-blur-sm transition-all group-active:scale-110 text-white">
                    <Flag size={20} strokeWidth={2.5} />
                </div>
            </button>
        </div>
    );
};

export default ReelActions;
