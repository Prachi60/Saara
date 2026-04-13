import React from 'react';
import { FiSearch, FiCompass, FiTrendingUp, FiUser, FiShoppingBag } from 'react-icons/fi';
import { useExplore } from '../hooks/useExplore';
import CategoryTabs from '../components/CategoryTabs';
import ExploreReelCard from '../components/ExploreReelCard';
import PopularCreators from '../components/PopularCreators';
import TrendingProducts from '../components/TrendingProducts';
import PageTransition from '../../../shared/components/PageTransition';
import MobileLayout from '../../UserApp/components/Layout/MobileLayout';

const ExplorePage = () => {
    const { selectedCategory, setSelectedCategory, reels, products, creators } = useExplore();

    return (
        <PageTransition>
            <MobileLayout showBottomNav={true} showCartBar={false}>
                <div className="min-h-screen bg-white pb-24">
                    {/* Sticky Header with Search */}
                    <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg px-6 pt-8 pb-4">
                        <div className="flex items-center justify-between mb-6">
                            <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                <FiCompass className="text-gray-800" />
                                Explore
                            </h1>
                        </div>
                        
                        <div className="relative group">
                            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-primary-500" />
                            <input 
                                type="text"
                                placeholder="Search styles, creators, products..."
                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-12 pr-4 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-100 focus:bg-white transition-all shadow-sm"
                            />
                        </div>
                    </div>

                    {/* Category Selection */}
                    <CategoryTabs 
                        selectedCategory={selectedCategory} 
                        onSelect={setSelectedCategory} 
                    />

                    {/* Trending Reels Grid */}
                    <div className="px-6 py-4">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                <FiTrendingUp className="text-red-500" />
                                Trending Reels
                            </h2>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
                            {reels.map(reel => (
                                <ExploreReelCard key={reel.id} reel={reel} />
                            ))}
                        </div>
                    </div>

                    {/* Popular Creators */}
                    <div className="py-4">
                        <div className="px-6 mb-2">
                            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                <FiUser className="text-blue-500" />
                                Popular Creators
                            </h2>
                        </div>
                        <PopularCreators creators={creators} />
                    </div>

                    {/* Trending Products */}
                    <div className="py-4">
                        <div className="px-6 mb-4">
                            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                <FiShoppingBag className="text-primary-600" />
                                Hot Picks
                            </h2>
                        </div>
                        <TrendingProducts products={products} />
                    </div>
                </div>
            </MobileLayout>
        </PageTransition>
    );
};

export default ExplorePage;
