const pool = require('../models/db');
const UserModel = require('../models/user.model');
const { hashPassword, comparePassword, generateToken, generateOTP } = require('../utils/auth.utils');
const Mapper = require('../utils/mapper');

class AuthController {
    static async login(req, res) {
        try {
            const { username, password } = req.body;
            if (!username || !password) return res.status(400).json({ error: 'Username and password are required' });
            
            const user = await UserModel.findByUsername(username);
            if (!user) return res.status(401).json({ error: 'Invalid username or password' });
            
            const isValidPass = await comparePassword(password, user.user_pass);
            if (!isValidPass) return res.status(401).json({ error: 'Invalid username or password' });
            
            const token = generateToken(user.user_id, user.user_role);
            
            res.json({ message: 'Login successful', token, user: Mapper.mapUser(user) });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
    
    static async register(req, res) {
        try {
            const { username, password, fullName, phone, departmentId } = req.body;
            if (!username || !password || !fullName || !phone) return res.status(400).json({ error: 'Required fields missing' });
            
            const hashedPassword = await hashPassword(password);
            const newUser = await UserModel.create({
                user_name: username,
                user_pass: hashedPassword,
                user_info: fullName,
                user_phone: phone,
                depart_id: departmentId
            });
            
            const token = generateToken(newUser.user_id, newUser.user_role);
            res.status(201).json({ message: 'Registration successful', token, user: Mapper.mapUser(newUser) });
        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
    
    static async requestOTP(req, res) {
        try {
            const { phone } = req.body;
            if (!phone) return res.status(400).json({ error: 'Phone number is required' });
            
            const otp = generateOTP();
            await pool.query(
                'UPDATE users SET user_lastotp = $1, otp_expires_at = CURRENT_TIMESTAMP + INTERVAL \'5 minutes\' WHERE user_phone = $2',
                [otp, phone]
            );
            
            res.json({ message: 'OTP sent successfully', otp: process.env.NODE_ENV === 'development' ? otp : undefined, expires_in: '5 minutes' });
        } catch (error) {
            console.error('OTP request error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
    
    static async resetPassword(req, res) {
        try {
            const { phone, otp, newPassword } = req.body;
            if (!phone || !otp || !newPassword) return res.status(400).json({ error: 'Phone, OTP and new password are required' });
            
            const query = `
                SELECT user_id FROM users 
                WHERE user_phone = $1 AND user_lastotp = $2 
                AND otp_expires_at > CURRENT_TIMESTAMP
            `;
            const result = await pool.query(query, [phone, otp]);
            if (!result.rows[0]) return res.status(401).json({ error: 'Invalid or expired OTP' });
            
            const hashedPassword = await hashPassword(newPassword);
            await pool.query(
                'UPDATE users SET user_pass = $1, user_lastotp = NULL, otp_expires_at = NULL WHERE user_id = $2',
                [hashedPassword, result.rows[0].user_id]
            );
            
            res.json({ message: 'Password reset successful' });
        } catch (error) {
            console.error('Password reset error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
    
    static async getProfile(req, res) {
        try {
            const user = await UserModel.findById(req.user.userId);
            if (!user) return res.status(404).json({ error: 'User not found' });
            
            res.json({ user: Mapper.mapUser(user) });
        } catch (error) {
            console.error('Get profile error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}

module.exports = AuthController;
