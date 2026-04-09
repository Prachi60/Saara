import React from 'react';
import { FiTrendingUp, FiDollarSign, FiUsers, FiClock } from 'react-icons/fi';
import { formatPrice } from '../../../shared/utils/helpers';

const AffiliateStats = ({ stats }) => {
    const statCards = [
        { label: 'Total Affiliate Orders', value: stats.totalOrders, icon: FiTrendingUp, color: 'bg-blue-50 text-blue-600' },
        { label: 'Total Revenue', value: formatPrice(stats.totalRevenue), icon: FiDollarSign, color: 'bg-green-50 text-green-600' },
        { label: 'Active Creators', value: stats.activeCreators, icon: FiUsers, color: 'bg-indigo-50 text-indigo-600' },
        { label: 'Pending Payouts', value: formatPrice(stats.pendingCommissions), icon: FiClock, color: 'bg-yellow-50 text-yellow-600' },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map((stat, i) => (
                <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${stat.color}`}>
                        <stat.icon className="text-xl" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
                        <p className="text-2xl font-black text-gray-900 leading-tight">{stat.value}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default AffiliateStats;
