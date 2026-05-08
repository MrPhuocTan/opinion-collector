-- =====================================================
-- 1. ADD MISSING COLUMN is_active TO users TABLE
-- =====================================================
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- =====================================================
-- 2. CREATE REQUEST_ASSIGNMENT TABLE (MISSING)
-- =====================================================
CREATE TABLE IF NOT EXISTS request_assignment (
    assignment_id SERIAL PRIMARY KEY,
    req_id INT REFERENCES request(req_id) ON DELETE CASCADE,
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(req_id, user_id)
);

-- Create index for request_assignment
CREATE INDEX IF NOT EXISTS idx_assignment_request ON request_assignment(req_id);
CREATE INDEX IF NOT EXISTS idx_assignment_user ON request_assignment(user_id);

-- =====================================================
-- 3. CREATE VIEWS FOR DASHBOARD
-- =====================================================

-- Dashboard overview statistics view
CREATE OR REPLACE VIEW dashboard_stats AS
SELECT 
    (SELECT COUNT(*) FROM users WHERE user_role = 'USER' AND is_active = true) as total_users,
    (SELECT COUNT(*) FROM request WHERE is_active = true) as total_requests,
    (SELECT COUNT(*) FROM document) as total_documents,
    (SELECT COUNT(*) FROM question) as total_questions,
    (SELECT COUNT(*) FROM user_answer) as total_answers,
    (SELECT COUNT(DISTINCT user_id) FROM user_answer) as users_participated;

-- Department statistics view
CREATE OR REPLACE VIEW department_statistics AS
SELECT 
    d.depart_id,
    d.depart_name,
    COUNT(DISTINCT u.user_id) as user_count,
    COUNT(DISTINCT ua.ans_id) as total_answers,
    COUNT(DISTINCT CASE WHEN ua.ans_user = 'YES' THEN ua.ans_id END) as yes_answers,
    COUNT(DISTINCT CASE WHEN ua.ans_user = 'NO' THEN ua.ans_id END) as no_answers
FROM department d
LEFT JOIN users u ON d.depart_id = u.depart_id
LEFT JOIN user_answer ua ON u.user_id = ua.user_id
GROUP BY d.depart_id, d.depart_name;

-- Request completion status view
CREATE OR REPLACE VIEW request_completion_status AS
SELECT 
    r.req_id,
    r.req_name,
    COUNT(DISTINCT q.que_id) as total_questions,
    COUNT(DISTINCT ua.ans_id) as total_answers,
    COUNT(DISTINCT ua.user_id) as users_responded,
    CASE 
        WHEN COUNT(DISTINCT q.que_id) > 0 
        THEN ROUND(100.0 * COUNT(DISTINCT ua.ans_id) / COUNT(DISTINCT q.que_id), 2)
        ELSE 0 
    END as completion_percentage
FROM request r
LEFT JOIN document d ON r.req_id = d.req_id
LEFT JOIN question q ON d.doc_id = q.doc_id
LEFT JOIN user_answer ua ON q.que_id = ua.que_id
WHERE r.is_active = true
GROUP BY r.req_id, r.req_name;

-- Recent activity view
CREATE OR REPLACE VIEW recent_activity AS
SELECT 
    DATE(ua.ans_date) as activity_date,
    COUNT(DISTINCT ua.user_id) as active_users,
    COUNT(ua.ans_id) as answers_submitted,
    COUNT(DISTINCT q.doc_id) as documents_answered,
    COUNT(DISTINCT d.req_id) as requests_participated
FROM user_answer ua
JOIN question q ON ua.que_id = q.que_id
JOIN document d ON q.doc_id = d.doc_id
WHERE ua.ans_date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(ua.ans_date)
ORDER BY activity_date DESC;

-- =====================================================
-- 4. CREATE MATERIALIZED VIEW FOR PERFORMANCE
-- =====================================================

-- Materialized view for department-request statistics (for better performance)
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_department_request_stats AS
SELECT 
    r.req_id,
    r.req_name,
    d.depart_id,
    d.depart_name,
    q.que_id,
    q.que_des,
    q.que_type,
    COUNT(CASE WHEN ua.ans_user = 'YES' THEN 1 END) as yes_count,
    COUNT(CASE WHEN ua.ans_user = 'NO' THEN 1 END) as no_count,
    COUNT(ua.ans_id) as total_answers,
    ROUND(100.0 * COUNT(CASE WHEN ua.ans_user = 'YES' THEN 1 END) / NULLIF(COUNT(ua.ans_id), 0), 2) as yes_percentage
FROM request r
CROSS JOIN department d
LEFT JOIN document doc ON r.req_id = doc.req_id
LEFT JOIN question q ON doc.doc_id = q.doc_id
LEFT JOIN users u ON d.depart_id = u.depart_id
LEFT JOIN user_answer ua ON u.user_id = ua.user_id AND q.que_id = ua.que_id
WHERE r.is_active = true AND q.que_type = 'BOOLEAN'
GROUP BY r.req_id, r.req_name, d.depart_id, d.depart_name, q.que_id, q.que_des, q.que_type;

-- Create index on materialized view
CREATE INDEX IF NOT EXISTS idx_mv_dept_stats_request ON mv_department_request_stats(req_id);
CREATE INDEX IF NOT EXISTS idx_mv_dept_stats_department ON mv_department_request_stats(depart_id);

-- =====================================================
-- 5. CREATE FUNCTION TO REFRESH MATERIALIZED VIEW
-- =====================================================
CREATE OR REPLACE FUNCTION refresh_department_stats()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_department_request_stats;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 6. ADD MISSING INDEXES FOR BETTER PERFORMANCE
-- =====================================================

-- Index for faster login
CREATE INDEX IF NOT EXISTS idx_users_username ON users(user_name);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(user_phone);

-- Index for request queries
CREATE INDEX IF NOT EXISTS idx_request_active ON request(is_active);
CREATE INDEX IF NOT EXISTS idx_request_creator ON request(req_cre);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_user_answer_composite ON user_answer(user_id, que_id);
CREATE INDEX IF NOT EXISTS idx_question_doc_order ON question(doc_id, que_order);

-- =====================================================
-- 7. CREATE TRIGGERS FOR DATA CONSISTENCY
-- =====================================================

-- Update req_volume when documents are added/removed
CREATE OR REPLACE FUNCTION update_request_volume()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'DELETE' THEN
        UPDATE request 
        SET req_volume = (
            SELECT COUNT(*) 
            FROM document 
            WHERE req_id = COALESCE(NEW.req_id, OLD.req_id)
        )
        WHERE req_id = COALESCE(NEW.req_id, OLD.req_id);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_request_volume ON document;
CREATE TRIGGER trigger_update_request_volume
AFTER INSERT OR DELETE ON document
FOR EACH ROW EXECUTE FUNCTION update_request_volume();

-- Update doc_volume when questions are added/removed
CREATE OR REPLACE FUNCTION update_document_volume()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'DELETE' THEN
        UPDATE document 
        SET doc_volume = (
            SELECT COUNT(*) 
            FROM question 
            WHERE doc_id = COALESCE(NEW.doc_id, OLD.doc_id)
        )
        WHERE doc_id = COALESCE(NEW.doc_id, OLD.doc_id);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_document_volume ON question;
CREATE TRIGGER trigger_update_document_volume
AFTER INSERT OR DELETE ON question
FOR EACH ROW EXECUTE FUNCTION update_document_volume();

-- =====================================================
-- 8. GRANT PERMISSIONS
-- =====================================================
GRANT ALL ON ALL TABLES IN SCHEMA public TO ocs_user;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO ocs_user;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO ocs_user;

-- =====================================================
-- 9. VERIFY INSTALLATION
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE 'Database update completed successfully!';
    RAISE NOTICE 'Tables created: request_assignment';
    RAISE NOTICE 'Views created: dashboard_stats, department_statistics, request_completion_status, recent_activity';
    RAISE NOTICE 'Materialized view created: mv_department_request_stats';
    RAISE NOTICE 'New indexes and triggers added for performance optimization';
END $$;
