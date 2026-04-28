import AuditLog from '../models/AuditLog.model.js';

export const audit = (action, resource) => {
    return async (req, res, next) => {
        // We capture the original res.json to log after the request completes successfully
        const originalJson = res.json;

        res.json = function (data) {
            // Only log successful administrative actions
            if (res.statusCode >= 200 && res.statusCode < 300 && req.user?.id) {
                AuditLog.create({
                    adminId: req.user.id,
                    action,
                    resource,
                    resourceId: req.params.id || data?.data?._id || data?.data?.id,
                    changes: req.method === 'GET' ? undefined : req.body,
                    ipAddress: req.ip || req.headers['x-forwarded-for'],
                    userAgent: req.headers['user-agent']
                }).catch(err => console.error('Audit Log Error:', err));
            }
            return originalJson.call(this, data);
        };

        next();
    };
};
