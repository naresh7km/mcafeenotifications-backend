require('dotenv').config();

const path = require('path');
const express = require('express');
const cors = require('cors');
const cron = require('node-cron');

const pushRoutes = require('./src/routes/push');
const adminRoutes = require('./src/routes/admin');
const store = require('./src/store/subscriptionStore');
const { broadcast } = require('./src/services/pushService');

const app = express();
const PORT = process.env.PORT || 3000;

const allowedOrigins = (process.env.CORS_ORIGINS || '*').split(',').map(s => s.trim());
app.use(cors({
    origin: allowedOrigins.includes('*') ? true : allowedOrigins
}));
app.use(express.json({ limit: '100kb' }));

app.use('/api', pushRoutes);
app.use('/api/admin', adminRoutes);

app.use('/admin', express.static(path.join(__dirname, 'public')));

app.get('/health', (_req, res) => {
    res.json({ ok: true, subscribers: store.count(), uptime: process.uptime() });
});

store.load();

const cronExpr = process.env.SEND_INTERVAL_CRON || '* * * * *';
if (cron.validate(cronExpr)) {
    cron.schedule(cronExpr, async () => {
        const count = store.count();
        if (count === 0) {
            console.log('[cron] No subscribers, skipping broadcast');
            return;
        }
        const payload = {
            title: 'McAfee Security',
            body: `Real-time scan complete at ${new Date().toLocaleTimeString()}`,
            icon: '/111.png'
        };
        const result = await broadcast(payload);
        console.log(`[cron] sent=${result.sent} total=${result.total} removed=${result.removed}`);
    });
    console.log(`Cron schedule registered: "${cronExpr}"`);
} else {
    console.error(`Invalid cron expression: "${cronExpr}". Broadcasts disabled.`);
}

app.listen(PORT, () => {
    console.log(`Push backend listening on port ${PORT}`);
});
