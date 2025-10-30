import bcrypt from 'bcryptjs';
// Placeholder for any User-related Drizzle queries or utility functions
// For example, a function to hash password before inserting a new user:
export async function hashUserPassword(userData) {
    if (userData.password) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(userData.password, salt);
        return { ...userData, password: hashedPassword };
    }
    return userData;
}
