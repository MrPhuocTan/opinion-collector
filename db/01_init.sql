-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Department table
CREATE TABLE IF NOT EXISTS department (
    depart_id SERIAL PRIMARY KEY,
    depart_name VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Users table
CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    user_name VARCHAR(100) NOT NULL UNIQUE,
    user_pass VARCHAR(255) NOT NULL,
    user_info VARCHAR(255),
    user_cccd VARCHAR(20),
    depart_id INTEGER REFERENCES department(depart_id),
    user_role VARCHAR(10) CHECK (user_role IN ('ADMIN', 'USER')) DEFAULT 'USER',
    user_phone VARCHAR(20),
    user_lastotp VARCHAR(6),
    otp_expires_at TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Request table
CREATE TABLE IF NOT EXISTS request (
    req_id SERIAL PRIMARY KEY,
    req_name VARCHAR(255) NOT NULL,
    req_des TEXT,
    req_cre INTEGER REFERENCES users(user_id),
    req_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    req_volume INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Document table
CREATE TABLE IF NOT EXISTS document (
    doc_id SERIAL PRIMARY KEY,
    req_id INTEGER REFERENCES request(req_id) ON DELETE CASCADE,
    doc_des TEXT,
    doc_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    doc_num VARCHAR(100),
    doc_volume INTEGER DEFAULT 0,
    pdf_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Question table
CREATE TABLE IF NOT EXISTS question (
    que_id SERIAL PRIMARY KEY,
    doc_id INTEGER REFERENCES document(doc_id) ON DELETE CASCADE,
    que_des TEXT NOT NULL,
    que_type VARCHAR(10) CHECK (que_type IN ('BOOLEAN', 'TEXT')) DEFAULT 'BOOLEAN',
    ques_ans TEXT,
    que_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. User_Answer table
CREATE TABLE IF NOT EXISTS user_answer (
    ans_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id),
    que_id INTEGER REFERENCES question(que_id),
    ans_user TEXT,
    ans_reason TEXT,
    ans_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, que_id)
);

-- 7. Request_Assignment table
CREATE TABLE IF NOT EXISTS request_assignment (
    assignment_id SERIAL PRIMARY KEY,
    req_id INTEGER REFERENCES request(req_id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(req_id, user_id)
);

-- Create indexes
CREATE INDEX idx_user_depart ON users(depart_id);
CREATE INDEX idx_doc_request ON document(req_id);
CREATE INDEX idx_que_document ON question(doc_id);
CREATE INDEX idx_answer_user ON user_answer(user_id);
CREATE INDEX idx_answer_question ON user_answer(que_id);

-- Update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers
CREATE TRIGGER update_department_updated_at BEFORE UPDATE ON department
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_request_updated_at BEFORE UPDATE ON request
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_document_updated_at BEFORE UPDATE ON document
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_question_updated_at BEFORE UPDATE ON question
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
