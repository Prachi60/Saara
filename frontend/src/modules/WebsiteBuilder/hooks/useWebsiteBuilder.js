import { useState, useEffect, useMemo } from 'react';
import { initialStoreConfig } from '../dummyData/vendorStoreData';
import { getProductsByVendor } from '../../UserApp/data/catalogData';

export const useWebsiteBuilder = (vendorId) => {
    const [config, setConfig] = useState(() => {
        const saved = localStorage.getItem(`store_config_${vendorId || initialStoreConfig.vendorId}`);
        return saved ? JSON.parse(saved) : { ...initialStoreConfig, vendorId: vendorId || initialStoreConfig.vendorId };
    });

    const products = useMemo(() => {
        return getProductsByVendor(config.vendorId);
    }, [config.vendorId]);

    useEffect(() => {
        localStorage.setItem(`store_config_${config.vendorId}`, JSON.stringify(config));
    }, [config]);

    const updateConfig = (key, value) => {
        setConfig(prev => ({ ...prev, [key]: value }));
    };

    const updateBranding = (branding) => {
        setConfig(prev => ({ ...prev, ...branding }));
    };

    return {
        config,
        products,
        updateConfig,
        updateBranding,
    };
};
