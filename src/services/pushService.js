const webpush = require('web-push');
const store = require('../store/subscriptionStore');
const vapid = require('../config/vapid');

webpush.setVapidDetails(vapid.subject, vapid.publicKey, vapid.privateKey);

async function sendOne(subscription, payload) {
    try {
        await webpush.sendNotification(subscription, JSON.stringify(payload));
        return { ok: true };
    } catch (err) {
        // 404 / 410 means the subscription is gone — drop it.
        if (err.statusCode === 404 || err.statusCode === 410) {
            store.remove(subscription.endpoint);
            return { ok: false, removed: true, status: err.statusCode };
        }
        return { ok: false, status: err.statusCode, error: err.body || err.message };
    }
}

async function broadcast(payload) {
    const subs = store.all();
    const results = await Promise.all(subs.map(sub => sendOne(sub, payload)));
    const sent = results.filter(r => r.ok).length;
    const removed = results.filter(r => r.removed).length;
    const failed = results.filter(r => !r.ok && !r.removed).length;
    return { sent, total: subs.length, removed, failed };
}

module.exports = { broadcast, sendOne };
