// Hardcoded VAPID keys for local testing. Override in production via env vars.
// Regenerate with: npm run generate-vapid
const DEFAULTS = {
    publicKey: 'BIUkK2tqsfeow9NLxnUEKR0DTuJWERen1uajbw0sv_1so-wGOdX8c_kWVvGEKBGz82yBWKH0VDgERymuWuIlnk0',
    privateKey: '7j0GAESKI6PuuZ3MxsDclYuKZRXB86eFlplOB8d4wUQ',
    subject: 'mailto:adityamalik2023@gmail.com'
};

module.exports = {
    publicKey: process.env.VAPID_PUBLIC_KEY || DEFAULTS.publicKey,
    privateKey: process.env.VAPID_PRIVATE_KEY || DEFAULTS.privateKey,
    subject: process.env.VAPID_SUBJECT || DEFAULTS.subject
};
