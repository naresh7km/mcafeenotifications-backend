const router = require('express').Router();
const store = require('../store/subscriptionStore');
const { broadcast } = require('../services/pushService');

const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'test-admin-token';

function auth(req, res, next) {
    const header = req.headers.authorization || '';
    const provided = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (provided !== ADMIN_TOKEN) return res.status(401).json({ error: 'Unauthorized' });
    next();
}

router.get('/stats', auth, (_req, res) => {
    res.json({
        subscribers: store.count(),
        endpoints: store.all().map(s => ({
            endpoint: s.endpoint.slice(0, 60) + (s.endpoint.length > 60 ? '...' : ''),
            hasKeys: !!s.keys
        }))
    });
});

router.post('/send', auth, async (req, res) => {
    const { title, body, icon } = req.body || {};
    const result = await broadcast({
        title: title || 'McAfee Security',
        body: body || 'Test notification',
        icon
    });
    res.json(result);
});

module.exports = router;
