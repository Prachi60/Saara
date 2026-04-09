import React from 'react';
import MobileProductCard from '../../UserApp/components/Mobile/MobileProductCard';

const ProductGrid = ({ products, template }) => {
    const { layoutType } = template;

    const getGridStyles = () => {
        switch (layoutType) {
            case 'minimal':
                return 'grid grid-cols-1 gap-12';
            case 'modern':
                return 'grid grid-cols-2 md:grid-cols-3 gap-8';
            default:
                return 'grid grid-cols-2 gap-4';
        }
    };

    return (
        <div className={getGridStyles()}>
            {products.map((product) => (
                <div key={product.id} className="transition-all hover:-translate-y-2">
                    <MobileProductCard product={product} />
                    {layoutType === 'minimal' && (
                        <div className="mt-4 px-4">
                            <p className="text-sm text-gray-500 italic">"Premium selection from our {product.categoryName} category."</p>
                        </div>
                    )}
                </div>
            ))}
            
            {products.length === 0 && (
                <div className="col-span-full py-20 text-center">
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">No products in your collection yet.</p>
                </div>
            )}
        </div>
    );
};

export default ProductGrid;
