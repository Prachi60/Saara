import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const DealsSection = ({ items }) => {
  const defaultDeals = [
    { brand: 'LetsShave', offer: 'Up To 45% OFF', image: 'https://images.pexels.com/photos/3993324/pexels-photo-3993324.jpeg?auto=compress&cs=tinysrgb&w=400', link: '/search?q=LetsShave' },
    { brand: 'Dove', offer: 'Up To 35% OFF', image: 'https://images.pexels.com/photos/4046395/pexels-photo-4046395.jpeg?auto=compress&cs=tinysrgb&w=400', link: '/search?q=Dove' },
    { brand: 'NAKPRO', offer: 'Up To 60% OFF', image: 'https://images.pexels.com/photos/4465124/pexels-photo-4465124.jpeg?auto=compress&cs=tinysrgb&w=400', link: '/search?q=NAKPRO' },
    { brand: 'ISOPURE', offer: 'Up To 15% OFF', image: 'https://images.pexels.com/photos/4041391/pexels-photo-4041391.jpeg?auto=compress&cs=tinysrgb&w=400', link: '/search?q=ISOPURE' },
    { brand: 'FOGG', offer: 'Flat 15% OFF', image: 'https://images.pexels.com/photos/1961778/pexels-photo-1961778.jpeg?auto=compress&cs=tinysrgb&w=400', link: '/search?q=FOGG' },
    { brand: 'BOULT', offer: 'Up To 60% OFF', image: 'https://images.pexels.com/photos/3780681/pexels-photo-3780681.jpeg?auto=compress&cs=tinysrgb&w=400', link: '/search?q=BOULT' },
    { brand: 'Mamaearth', offer: 'Up To 20% OFF', image: 'https://images.pexels.com/photos/3616956/pexels-photo-3616956.jpeg?auto=compress&cs=tinysrgb&w=400', link: '/search?q=Mamaearth' },
    { brand: 'POLICE', offer: 'Up To 40% OFF', image: 'https://images.pexels.com/photos/1961791/pexels-photo-1961791.jpeg?auto=compress&cs=tinysrgb&w=400', link: '/search?q=POLICE' },
    { brand: 'Durex', offer: 'Up To 20% OFF', image: 'https://images.pexels.com/photos/3850512/pexels-photo-3850512.jpeg?auto=compress&cs=tinysrgb&w=400', link: '/search?q=Durex' },
  ];

  const deals = items && items.length > 0 ? items : defaultDeals;

  return (
    <div className="py-8 bg-sky-700/90 text-white">
      <div className="px-4 mb-6 flex justify-center">
        <h2 className="text-2xl font-bold tracking-tight">Check Out Deals</h2>
      </div>

      <div className="px-4 grid grid-cols-3 gap-3">
        {deals.map((deal, index) => (
          <motion.div 
            key={index}
            whileTap={{ scale: 0.95 }}
            className="flex flex-col gap-2">
            <Link to={deal.link || "/search"} className="block relative aspect-[3/4] rounded-xl overflow-hidden shadow-lg border border-white/20">
              <img 
                src={deal.image} 
                alt={deal.brand}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-black/40 backdrop-blur-sm p-1.5 flex justify-center items-center">
                <span className="text-[10px] font-black tracking-tight">{deal.brand}</span>
              </div>
            </Link>
            <p className="text-[10px] font-bold text-center text-white/90">{deal.offer}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default DealsSection;
