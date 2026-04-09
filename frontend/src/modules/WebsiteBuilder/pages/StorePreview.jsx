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
                {/* Floating Navigation Controls (Admin only view simulation) */}
                <div className="fixed top-6 left-6 z-[100] flex items-center gap-2">
                    <button 
                        onClick={() => navigate(-1)}
                        className="p-3 bg-white/80 backdrop-blur-md rounded-full shadow-lg border border-white hover:bg-white transition-all group"
                    >
                        <FiArrowLeft className="text-gray-800 group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div className="px-5 py-3 bg-white/80 backdrop-blur-md rounded-full shadow-lg border border-white flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <span className="text-xs font-black text-gray-800 uppercase tracking-widest">{config.customDomain}</span>
                    </div>
                </div>

                {/* Persistent Mini Header */}
                <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-50 px-8 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <FiShoppingBag className="text-2xl" style={{ color: config.brandColor }} />
                        <span className="text-lg font-black text-gray-900 tracking-tighter uppercase">{config.storeName}</span>
                    </div>
                    <div className="flex items-center gap-6">
                        <FiSearch className="text-xl text-gray-400 cursor-pointer" />
                        <div className="relative cursor-pointer">
                            <FiShoppingBag className="text-xl text-gray-900" />
                            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500 border-2 border-white" />
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
                        className="px-12 py-5 rounded-full text-white font-black shadow-2xl transition-all hover:scale-105 active:scale-95 uppercase tracking-widest text-sm"
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
