const DepartmentModel = require('../models/department.model');
const AppError = require('../utils/AppError');

class DepartmentController {
  static async getAll(req, res, next) {
    try {
      const departments = await DepartmentModel.getAll();
      res.json({ success: true, departments, count: departments.length });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const department = await DepartmentModel.getById(req.params.id);
      if (!department) throw AppError.notFound('Department not found');
      res.json({ success: true, department });
    } catch (error) {
      next(error);
    }
  }

  static async create(req, res, next) {
    try {
      const name = req.body.name;
      if (!name) throw AppError.badRequest('Department name is required');
      const department = await DepartmentModel.create(name);
      res.status(201).json({ success: true, department });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const name = req.body.name;
      if (!name) throw AppError.badRequest('Department name is required');
      const department = await DepartmentModel.update(req.params.id, name);
      if (!department) throw AppError.notFound('Department not found');
      res.json({ success: true, department });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const result = await DepartmentModel.delete(req.params.id);
      if (!result) throw AppError.notFound('Department not found');
      res.json({ success: true, message: 'Department deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = DepartmentController;
