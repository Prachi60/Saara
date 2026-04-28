import React, { useState, useEffect, useCallback } from 'react';
import { FiLink, FiSearch, FiExternalLink, FiTag, FiShoppingBag, FiGlobe, FiX, FiFileText } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { getAllCategories, getAllBrands, getAllProducts } from '../../services/adminService';
import AnimatedSelect from '../AnimatedSelect';

// Custom debounce implementation
const debounce = (fn, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};

const STATIC_PAGES = [
  { label: 'Home Page', value: '/' },
  { label: 'All Categories', value: '/categories' },
  { label: 'Flash Sale', value: '/flash-sale' },
  { label: 'Daily Deals', value: '/daily-deals' },
  { label: 'New Arrivals', value: '/new-arrivals' },
  { label: 'All Offers', value: '/offers' },
  { label: 'Reels / Video Shopping', value: '/reels' },
  { label: 'Explore / Discover', value: '/explore' },
  { label: 'My Profile', value: '/profile' },
  { label: 'My Orders', value: '/orders' },
  { label: 'My Wishlist', value: '/wishlist' },
  { label: 'Privacy Policy', value: '/policy/privacy-policy' },
  { label: 'Refund Policy', value: '/policy/refund-policy' },
  { label: 'Terms & Conditions', value: '/policy/terms-conditions' },
];

const LinkPicker = ({ value, onChange }) => {
  const [type, setType] = useState('none');
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Initialize state based on existing value
  useEffect(() => {
    if (!value) {
      setType('none');
      return;
    }

    if (value.startsWith('/category/')) {
      setType('category');
    } else if (value.startsWith('/product/')) {
      setType('product');
    } else if (value.startsWith('/brand/')) {
      setType('brand');
    } else if (value.startsWith('/search?q=')) {
      setType('search');
      setQuery(decodeURIComponent(value.split('=')[1]));
    } else if (value.startsWith('http')) {
      setType('external');
      setQuery(value);
    } else if (STATIC_PAGES.some(p => p.value === value)) {
      setType('page');
      setQuery(value);
    } else {
      // Fallback for any unknown link, still show as custom search or similar
      setType('search');
    }
  }, [value]);

  const fetchSuggestions = useCallback(
    debounce(async (searchType, searchQuery) => {
      if (!searchQuery && searchType === 'product') {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      try {
        let items = [];
        if (searchType === 'category') {
          const res = await getAllCategories();
          items = res.data.map(c => ({ id: c._id, name: c.name, link: `/category/${c._id}` }));
          if (searchQuery) {
            items = items.filter(i => i.name.toLowerCase().includes(searchQuery.toLowerCase()));
          }
        } else if (searchType === 'brand') {
          const res = await getAllBrands();
          items = res.data.map(b => ({ id: b._id, name: b.name, link: `/brand/${b._id}` }));
          if (searchQuery) {
            items = items.filter(i => i.name.toLowerCase().includes(searchQuery.toLowerCase()));
          }
        } else if (searchType === 'product') {
          const res = await getAllProducts({ search: searchQuery, limit: 10 });
          items = res.data.products.map(p => ({ id: p._id, name: p.name, link: `/product/${p._id}` }));
        }
        setSuggestions(items);
      } catch (error) {
        console.error('Failed to fetch suggestions:', error);
      } finally {
        setIsLoading(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    if (['category', 'brand', 'product'].includes(type)) {
      fetchSuggestions(type, query);
    } else {
      setSuggestions([]);
    }
  }, [type, query, fetchSuggestions]);

  const handleSelect = (item) => {
    setSelectedItem(item);
    setQuery(item.name);
    setSuggestions([]);
    onChange(item.link);
  };

  const handleTypeChange = (e) => {
    const newType = e.target.value;
    setType(newType);
    setQuery('');
    setSelectedItem(null);
    setSuggestions([]);
    
    if (newType === 'none') {
      onChange('');
    } else if (newType === 'page') {
      onChange(STATIC_PAGES[0].value);
      setQuery(STATIC_PAGES[0].value);
    }
  };

  const handleQueryChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    
    if (type === 'search') {
      onChange(val ? `/search?q=${encodeURIComponent(val)}` : '');
    } else if (type === 'external') {
      onChange(val);
    } else if (type === 'page') {
      onChange(val);
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'category': return <FiTag className="text-blue-500" />;
      case 'product': return <FiShoppingBag className="text-purple-500" />;
      case 'brand': return <FiGlobe className="text-green-500" />;
      case 'search': return <FiSearch className="text-orange-500" />;
      case 'external': return <FiExternalLink className="text-indigo-500" />;
      case 'page': return <FiFileText className="text-cyan-500" />;
      default: return <FiLink className="text-gray-400" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-1">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">
            Link Type
          </label>
          <AnimatedSelect
            value={type}
            onChange={handleTypeChange}
            options={[
              { value: 'none', label: 'No Link' },
              { value: 'page', label: 'Static Page' },
              { value: 'product', label: 'Product' },
              { value: 'category', label: 'Category' },
              { value: 'brand', label: 'Brand' },
              { value: 'search', label: 'Search Results' },
              { value: 'external', label: 'External URL' },
            ]}
          />
        </div>

        {type !== 'none' && (
          <div className="sm:col-span-2 relative">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">
              {type === 'search' ? 'Search Keyword' : type === 'external' ? 'Full URL (https://...)' : type === 'page' ? 'Select Page' : 'Search & Select'}
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
                {getIcon()}
              </div>
              
              {type === 'page' ? (
                <div className="pl-10">
                  <AnimatedSelect
                    value={query}
                    onChange={handleQueryChange}
                    options={STATIC_PAGES}
                  />
                </div>
              ) : (
                <>
                  <input
                    type="text"
                    value={query}
                    onChange={handleQueryChange}
                    placeholder={
                      type === 'product' ? 'Type product name...' :
                      type === 'category' ? 'Search category...' :
                      type === 'brand' ? 'Search brand...' :
                      type === 'search' ? 'e.g. Lipsticks' :
                      type === 'external' ? 'https://google.com' : 'Enter link...'
                    }
                    className="w-full pl-10 pr-10 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 transition-all text-sm font-medium"
                  />
                  {isLoading && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                  {query && !isLoading && (
                    <button 
                      onClick={() => { setQuery(''); onChange(''); setSelectedItem(null); }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <FiX size={14} />
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Suggestions Dropdown */}
            <AnimatePresence>
              {suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute z-[100] left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 max-h-60 overflow-y-auto overflow-x-hidden scrollbar-admin"
                >
                  {suggestions.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelect(item)}
                      className="w-full text-left px-4 py-2.5 hover:bg-gray-50 flex items-center gap-3 transition-colors border-b border-gray-50 last:border-0"
                    >
                      <div className="p-1.5 bg-gray-100 rounded-lg">
                        {getIcon()}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-800 line-clamp-1">{item.name}</p>
                        <p className="text-[10px] text-gray-500 font-mono">{item.link}</p>
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {value && type !== 'none' && (
        <div className="bg-primary-50/50 border border-primary-100 rounded-lg px-3 py-2 flex items-center gap-2">
          <FiLink className="text-primary-500 shrink-0" size={14} />
          <span className="text-xs font-semibold text-primary-700 truncate">
            Final Link: <span className="font-mono">{value}</span>
          </span>
        </div>
      )}
    </div>
  );
};

export default LinkPicker;
