const GroupModel = require('../models/group.model');
const AppError = require('../utils/AppError');

class GroupController {
  static async getAll(req, res, next) {
    try {
      const groups = await GroupModel.getAll();

      // Attach departments to each group
      for (const group of groups) {
        group.departments = await GroupModel.getDepartments(group.groupId);
      }

      res.json({ success: true, groups, count: groups.length });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const group = await GroupModel.getById(req.params.id);
      if (!group) throw AppError.notFound('Group not found');

      group.departments = await GroupModel.getDepartments(group.groupId);
      res.json({ success: true, group });
    } catch (error) {
      next(error);
    }
  }

  static async create(req, res, next) {
    try {
      const { groupName, groupDescription, department_ids } = req.body;
      if (!groupName) throw AppError.badRequest('Group name is required');

      const group = await GroupModel.create({ groupName, groupDescription, department_ids });
      group.departments = await GroupModel.getDepartments(group.groupId);

      res.status(201).json({ success: true, message: 'Group created successfully', group });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const { groupName, groupDescription, department_ids } = req.body;
      const group = await GroupModel.update(req.params.id, { groupName, groupDescription, department_ids });
      if (!group) throw AppError.notFound('Group not found');

      group.departments = await GroupModel.getDepartments(group.groupId);
      res.json({ success: true, message: 'Group updated successfully', group });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const result = await GroupModel.delete(req.params.id);
      if (!result) throw AppError.notFound('Group not found');
      res.json({ success: true, message: 'Group deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = GroupController;
