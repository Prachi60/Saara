import React from 'react';
import { FiMonitor, FiSmartphone, FiLayout, FiEye, FiZap } from 'react-icons/fi';
import { useWebsiteBuilder } from '../hooks/useWebsiteBuilder';
import BrandingForm from '../components/BrandingForm';
import TemplateSelector from '../components/TemplateSelector';
import StoreLayout from '../components/StoreLayout';
import ProductGrid from '../components/ProductGrid';
import { templates } from '../dummyData/templatesData';

const BuilderDashboard = () => {
    const { config, products, updateConfig } = useWebsiteBuilder();
    const activeTemplate = templates.find(t => t.templateId === config.selectedTemplate) || templates[0];

    return (
        <div className="h-[calc(100vh-140px)] flex overflow-hidden">
            {/* Left Sidebar - Controls */}
                <div className="w-80 h-full bg-white border-r border-gray-100 flex flex-col shadow-sm z-10 overflow-y-auto no-scrollbar">
                    <div className="p-8 space-y-12">
                        <section className="space-y-4">
                            <div className="bg-primary-50 p-6 rounded-3xl border border-primary-100">
                                <h3 className="text-sm font-black text-primary-900 flex items-center gap-2 uppercase tracking-wide">
                                    <FiZap /> Quick Launch
                                </h3>
                                <p className="text-[11px] text-primary-600 mt-2 font-bold leading-relaxed">
                                    Launch your store on <span className="underline">{config.customDomain}</span> with a single click once you are ready.
                                </p>
                            </div>
                        </section>

                        <TemplateSelector 
                            selectedTemplateId={config.selectedTemplate} 
                            onSelect={updateConfig} 
                        />
                        
                        <BrandingForm 
                            config={config} 
                            onUpdate={updateConfig} 
                        />
                    </div>
                </div>

                {/* Right Area - Live Preview */}
                <div className="flex-1 bg-gray-100 p-8 flex flex-col gap-6 overflow-hidden">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-gray-200">
                            <div className="flex items-center gap-4 border-r border-gray-100 pr-4 mr-2">
                                <button className="text-primary-600"><FiSmartphone /></button>
                                <button className="text-gray-300"><FiMonitor /></button>
                            </div>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                Live Preview
                            </span>
                        </div>
                        <button 
                            onClick={() => window.open(`/store/${config.vendorId}`, '_blank')}
                            className="bg-primary-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2"
                        >
                            <FiEye /> View Live Site
                        </button>
                    </div>

                    {/* Preview Canvas */}
                    <div className="flex-1 overflow-y-auto bg-white rounded-3xl shadow-2xl border border-gray-200 scrollbar-admin mx-auto w-full max-w-[450px]">
                        <StoreLayout config={config}>
                            <ProductGrid products={products} template={activeTemplate} />
                        </StoreLayout>
                    </div>
                </div>
        </div>
    );
};

export default BuilderDashboard;
