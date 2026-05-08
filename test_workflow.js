const http = require('http');

async function callAPI(path, method = 'GET', data = null, token = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: `/api/v1${path}`,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (token) {
            options.headers['Authorization'] = `Bearer ${token}`;
        }

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, data: JSON.parse(body) });
                } catch(e) {
                    resolve({ status: res.statusCode, data: body });
                }
            });
        });

        req.on('error', reject);

        if (data) {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
}

async function runTests() {
    console.log("🚀 Bắt đầu Auto Test & Simulate User Test...");
    
    // 1. Simulate Admin Login (Call API Test)
    console.log("\n[1] Testing Admin Login...");
    const loginRes = await callAPI('/auth/login', 'POST', { username: 'admin', password: 'password123' });
    console.log(`Status: ${loginRes.status}`);
    
    if (loginRes.status !== 200 || !loginRes.data.token) {
        console.error("❌ Login failed! (Did you seed the database?)");
        return;
    }
    const token = loginRes.data.token;
    console.log("✅ Admin Login Successful");

    // 2. Fetch Dashboard Stats (Workflow Test)
    console.log("\n[2] Testing Dashboard Statistics API...");
    const statsRes = await callAPI('/dashboard/stats', 'GET', null, token);
    console.log(`Status: ${statsRes.status}`);
    if (statsRes.status === 200) {
        console.log("✅ Dashboard Stats Fetched:");
        console.log("Total Users:", statsRes.data.overview?.totalUsers || 0);
    } else {
        console.error("❌ Failed to fetch dashboard stats", statsRes.data);
    }

    // 3. Create a Department (Data Mapping Test)
    console.log("\n[3] Testing Department CRUD...");
    const deptRes = await callAPI('/departments', 'POST', { name: 'Test QA Department' }, token);
    console.log(`Status: ${deptRes.status}`);
    if (deptRes.status === 201) {
        console.log("✅ Department Created successfully:", deptRes.data.department?.name);
    } else {
        console.error("❌ Failed to create department", deptRes.data);
    }
    
    console.log("\n🎉 Hoàn thành các bài test Workflow và API cơ bản!");
}

runTests();
