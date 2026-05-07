const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const FILE = path.join(DATA_DIR, 'subscriptions.json');

let subscriptions = new Map();

function ensureDir() {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function persist() {
    ensureDir();
    fs.writeFileSync(FILE, JSON.stringify([...subscriptions.values()], null, 2));
}

function load() {
    ensureDir();
    if (!fs.existsSync(FILE)) {
        console.log('No prior subscriptions file. Starting fresh.');
        return;
    }
    try {
        const arr = JSON.parse(fs.readFileSync(FILE, 'utf8'));
        subscriptions = new Map(arr.map(s => [s.endpoint, s]));
        console.log(`Loaded ${subscriptions.size} subscription(s) from disk`);
    } catch (err) {
        console.error('Failed to load subscriptions:', err);
    }
}

function add(sub) {
    if (!sub || !sub.endpoint) return false;
    const isNew = !subscriptions.has(sub.endpoint);
    subscriptions.set(sub.endpoint, sub);
    persist();
    return isNew;
}

function remove(endpoint) {
    const removed = subscriptions.delete(endpoint);
    if (removed) persist();
    return removed;
}

function all() {
    return [...subscriptions.values()];
}

function count() {
    return subscriptions.size;
}

module.exports = { add, remove, all, count, load };
