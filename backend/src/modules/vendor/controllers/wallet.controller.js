import asyncHandler from '../../../utils/asyncHandler.js';
import ApiResponse from '../../../utils/ApiResponse.js';
import Commission from '../../../models/Commission.model.js';
import Settlement from '../../../models/Settlement.model.js';
import mongoose from 'mongoose';

// GET /api/vendor/wallet/stats
export const getWalletStats = asyncHandler(async (req, res) => {
    const vendorId = req.vendor.id;

    const stats = await Commission.aggregate([
        { $match: { vendorId: new mongoose.Types.ObjectId(vendorId) } },
        {
            $group: {
                _id: null,
                totalEarnings: { $sum: '$vendorEarnings' },
                totalCommissionPaid: { $sum: '$commission' },
                orderCount: { $sum: 1 }
            }
        }
    ]);

    const settlements = await Settlement.aggregate([
        { $match: { vendorId: new mongoose.Types.ObjectId(vendorId), status: 'completed' } },
        { $group: { _id: null, totalWithdrawn: { $sum: '$amount' } } }
    ]);

    const totalEarnings = stats[0]?.totalEarnings || 0;
    const totalWithdrawn = settlements[0]?.totalWithdrawn || 0;
    const currentBalance = parseFloat((totalEarnings - totalWithdrawn).toFixed(2));

    res.status(200).json(new ApiResponse(200, {
        totalEarnings: parseFloat(totalEarnings.toFixed(2)),
        totalWithdrawn: parseFloat(totalWithdrawn.toFixed(2)),
        currentBalance,
        orderCount: stats[0]?.orderCount || 0
    }, 'Wallet stats fetched.'));
});

// GET /api/vendor/wallet/history
export const getTransactionHistory = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, type = 'all' } = req.query;
    const vendorId = req.vendor.id;
    const skip = (page - 1) * limit;

    let transactions = [];
    let total = 0;

    if (type === 'earning' || type === 'all') {
        const earnings = await Commission.find({ vendorId })
            .sort({ createdAt: -1 })
            .limit(Number(limit))
            .skip(skip)
            .lean();
        transactions = [...transactions, ...earnings.map(e => ({
            id: e._id,
            type: 'earning',
            amount: e.vendorEarnings,
            description: `Earning from order ${e.orderId}`,
            date: e.createdAt,
            status: 'completed'
        }))];
    }

    if (type === 'payout' || type === 'all') {
        const payouts = await Settlement.find({ vendorId })
            .sort({ createdAt: -1 })
            .limit(Number(limit))
            .skip(skip)
            .lean();
        transactions = [...transactions, ...payouts.map(p => ({
            id: p._id,
            type: 'payout',
            amount: p.amount,
            description: `Payout to ${p.paymentMethod} (${p.transactionId || 'Pending'})`,
            date: p.createdAt,
            status: p.status
        }))];
    }

    // Sort combined transactions by date
    transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.status(200).json(new ApiResponse(200, {
        transactions: transactions.slice(0, limit),
        page: Number(page),
        hasMore: transactions.length > limit
    }, 'Transaction history fetched.'));
});
