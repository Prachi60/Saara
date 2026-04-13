import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import ReelActions from './ReelActions';
import { useAffiliate } from '../../Affiliate/hooks/useAffiliate';

const ReelCard = ({ reel, toggleLike, shareReel, saveReel, reportReel }) => {
    const videoRef = useRef(null);
    const navigate = useNavigate();
    const { trackClick } = useAffiliate();

    // Auto-play / Pause logic based on visibility
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    videoRef.current?.play().catch(e => console.log('Autoplay blocked:', e));
                } else {
                    videoRef.current?.pause();
                    if (videoRef.current) videoRef.current.currentTime = 0;
                }
            },
            { threshold: 0.5 }
        );

        if (videoRef.current) {
            observer.observe(videoRef.current);
        }

        return () => observer.disconnect();
    }, []);

    const handleViewProduct = () => {
        trackClick(reel.productId, reel.id, 'creator_99'); // Track affiliate click
        navigate(`/product/${reel.productId}`);
    };

    return (
        <div className="relative h-screen w-full md:max-w-[calc(100vh*9/16)] bg-black snap-start overflow-hidden group shrink-0">
            {/* Background Video */}
            <video
                ref={videoRef}
                className="h-full w-full object-cover"
                src={reel.videoUrl}
                loop
                muted
                autoPlay
                playsInline
                preload="auto"
            />

            {/* Bottom Gradient Overlay */}
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />

            {/* Interactions Overlay */}
            <div className="absolute right-4 bottom-24 z-10">
                <ReelActions 
                    reel={reel} 
                    onLike={toggleLike} 
                    onShare={shareReel} 
                    onSave={saveReel} 
                    onReport={reportReel}
                />
            </div>

            {/* Content & Product Info */}
            <div className="absolute left-4 right-20 bottom-8 z-10 flex flex-col gap-4">
                {/* Product Detail Button */}
                <button
                    onClick={handleViewProduct}
                    className="flex w-fit items-center gap-2 rounded-xl bg-white/20 backdrop-blur-md px-4 py-2 text-sm font-bold text-white transition-all hover:bg-white/30 active:scale-95 border border-white/20 shadow-xl"
                >
                    <ShoppingBag size={18} />
                    View Product
                </button>

                {/* Caption */}
                <div className="text-white drop-shadow-lg">
                    <p className="font-semibold text-lg">{reel.caption}</p>
                </div>

                {/* Affiliate Disclaimer */}
                <div className="text-[10px] text-white/60 leading-tight pr-4">
                    <p>“This reel may contain affiliate links. Earnings are subject to successful order delivery.”</p>
                </div>
            </div>
            
            {/* Play/Pause indicator logic can be added here if needed */}
        </div>
    );
};

export default ReelCard;
