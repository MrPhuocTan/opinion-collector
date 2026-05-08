const DepartmentModel = require('../models/department.model');

class DepartmentController {
    static async getAll(req, res) {
        try {
            const departments = await DepartmentModel.getAll();
            res.json({ success: true, departments: departments.map(Mapper.mapDepartment), count: departments.length });
        } catch (error) {
            console.error('Get departments error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
    
    static async getById(req, res) {
        try {
            const department = await DepartmentModel.getById(req.params.id);
            if (!department) return res.status(404).json({ error: 'Department not found' });
            res.json({ success: true, department: Mapper.mapDepartment(department) });
        } catch (error) {
            console.error('Get department error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
    
    static async create(req, res) {
        try {
            const depart_name = req.body.name || req.body.depart_name;
            if (!depart_name) return res.status(400).json({ error: 'Department name is required' });
            const department = await DepartmentModel.create(depart_name);
            res.status(201).json({ success: true, department: Mapper.mapDepartment(department) });
        } catch (error) {
            console.error('Create department error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
    
    static async update(req, res) {
        try {
            const depart_name = req.body.name || req.body.depart_name;
            if (!depart_name) return res.status(400).json({ error: 'Department name is required' });
            const department = await DepartmentModel.update(req.params.id, depart_name);
            if (!department) return res.status(404).json({ error: 'Department not found' });
            res.json({ success: true, department: Mapper.mapDepartment(department) });
        } catch (error) {
            console.error('Update department error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
    
    static async delete(req, res) {
        try {
            const result = await DepartmentModel.delete(req.params.id);
            if (!result) return res.status(404).json({ error: 'Department not found or in use' });
            res.json({ success: true, message: 'Department deleted successfully' });
        } catch (error) {
            console.error('Delete department error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}

module.exports = DepartmentController;
