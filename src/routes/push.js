const router = require('express').Router();
const store = require('../store/subscriptionStore');
const vapid = require('../config/vapid');

router.get('/vapid-public-key', (_req, res) => {
    res.json({ publicKey: vapid.publicKey });
});

router.post('/subscribe', (req, res) => {
    const sub = req.body;
    if (!sub || !sub.endpoint) {
        return res.status(400).json({ error: 'Invalid subscription' });
    }
    const isNew = store.add(sub);
    res.status(201).json({ ok: true, isNew, total: store.count() });
});

router.post('/unsubscribe', (req, res) => {
    const { endpoint } = req.body || {};
    if (!endpoint) return res.status(400).json({ error: 'endpoint required' });
    const removed = store.remove(endpoint);
    res.json({ ok: true, removed, total: store.count() });
});

router.get('/stats', (_req, res) => {
    res.json({ subscribers: store.count() });
});

module.exports = router;
