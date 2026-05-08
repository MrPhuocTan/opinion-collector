-- Seed Departments
INSERT INTO department (depart_name) VALUES
    ('Phòng Kế hoạch'),
    ('Phòng Nhân sự'),
    ('Phòng IT'),
    ('Phòng Tài chính'),
    ('Ban Giám đốc');

-- Seed Admin User (password will be hashed later)
INSERT INTO users (user_name, user_pass, user_info, user_cccd, depart_id, user_role, user_phone) VALUES
    ('admin', 'temp_admin123', 'Administrator', '000000000001', 5, 'ADMIN', '0901234567');

-- Seed Test Users
INSERT INTO users (user_name, user_pass, user_info, user_cccd, depart_id, user_role, user_phone) VALUES
    ('nguyenvana', 'temp_user123', 'Nguyễn Văn A', '079123456789', 1, 'USER', '0901234568'),
    ('tranthib', 'temp_user123', 'Trần Thị B', '079123456790', 2, 'USER', '0901234569');

-- Seed Sample Request
INSERT INTO request (req_name, req_des, req_cre, req_volume) VALUES
    ('Khảo sát Q1/2024', 'Khảo sát ý kiến về các văn bản quý 1 năm 2024', 1, 2);

-- Seed Sample Documents
INSERT INTO document (req_id, doc_des, doc_num, doc_volume, pdf_url) VALUES
    (1, 'Quy định về chế độ làm việc từ xa', 'QD-2024-001', 3, '/uploads/qd-2024-001.pdf'),
    (1, 'Thông báo về việc điều chỉnh lương', 'TB-2024-002', 2, '/uploads/tb-2024-002.pdf');

-- Seed Sample Questions
INSERT INTO question (doc_id, que_des, que_type, ques_ans, que_order) VALUES
    (1, 'Bạn có đồng ý với quy định làm việc từ xa mới?', 'BOOLEAN', 'YES', 1),
    (1, 'Số ngày làm việc từ xa phù hợp theo bạn là bao nhiêu?', 'TEXT', '2-3 ngày/tuần', 2),
    (1, 'Bạn có gặp khó khăn gì khi làm việc từ xa?', 'TEXT', NULL, 3),
    (2, 'Bạn có hài lòng với mức điều chỉnh lương?', 'BOOLEAN', NULL, 1),
    (2, 'Đề xuất của bạn về chính sách lương?', 'TEXT', NULL, 2);
