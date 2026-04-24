import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera } from 'lucide-react';
import { useReels } from '../hooks/useReels';
import ReelCard from '../components/ReelCard';

const ReelsPage = () => {
    const { reels, toggleLike, shareReel, saveReel, reportReel } = useReels();
    const navigate = useNavigate();

    return (
        <div className="relative h-screen w-full bg-black overflow-y-scroll snap-y snap-mandatory scroll-smooth no-scrollbar flex flex-col items-center">
            {/* Top Navigation Bar Overlay */}
            <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
                <div className="w-full md:max-w-[calc(100vh*9/16)] flex items-center justify-between pl-2 pr-4 pt-3 pb-8">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/')}
                            className="pointer-events-auto p-2 rounded-full bg-black/20 backdrop-blur-md text-white transition-all active:scale-95 border border-white/10"
                        >
                            <ArrowLeft size={18} strokeWidth={2.5} />
                        </button>
                        <div className="pointer-events-auto font-bold text-2xl text-white tracking-tight drop-shadow-2xl">
                            Reels
                        </div>
                    </div>
                    <button
                        className="pointer-events-auto p-1 text-white transition-all active:scale-95"
                    >
                        <Camera size={26} strokeWidth={2.5} />
                    </button>
                </div>
            </div>

            {/* Scroll Container */}
            {reels.map((reel) => (
                <ReelCard
                    key={reel.id}
                    reel={reel}
                    toggleLike={toggleLike}
                    shareReel={shareReel}
                    saveReel={saveReel}
                    reportReel={reportReel}
                />
            ))}

            {/* Empty State / End of Feed */}
            {reels.length === 0 && (
                <div className="h-screen flex items-center justify-center text-white/50 bg-neutral-900">
                    <p className="font-bold tracking-tight">NO MORE PRODUCT REELS</p>
                </div>
            )}
            
            {/* Responsive styles for hiding scrollbars */}
            <style>{`
                .no-scrollbar::-webkit-scrollbar {
                  display: none;
                }
                .no-scrollbar {
                  -ms-overflow-style: none;
                  scrollbar-width: none;
                }
            `}</style>
        </div>
    );
};

export default ReelsPage;
