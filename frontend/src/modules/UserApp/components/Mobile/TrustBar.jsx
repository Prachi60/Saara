import React from 'react';
import { FiBox, FiRotateCcw, FiShield, FiTruck } from 'react-icons/fi';

const TrustBar = () => {
  const trustItems = [
    { title: 'Variety of Products', sub: 'Different Categories', icon: FiBox },
    { title: 'Easy Returns', sub: 'In 15 Days', icon: FiRotateCcw },
    { title: '100% Authentic', sub: 'Products', icon: FiShield },
    { title: 'Fast Delivery', sub: '19000+ Locations', icon: FiTruck },
  ];

  return (
    <div className="py-8 bg-white border-t border-gray-100">
      <div className="px-2 grid grid-cols-4 gap-1">
        {trustItems.map((item, index) => (
          <div key={index} className="flex flex-col items-center text-center gap-2">
            <div className="w-16 h-16 rounded-full border border-purple-100 flex items-center justify-center bg-purple-50/50 relative">
              <div className="w-12 h-12 rounded-full border-2 border-dashed border-purple-200 flex items-center justify-center">
                <item.icon className="text-2xl text-purple-600" />
              </div>
              {/* Purple Accent from screenshot reimagined */}
              <div className="absolute bottom-1 right-2 bg-purple-600 rounded-full p-1 border-2 border-white shadow-sm">
                <div className="w-1 h-1 rounded-full bg-white" />
              </div>
            </div>
            <div className="space-y-0.5 px-1">
              <p className="text-[10px] font-bold text-gray-800 leading-tight h-7 flex items-center justify-center">
                {item.title}
              </p>
              <p className="text-[9px] text-gray-400 font-medium leading-tight">
                {item.sub}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrustBar;
