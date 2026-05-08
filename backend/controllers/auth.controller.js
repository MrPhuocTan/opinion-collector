const UserModel = require('../models/user.model');
const { hashPassword, comparePassword, generateToken, generateOTP } = require('../utils/auth.utils');
const AppError = require('../utils/AppError');
const pool = require('../models/db');

class AuthController {
  static async login(req, res, next) {
    try {
      const { username, password } = req.body;
      if (!username || !password) throw AppError.badRequest('Username and password are required');

      const user = await UserModel.findByUsername(username);
      if (!user) throw AppError.unauthorized('Invalid username or password');

      const isValid = await comparePassword(password, user.userPass);
      if (!isValid) throw AppError.unauthorized('Invalid username or password');

      const token = generateToken(user.userId, user.role);
      // Remove password from response
      const { userPass, ...safeUser } = user;

      res.json({ success: true, message: 'Login successful', token, user: safeUser });
    } catch (error) {
      next(error);
    }
  }

  static async register(req, res, next) {
    try {
      const { username, password, fullName, phone, departmentId } = req.body;
      if (!username || !password || !fullName || !phone) {
        throw AppError.badRequest('Required fields: username, password, fullName, phone');
      }

      const hashedPassword = await hashPassword(password);
      const newUser = await UserModel.create({
        username,
        password: hashedPassword,
        userInfo: fullName,
        phone,
        departmentId,
      });

      const token = generateToken(newUser.userId, newUser.role);
      res.status(201).json({ success: true, message: 'Registration successful', token, user: newUser });
    } catch (error) {
      next(error);
    }
  }

  static async requestOTP(req, res, next) {
    try {
      const { phone } = req.body;
      if (!phone) throw AppError.badRequest('Phone number is required');

      const otp = generateOTP();
      await pool.query(
        "UPDATE users SET user_lastotp = $1, otp_expires_at = CURRENT_TIMESTAMP + INTERVAL '5 minutes' WHERE user_phone = $2",
        [otp, phone]
      );

      const response = { success: true, message: 'OTP sent successfully', expires_in: '5 minutes' };
      if (process.env.NODE_ENV === 'development') response.otp = otp;
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  static async resetPassword(req, res, next) {
    try {
      const { phone, otp, newPassword } = req.body;
      if (!phone || !otp || !newPassword) throw AppError.badRequest('Phone, OTP and new password are required');

      const result = await pool.query(
        'SELECT user_id FROM users WHERE user_phone = $1 AND user_lastotp = $2 AND otp_expires_at > CURRENT_TIMESTAMP',
        [phone, otp]
      );
      if (!result.rows[0]) throw AppError.unauthorized('Invalid or expired OTP');

      const hashedPassword = await hashPassword(newPassword);
      await pool.query(
        'UPDATE users SET user_pass = $1, user_lastotp = NULL, otp_expires_at = NULL WHERE user_id = $2',
        [hashedPassword, result.rows[0].user_id]
      );

      res.json({ success: true, message: 'Password reset successful' });
    } catch (error) {
      next(error);
    }
  }

  static async getProfile(req, res, next) {
    try {
      const user = await UserModel.findById(req.user.userId);
      if (!user) throw AppError.notFound('User not found');

      const { userPass, ...safeUser } = user;
      res.json({ success: true, user: safeUser });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AuthController;
