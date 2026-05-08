const pool = require('./db');

class GroupModel {
  static async getAll() {
    const query = `
      SELECT g.group_id AS "groupId",
             g.group_name AS "groupName",
             g.group_description AS "groupDescription",
             g.created_at AS "createdAt",
             g.updated_at AS "updatedAt",
             COALESCE(rc.cnt, 0)::int AS "request_count"
      FROM audience_group g
      LEFT JOIN (
        SELECT group_id, COUNT(*) AS cnt
        FROM request_group
        GROUP BY group_id
      ) rc ON g.group_id = rc.group_id
      ORDER BY g.group_id DESC
    `;
    // request_group may not exist yet, so handle gracefully
    try {
      const result = await pool.query(query);
      return result.rows;
    } catch (err) {
      // Fallback without request_count if request_group table doesn't exist
      const fallback = `
        SELECT group_id AS "groupId",
               group_name AS "groupName",
               group_description AS "groupDescription",
               created_at AS "createdAt",
               updated_at AS "updatedAt",
               0 AS "request_count"
        FROM audience_group
        ORDER BY group_id DESC
      `;
      const result = await pool.query(fallback);
      return result.rows;
    }
  }

  static async getById(groupId) {
    const query = `
      SELECT group_id AS "groupId",
             group_name AS "groupName",
             group_description AS "groupDescription",
             created_at AS "createdAt",
             updated_at AS "updatedAt"
      FROM audience_group WHERE group_id = $1
    `;
    const result = await pool.query(query, [groupId]);
    return result.rows[0];
  }

  static async getDepartments(groupId) {
    const query = `
      SELECT d.depart_id AS "departmentId",
             d.depart_name AS "name"
      FROM group_department gd
      JOIN department d ON gd.depart_id = d.depart_id
      WHERE gd.group_id = $1
      ORDER BY d.depart_name
    `;
    const result = await pool.query(query, [groupId]);
    return result.rows;
  }

  static async create(data) {
    const { groupName, groupDescription, department_ids } = data;
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const insertGroup = `
        INSERT INTO audience_group (group_name, group_description)
        VALUES ($1, $2)
        RETURNING group_id AS "groupId", group_name AS "groupName",
                  group_description AS "groupDescription"
      `;
      const groupResult = await client.query(insertGroup, [groupName, groupDescription]);
      const group = groupResult.rows[0];

      if (department_ids && department_ids.length > 0) {
        for (const deptId of department_ids) {
          await client.query(
            'INSERT INTO group_department (group_id, depart_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [group.groupId, deptId]
          );
        }
      }

      await client.query('COMMIT');
      return group;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async update(groupId, data) {
    const { groupName, groupDescription, department_ids } = data;
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const updateGroup = `
        UPDATE audience_group
        SET group_name = $1, group_description = $2, updated_at = CURRENT_TIMESTAMP
        WHERE group_id = $3
        RETURNING group_id AS "groupId", group_name AS "groupName",
                  group_description AS "groupDescription"
      `;
      const result = await client.query(updateGroup, [groupName, groupDescription, groupId]);
      if (!result.rows[0]) {
        await client.query('ROLLBACK');
        return null;
      }

      // Replace department associations
      await client.query('DELETE FROM group_department WHERE group_id = $1', [groupId]);
      if (department_ids && department_ids.length > 0) {
        for (const deptId of department_ids) {
          await client.query(
            'INSERT INTO group_department (group_id, depart_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [groupId, deptId]
          );
        }
      }

      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async delete(groupId) {
    const query = 'DELETE FROM audience_group WHERE group_id = $1 RETURNING group_id';
    const result = await pool.query(query, [groupId]);
    return result.rows[0];
  }
}

module.exports = GroupModel;
