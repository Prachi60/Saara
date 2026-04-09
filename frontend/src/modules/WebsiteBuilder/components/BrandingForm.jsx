import React from 'react';
import { FiImage, FiType, FiGlobe, FiDroplet } from 'react-icons/fi';

const BrandingForm = ({ config, onUpdate }) => {
    return (
        <div className="space-y-6">
            <h2 className="text-lg font-black text-gray-800 uppercase tracking-wide flex items-center gap-2">
                <FiType className="text-primary-500" />
                Store Branding
            </h2>

            <div className="space-y-4">
                {/* Store Name */}
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Store Name</label>
                    <div className="relative">
                        <FiType className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                            type="text"
                            value={config.storeName}
                            onChange={(e) => onUpdate('storeName', e.target.value)}
                            className="w-full bg-white border border-gray-100 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary-100"
                        />
                    </div>
                </div>

                {/* Custom Domain Simulation */}
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Target Domain</label>
                    <div className="relative">
                        <FiGlobe className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                            type="text"
                            value={config.customDomain}
                            onChange={(e) => onUpdate('customDomain', e.target.value)}
                            className="w-full bg-white border border-gray-100 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary-100"
                        />
                    </div>
                </div>

                {/* Logo URL */}
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Logo URL (Mock Upload)</label>
                    <div className="relative">
                        <FiImage className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                            type="text"
                            value={config.logo}
                            onChange={(e) => onUpdate('logo', e.target.value)}
                            className="w-full bg-white border border-gray-100 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary-100"
                        />
                    </div>
                </div>

                {/* Brand Color */}
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Brand Accent Color</label>
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1">
                            <FiDroplet className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input 
                                type="text"
                                value={config.brandColor}
                                onChange={(e) => onUpdate('brandColor', e.target.value)}
                                className="w-full bg-white border border-gray-100 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary-100"
                            />
                        </div>
                        <input 
                            type="color"
                            value={config.brandColor}
                            onChange={(e) => onUpdate('brandColor', e.target.value)}
                            className="w-12 h-12 rounded-xl border-0 cursor-pointer overflow-hidden p-0"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BrandingForm;
