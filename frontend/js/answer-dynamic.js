// Dynamic answer fields management
class DynamicAnswerManager {
    constructor() {
        this.answerData = {};
        this.opinionCounts = {};
        this.existingCounts = {};
    }
    // Thêm method mới cho TEXT type
    updateTextAnswer(questionId, value) {
        if (!this.answerData[questionId]) {
            this.answerData[questionId] = [];
        }
        
    // TEXT chỉ có 1 answer duy nhất
        this.answerData[questionId] = [{
            index: 1,
            ans_user: value
        }];
}

    initQuestion(questionId, questionType, existingAnswers = []) {
        if (!this.answerData[questionId]) {
            this.answerData[questionId] = [];
        }
        if (questionType === 'TEXT') {
        // TEXT chỉ lưu 1 answer
        this.answerData[questionId] = existingAnswers.length > 0 
            ? [{index: 1, ans_user: existingAnswers[0].ans_user || ''}]
            : [];
        // Không render fields cho TEXT vì đã có textarea cố định trong HTML
        return;
        } else if (questionType === 'NUMBER') {
            // NUMBER luôn có 1 answer duy nhất
            if (existingAnswers.length > 0) {
                this.answerData[questionId] = [{
                    index: 1, 
                    ans_user: existingAnswers[0].ans_user || ''
                }];
            } else {
                // Kiểm tra xem có giá trị trong DOM không (trường hợp reload)
                const numberInput = document.getElementById(`answer_${questionId}_1`);
                if (numberInput && numberInput.value) {
                    this.answerData[questionId] = [{
                        index: 1,
                        ans_user: numberInput.value
                    }];
                } else {
                    this.answerData[questionId] = [{index: 1, ans_user: ''}];
                }
            }
        } else {
            // BOOLEAN
            const filteredAnswers = questionType === 'BOOLEAN' 
                ? existingAnswers.filter(ans => ans.ans_user !== 'YES' && ans.ans_user !== 'NO')
                : existingAnswers;

            // loại bỏ nếu ans_user là number
            const nonNumberAnswers = filteredAnswers.filter(ans => isNaN(ans.ans_user));

            this.existingCounts[questionId] = nonNumberAnswers.length;
            this.opinionCounts[questionId] = nonNumberAnswers.length;

            if (nonNumberAnswers.length > 0) {
                this.answerData[questionId] = nonNumberAnswers.map((ans, idx) => ({
                    index: idx + 1,
                    ans_user: ans.ans_user || ''
                }));
            } else {
                this.answerData[questionId] = [];
            }
        }

        this.renderAnswerFields(questionId, questionType);
    }

    updateOpinionCount(questionId, newCount) {
        const questionType = document.querySelector(`[data-question-id="${questionId}"]`).dataset.questionType;
        
        // Validate không cho giảm dưới số existing
        if (newCount < this.existingCounts[questionId]) {
            alert(`Không thể giảm số lượng ý kiến xuống dưới ${this.existingCounts[questionId]}`);
            document.getElementById(`opinion_count_${questionId}`).value = this.opinionCounts[questionId];
            return;
        }

        const currentLength = this.answerData[questionId].length;

        // Nếu giảm số lượng
        if (newCount < currentLength) {
            // Kiểm tra các ô sẽ bị xóa (từ vị trí newCount đến cuối)
            for (let i = newCount; i < currentLength; i++) {
                const textarea = document.getElementById(`answer_${questionId}_${this.answerData[questionId][i].index}`);
                if (textarea && textarea.value.trim() !== '') {
                    alert(`Không thể giảm số lượng vì ý kiến số ${this.answerData[questionId][i].index} đã có nội dung. Vui lòng xóa nội dung trước.`);
                    document.getElementById(`opinion_count_${questionId}`).value = currentLength;
                    return;
                }
            }
            
            // Nếu không có text, cho phép xóa
            this.answerData[questionId] = this.answerData[questionId].slice(0, newCount);
        } 
        // Nếu tăng số lượng
        else if (newCount > currentLength) {
            // Lưu text hiện tại trước
            this.answerData[questionId].forEach(answer => {
                const textarea = document.getElementById(`answer_${questionId}_${answer.index}`);
                if (textarea) {
                    answer.ans_user = textarea.value;
                }
            });
            
            // Thêm field mới
            for (let i = currentLength + 1; i <= newCount; i++) {
                this.answerData[questionId].push({
                    index: i,
                    ans_user: ''
                });
            }
        }

        this.opinionCounts[questionId] = newCount;
        this.renderAnswerFields(questionId, questionType);
    }

    removeAnswer(questionId, answerIndex, questionType) {
        this.answerData[questionId].splice(answerIndex - 1, 1);
        this.answerData[questionId] = this.answerData[questionId].map((ans, idx) => ({
            ...ans,
            index: idx + 1
        }));
        this.opinionCounts[questionId] = this.answerData[questionId].length;
        document.getElementById(`opinion_count_${questionId}`).value = this.opinionCounts[questionId];
        this.renderAnswerFields(questionId, questionType);
    }

    updateAnswerValue(questionId, answerIndex, value) {
        const answer = this.answerData[questionId].find(a => a.index === answerIndex);
        if (answer) {
            answer.ans_user = value;
        }
    }

    renderAnswerFields(questionId, questionType) {
        const container = document.getElementById(`answers_container_${questionId}`);
        if (!container) return;

        const answers = this.answerData[questionId] || [];

        if (questionType === 'BOOLEAN' || questionType === 'TEXT') {
            if (answers.length === 0) {
                container.innerHTML = '<p style="color: #999; font-style: italic;">Nhập số lượng ý kiến để thêm</p>';
                return;
            }

            container.innerHTML = answers.map((answer, idx) => `
                <div class="answer-field-group" data-answer-index="${answer.index}">
                    <div class="d-flex align-center gap-2">
                        <span class="answer-number">${answer.index}.</span>
                        <textarea class="form-control answer-input"
                            id="answer_${questionId}_${answer.index}"
                            placeholder="Nhập ý kiến ${answer.index}..."
                            rows="3"
                            style="width: 100%; resize: vertical;"
                            onchange="answerManager.updateAnswerValue(${questionId}, ${answer.index}, this.value)"
                        >${answer.ans_user || ''}</textarea>
                        ${answers.length > 1 ? `
                            <button class="btn btn-sm btn-danger" 
                                onclick="answerManager.removeAnswer(${questionId}, ${answer.index}, '${questionType}')"
                                style="align-self: flex-start; margin-top: 0;">
                                <i class="fas fa-times"></i>
                            </button>
                        ` : ''}
                    </div>
                </div>
            `).join('');
        } else if (questionType === 'NUMBER') {
            const answer = answers[0] || { index: 1, ans_user: '' };
            container.innerHTML = `
                <div class="answer-field-group">
                    <input type="number" 
                        id="answer_${questionId}_1"
                        class="form-control answer-input"
                        min="0"
                        placeholder="Nhập số..."
                        value="${answer.ans_user || ''}"
                        onchange="answerManager.updateAnswerValue(${questionId}, 1, this.value)">
                </div>
            `;
        }
    }

    collectAllAnswers() {
        const collectedAnswers = [];

        for (const [questionId, answers] of Object.entries(this.answerData)) {
            const question = document.querySelector(`[data-question-id="${questionId}"]`);
            const questionType = question ? question.dataset.questionType : null;

        if (questionType === 'BOOLEAN') {
            const textValue = document.querySelector(`#answer_text_${questionId}`)?.value;
            if (textValue && textValue.trim()) {
                const validOpinions = answers.filter(a => a.ans_user && a.ans_user.trim());
                const allAnswers = [
                    { ans_user: textValue.trim(), ans_reason: null },
                    ...validOpinions.map(op => ({
                        ans_user: op.ans_user.trim(),
                        ans_reason: null
                    }))
                ];
                collectedAnswers.push({
                    queId: parseInt(questionId),
                    answers: allAnswers
                });
            }
        } else if (questionType === 'NUMBER') {
                // Kiểm tra cả trong answerData và DOM
                if (answers.length > 0 && answers[0].ans_user) {
                    collectedAnswers.push({
                        queId: parseInt(questionId),
                        answers: [{
                            ans_user: answers[0].ans_user.toString(),
                            ans_reason: null
                        }]
                    });
                } else {
                    // Fallback: đọc từ DOM
                    const numberInput = document.getElementById(`answer_${questionId}_1`);
                    if (numberInput && numberInput.value) {
                        collectedAnswers.push({
                            queId: parseInt(questionId),
                            answers: [{
                                ans_user: numberInput.value,
                                ans_reason: null
                            }]
                        });
                    }
                }
            } else if (questionType === 'TEXT') {
             // Thu thập answer từ textarea
                const textArea = document.getElementById(`answer_text_${questionId}`);
                if (textArea && textArea.value.trim()) {
                collectedAnswers.push({
                queId: parseInt(questionId),
                answers: [{
                ans_user: textArea.value.trim(),
                ans_reason: null
                }]
            });
        }
    }
        }

        return collectedAnswers;
    }

    loadExistingAnswers(answersData, opinionCounts = {}) {
        answersData.forEach(questionData => {
            // Xử lý riêng cho từng loại câu hỏi
            if (questionData.queType === 'NUMBER') {
                // NUMBER - lưu trực tiếp
                this.answerData[questionData.queId] = questionData.answers.length > 0
                    ? [{
                        index: 1,
                        ans_user: questionData.answers[0].ans_user || ''
                    }]
                    : [];
            } else {
                const filteredAnswers = questionData.queType === 'BOOLEAN'
                    ? questionData.answers.filter(ans =>
                        ans.ans_user !== 'YES' &&
                        ans.ans_user !== 'NO' &&
                        isNaN(ans.ans_user)
                    )
                    : questionData.answers.filter(ans =>
                        ans.ans_user !== 'YES' && ans.ans_user !== 'NO'
                    );

                this.existingCounts[questionData.queId] = filteredAnswers.length;
                this.opinionCounts[questionData.queId] = filteredAnswers.length;

                if (filteredAnswers.length > 0) {
                    this.answerData[questionData.queId] = filteredAnswers.map((ans, idx) => ({
                        index: idx + 1,
                        ans_user: ans.ans_user || ''
                    }));
                } else {
                    this.answerData[questionData.queId] = [];
                }
            }
        });
    }
}

// Khởi tạo global instance
const answerManager = new DynamicAnswerManager();
