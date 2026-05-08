-- =====================================================
-- Audience Groups (Nhóm Đối tượng lấy ý kiến)
-- =====================================================

CREATE TABLE IF NOT EXISTS audience_group (
    group_id SERIAL PRIMARY KEY,
    group_name VARCHAR(255) NOT NULL,
    group_description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS group_department (
    id SERIAL PRIMARY KEY,
    group_id INTEGER REFERENCES audience_group(group_id) ON DELETE CASCADE,
    depart_id INTEGER REFERENCES department(depart_id) ON DELETE CASCADE,
    UNIQUE(group_id, depart_id)
);

-- Trigger for updated_at
CREATE TRIGGER update_audience_group_updated_at BEFORE UPDATE ON audience_group
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
