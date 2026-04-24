import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiShoppingBag, FiSearch } from 'react-icons/fi';
import { useWebsiteBuilder } from '../hooks/useWebsiteBuilder';
import StoreLayout from '../components/StoreLayout';
import ProductGrid from '../components/ProductGrid';
import { templates } from '../dummyData/templatesData';
import PageTransition from '../../../shared/components/PageTransition';

const StorePreview = () => {
    const { vendorId } = useParams();
    const navigate = useNavigate();
    const { config, products } = useWebsiteBuilder(vendorId);
    const activeTemplate = templates.find(t => t.templateId === config.selectedTemplate) || templates[0];

    return (
        <PageTransition>
            <div className="min-h-screen bg-white">
                {/* Unified Header */}
                <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-100 px-4 md:px-8 py-3 flex items-center justify-between transition-all">
                    <div className="flex items-center gap-2 md:gap-4 flex-1">
                        <button 
                            onClick={() => navigate(-1)}
                            className="p-2.5 bg-gray-50 rounded-full hover:bg-gray-100 transition-all group"
                        >
                            <FiArrowLeft className="text-gray-800 group-hover:-translate-x-1 transition-transform" />
                        </button>
                        
                        <div className="hidden md:flex items-center gap-3">
                            <FiShoppingBag className="text-2xl" style={{ color: config.brandColor }} />
                            <span className="text-lg font-black text-gray-900 tracking-tighter uppercase">{config.storeName}</span>
                        </div>

                        {/* Domain Badge - More compact on mobile */}
                        <div className="px-3 md:px-4 py-2 bg-white rounded-full shadow-sm border border-gray-100 flex items-center gap-2 md:gap-3">
                            <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-[10px] md:text-xs font-black text-gray-800 uppercase tracking-widest truncate max-w-[120px] md:max-w-none">
                                {config.customDomain}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 md:gap-6">
                        <FiSearch className="text-lg md:text-xl text-gray-400 cursor-pointer hover:text-gray-900 transition-colors" />
                        <div className="relative cursor-pointer group">
                            <FiShoppingBag className="text-lg md:text-xl text-gray-900 group-hover:scale-110 transition-transform" />
                            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-white" />
                        </div>
                    </div>
                </header>

                <main className="pb-32">
                    <StoreLayout config={config}>
                        <ProductGrid products={products} template={activeTemplate} />
                    </StoreLayout>
                </main>

                {/* Simple Fixed Footer CTA */}
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
                    <button 
                        className="px-8 py-3.5 rounded-full text-white font-black shadow-2xl transition-all hover:scale-105 active:scale-95 uppercase tracking-widest text-xs"
                        style={{ backgroundColor: config.brandColor }}
                    >
                        Contact Store Owner
                    </button>
                </div>
            </div>
        </PageTransition>
    );
};

export default StorePreview;
