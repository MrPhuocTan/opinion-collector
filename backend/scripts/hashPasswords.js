require('dotenv').config({ path: '../.env' });
const pool = require('../models/db');
const { hashPassword } = require('../utils/auth.utils');

async function updatePasswords() {
    try {
        const adminHash = await hashPassword('admin123');
        const userHash = await hashPassword('user123');
        
        await pool.query('UPDATE users SET user_pass = $1 WHERE user_name = $2', [adminHash, 'admin']);
        await pool.query('UPDATE users SET user_pass = $1 WHERE user_role = $2', [userHash, 'USER']);
        
        console.log('✅ Passwords updated successfully!');
        console.log('Admin: admin / admin123');
        console.log('Users: nguyenvana / user123, tranthib / user123');
        process.exit(0);
    } catch (error) {
        console.error('Error updating passwords:', error);
        process.exit(1);
    }
}

updatePasswords();
