// Basic UUID v4 validation function
const isValidUUIDv4 = (uuid) => {
    const uuidRegex = /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;
    return uuidRegex.test(uuid);
};
export const apiTokenAuth = async (c, next) => {
    // Get token from header
    const authHeader = c.req.header('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    // Check if no token
    if (!token) {
        return c.json({ msg: 'No token, authorization denied' }, 401);
    }
    try {
        // Validate token format (UUID v4)
        if (!isValidUUIDv4(token)) {
            return c.json({ msg: 'Invalid or expired token' }, 401);
        }
        // You might want to attach the token or some decoded user info to the context
        // For now, just pass the request along if valid
        await next();
    }
    catch (err) {
        console.error('Scraper middleware error:', err.message);
        return c.json({ msg: 'Token validation failed' }, 401);
    }
};
