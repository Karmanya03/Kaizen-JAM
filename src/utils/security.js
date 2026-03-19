// Security utilities

export function validateEnv() {
    const required = ['DISCORD_TOKEN', 'CLIENT_ID'];
    const missing = required.filter(k => !process.env[k]);
    if (missing.length) {
        console.error(`[SECURITY] Missing env vars: ${missing.join(', ')}`);
        process.exit(1);
    }
    console.log('[SECURITY] Environment validated');
}

export function sanitizeInput(str) {
    if (typeof str !== 'string') return '';
    return str.slice(0, 300).replace(/[`@]/g, '');
}

export function isOwner(userId) {
    const owners = process.env.OWNER_IDS?.split(',').map(s => s.trim()) || [];
    return owners.includes(userId);
}