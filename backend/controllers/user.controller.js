const UserModel = require('../models/user.model');
const { hashPassword } = require('../utils/auth.utils');
const AppError = require('../utils/AppError');

class UserController {
  static async getAll(req, res, next) {
    try {
      const users = await UserModel.getAll();
      res.json({ success: true, users, count: users.length });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const user = await UserModel.findById(req.params.id);
      if (!user) throw AppError.notFound('User not found');
      const { userPass, ...safeUser } = user;
      res.json({ success: true, user: safeUser });
    } catch (error) {
      next(error);
    }
  }

  static async create(req, res, next) {
    try {
      const { username, password, fullName, phone, citizenId, departmentId, role } = req.body;
      if (!username || !password) throw AppError.badRequest('Username and password are required');

      // Check duplicate
      const existing = await UserModel.findByUsername(username);
      if (existing) throw AppError.conflict('Username already exists');

      const hashedPassword = await hashPassword(password);
      const user = await UserModel.create({
        username,
        password: hashedPassword,
        userInfo: fullName,
        phone,
        citizenId,
        departmentId,
        role,
      });

      res.status(201).json({ success: true, message: 'User created successfully', user });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const { fullName, phone, citizenId, departmentId, role } = req.body;
      const user = await UserModel.update(req.params.id, {
        userInfo: fullName,
        phone,
        citizenId,
        departmentId,
        role,
      });
      if (!user) throw AppError.notFound('User not found');
      res.json({ success: true, message: 'User updated successfully', user });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const result = await UserModel.deactivate(req.params.id);
      if (!result) throw AppError.notFound('User not found');
      res.json({ success: true, message: 'User deactivated successfully' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = UserController;
