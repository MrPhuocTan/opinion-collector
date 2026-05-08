class Mapper {
    static mapDepartment(row) {
        if (!row) return null;
        return {
            id: row.depart_id,
            name: row.depart_name,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        };
    }

    static mapUser(row) {
        if (!row) return null;
        return {
            id: row.user_id,
            username: row.user_name,
            fullName: row.user_info,
            citizenId: row.user_cccd,
            departmentId: row.depart_id,
            departmentName: row.depart_name,
            role: row.user_role,
            phone: row.user_phone,
            totalAnswers: row.total_answers,
            lastOtp: row.user_lastotp,
            otpExpiresAt: row.otp_expires_at,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        };
    }

    static mapRequest(row) {
        if (!row) return null;
        return {
            id: row.req_id,
            title: row.req_name,
            description: row.req_des,
            createdById: row.req_cre,
            creatorName: row.creator_name,
            createdDate: row.req_date,
            volume: row.req_volume,
            isActive: row.is_active,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        };
    }

    static mapDocument(row) {
        if (!row) return null;
        return {
            id: row.doc_id,
            requestId: row.req_id,
            description: row.doc_des,
            documentDate: row.doc_date,
            documentNumber: row.doc_num,
            volume: row.doc_volume,
            pdfUrl: row.pdf_url,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        };
    }

    static mapQuestion(row) {
        if (!row) return null;
        return {
            id: row.que_id,
            documentId: row.doc_id,
            content: row.que_des,
            type: row.que_type,
            expectedAnswer: row.ques_ans,
            orderIndex: row.que_order,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        };
    }

    static mapAnswer(row) {
        if (!row) return null;
        return {
            id: row.ans_id,
            userId: row.user_id,
            username: row.user_name,
            questionId: row.que_id,
            userAnswer: row.ans_user,
            reason: row.ans_reason,
            answeredDate: row.ans_date
        };
    }
}

module.exports = Mapper;
