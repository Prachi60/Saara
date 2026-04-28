import asyncHandler from '../../../utils/asyncHandler.js';
import ApiResponse from '../../../utils/ApiResponse.js';
import ApiError from '../../../utils/ApiError.js';
import Settings from '../../../models/Settings.model.js';

// GET /api/admin/settings/:key
export const getSettings = asyncHandler(async (req, res) => {
    const { key } = req.params;
    const settings = await Settings.findOne({ key });
    
    if (!settings) {
        return res.status(200).json(new ApiResponse(200, { key, value: {} }, 'Settings not found, returning empty.'));
    }
    
    res.status(200).json(new ApiResponse(200, settings, 'Settings fetched.'));
});

// PUT /api/admin/settings/:key
export const updateSettings = asyncHandler(async (req, res) => {
    const { key } = req.params;
    const { value } = req.body;

    if (!value) throw new ApiError(400, 'Value is required.');

    const settings = await Settings.findOneAndUpdate(
        { key },
        { value },
        { upsert: true, new: true }
    );

    res.status(200).json(new ApiResponse(200, settings, 'Settings updated.'));
});

// GET /api/admin/settings
export const getAllSettings = asyncHandler(async (req, res) => {
    const settings = await Settings.find();
    const config = settings.reduce((acc, curr) => {
        acc[curr.key] = curr.value;
        return acc;
    }, {});
    
    res.status(200).json(new ApiResponse(200, config, 'All settings fetched.'));
});
