import React from 'react';

const StoreLayout = ({ config, children }) => {
    const { layoutType } = children.props.template || { layoutType: 'grid' };

    const getLayoutStyles = () => {
        switch (layoutType) {
            case 'minimal':
                return 'bg-white max-w-4xl mx-auto px-12 py-20 text-center';
            case 'modern':
                return 'bg-slate-50 px-8 py-16';
            default:
                return 'bg-white px-6 py-12';
        }
    };

    return (
        <div 
            className={`min-h-full transition-all duration-500 ease-in-out ${getLayoutStyles()}`}
            style={{ '--theme-color': config.brandColor }}
        >
            {/* Store Header */}
            <div className={`mb-12 flex flex-col items-center gap-6 ${layoutType === 'minimal' ? 'animate-fade-in' : ''}`}>
                <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-xl border-4 border-white">
                    <img src={config.logo} alt={config.storeName} className="w-full h-full object-cover" />
                </div>
                <div className="text-center">
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight uppercase" style={{ color: layoutType === 'modern' ? config.brandColor : 'inherit' }}>
                        {config.storeName}
                    </h1>
                    <p className="text-sm font-bold text-gray-400 mt-2 tracking-widest">{config.customDomain}</p>
                </div>
            </div>

            {/* Dynamic Content */}
            {children}

            {/* Store Footer */}
            <div className="mt-24 pt-12 border-t border-gray-100 text-center">
                <p className="text-xs font-bold text-gray-300 uppercase tracking-widest">
                    Powered by Saara Website Builder
                </p>
            </div>
        </div>
    );
};

export default StoreLayout;
