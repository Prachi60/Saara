import React from 'react';
import MobileProductCard from '../../UserApp/components/Mobile/MobileProductCard';

const TrendingProducts = ({ products }) => {
    return (
        <div className="grid grid-cols-2 gap-4 px-6 pb-6">
            {products.map((product) => (
                <div key={product.id} className="min-w-0">
                    <MobileProductCard product={product} />
                </div>
            ))}
            
            {products.length === 0 && (
                <div className="col-span-2 py-12 text-center text-gray-400 font-bold uppercase tracking-widest text-xs">
                    No products found in this category
                </div>
            )}
        </div>
    );
};

export default TrendingProducts;
