const fs = require('fs');
const path = require('path');

const directory = './true_frontend';

const mappings = {
    // User
    'user_id': 'userId',
    'user_name': 'username',
    'user_info': 'userInfo',
    'user_cccd': 'cccd',
    'depart_id': 'departmentId',
    'user_role': 'role',
    'user_phone': 'phone',
    
    // Request
    'req_id': 'reqId',
    'req_name': 'reqName',
    'req_des': 'reqDes',
    'req_cre': 'createdBy',
    'req_volume': 'reqVolume',
    'req_date': 'reqDate',
    'is_locked': 'isLocked',
    'document_count': 'documentCount',
    
    // Document
    'doc_id': 'docId',
    'doc_des': 'docDes',
    'doc_num': 'docNum',
    'doc_volume': 'docVolume',
    'pdf_url': 'pdfUrl',
    
    // Question
    'que_id': 'queId',
    'que_des': 'queDes',
    'que_type': 'queType',
    'ques_ans': 'quesAns',
    'que_order': 'queOrder',
    
    // Department
    'depart_name': 'name',
    
    // Group
    'group_id': 'groupId',
    'group_name': 'groupName',
    'group_description': 'groupDescription',
    
    // Answer
    'ans_id': 'ansId',
    'ans_text': 'ansText',
    'is_correct': 'isCorrect'
};

function processDirectory(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDirectory(fullPath);
        } else if (fullPath.endsWith('.js') || fullPath.endsWith('.html')) {
            let content = fs.readFileSync(fullPath, 'utf-8');
            let modified = false;
            
            for (const [snake, camel] of Object.entries(mappings)) {
                // We use global regex replacement
                const regex = new RegExp(`\\b${snake}\\b`, 'g');
                if (regex.test(content)) {
                    content = content.replace(regex, camel);
                    modified = true;
                }
            }
            
            if (modified) {
                fs.writeFileSync(fullPath, content);
                console.log(`Updated ${fullPath}`);
            }
        }
    }
}

processDirectory(directory);
console.log('Mapping complete.');
