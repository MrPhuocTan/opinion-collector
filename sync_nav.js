const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'frontend/pages');
const targetFiles = [
    'admin-dashboard.html',
    'manage-request.html',
    'department-management.html',
    'user-management.html',
    'group-management.html',
    'admin-report.html'
];

const unifiedSidebar = `
    <div class="sidebar">
        <div class="sidebar-header">
            <svg class="logo-dang"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 238.125 158.75"
                version="1.1"
                id="svg19731">
                <defs id="defs19725" />
                <g id="layer1" transform="translate(242.66,-104.97)">
                    <rect style="fill:#da251d;fill-opacity:1;" width="238.125" height="158.75" x="-242.66" y="104.97" />
                    <g id="g19710-9" transform="matrix(1.051,0,0,1.051,6601.25,-1637.35)" style="fill:var(--secondary-color);fill-opacity:1;">
                        <path id="path19657-0-4"
                            d="m -6436.471547371615,1742.926950096642 c 6.38779271804,7.230641357446 14.963163305737,12.502793149194 24.298667889062,14.938860558647 6.056211101325,1.5803471957 12.472708435771,1.978650572228 18.596462444365,0.684499497231 6.123754008594,-1.294151074997 11.937748010956,-4.335579482059 16.158102214692,-8.957678632632 4.574893298958,-5.010387614465 7.112965317221,-11.701447693132 7.640977625143,-18.465679781602 0.528012307931,-6.76423208847 -0.871424851367,-13.593465851735 -3.428046439768,-19.878155088105 -4.560331599745,-11.210210791164 -12.883741385267,-20.851111282196 -23.308680635365,-26.998150562502 8.512796781266,0.709574410866 16.805946699762,3.8827694509 23.618107102883,9.036959544979 6.812160403116,5.154190094079 12.120611342006,12.272184963572 15.117966521428,20.271376598489 2.997355179421,7.999191634919 3.673617806543,16.852901094338 1.925932041966,25.214527691603 -1.747685764577,8.361626597266 -5.913491031185,16.203282596691 -11.863819649182,22.332295096395 -8.683007967653,8.943752149713 -21.180068232394,14.055514292711 -33.64194922505,13.760807647735 -12.461880992656,-0.294706644979 -24.703333498127,-5.991501184333 -32.953855939355,-15.335708444904 l -14.556480332948,14.556690177998 -9.381909223252,-9.381909223192 z"
                            />
                        <path id="path19683-5-7"
                            d="m -6392.699744590418,1702.503831581282 -10.959354263905,10.959354263781 49.262553323164,49.262553323191 -11.130862671953,11.240941835746 -49.317592904992,-49.317592905071 -8.654444010462,8.654444010525 -12.790755991701,-12.790755991717 21.572665110517,-21.572665110577 c 2.680889538451,0.275819129839 5.402702461607,0.150469066643 8.046892630834,-0.370590679184 2.581477478967,-0.508701686704 5.088366413035,-1.394314604689 7.416535436053,-2.62005208911 z"
                            />
                    </g>
                </g>
            </svg>
            <span>Thu thập ý kiến<br>Phường Xã</span>
        </div>
        
        <nav class="sidebar-nav">
            <a href="/pages/admin-dashboard.html" class="nav-item {{admin-dashboard}}">
                <i class="fas fa-home"></i> Quản lý chung
            </a>
            <a href="/pages/manage-request.html" class="nav-item {{manage-request}}">
                <i class="fas fa-comments"></i> Đợt thu thập ý kiến
            </a>
            <a href="/pages/user-management.html" class="nav-item {{user-management}}">
                <i class="fas fa-users-cog"></i> Cán bộ Công vụ
            </a>
            <a href="/pages/department-management.html" class="nav-item {{department-management}}">
                <i class="fas fa-sitemap"></i> Ban, Phòng, Đơn vị
            </a>
            <a href="/pages/group-management.html" class="nav-item {{group-management}}">
                <i class="fas fa-people-group"></i> Nhóm đối tượng
            </a>
            <a href="/pages/admin-report.html" class="nav-item {{admin-report}}">
                <i class="fas fa-file-pdf"></i> Báo cáo khảo sát
            </a>
        </nav>
        
        <div class="sidebar-footer">
            <div class="user-info">
                <i class="fas fa-user-circle"></i>
                <span id="adminName">Loading...</span>
            </div>
            <div class="datetime-info">
                <i class="fas fa-calendar-alt"></i> <span id="currentDate">--/--/----</span><br>
                <i class="fas fa-clock"></i> <span id="currentTime">--:--:--</span>
            </div>
            <button class="logout-btn" onclick="AUTH.logout()">
                <i class="fas fa-sign-out-alt"></i> Đăng xuất
            </button>
        </div>
    </div>`;

targetFiles.forEach(file => {
    const fullPath = path.join(pagesDir, file);
    if (fs.existsSync(fullPath)) {
        let content = fs.readFileSync(fullPath, 'utf8');
        
        // Match existing sidebar block (starts with <div class="sidebar">, ends right before <div class="main-content">)
        const sidebarRegex = /<div class="sidebar">[\s\S]*?(?=<div class="main-content">)/i;
        
        // Generate proper sidebar with active class
        let newSidebar = unifiedSidebar;
        targetFiles.forEach(targetFile => {
            const pageName = targetFile.replace('.html', '');
            if (file === targetFile) {
                newSidebar = newSidebar.replace(`{{${pageName}}}`, 'active');
            } else {
                newSidebar = newSidebar.replace(`{{${pageName}}}`, '');
            }
        });

        content = content.replace(sidebarRegex, newSidebar + '\n    ');
        
        fs.writeFileSync(fullPath, content);
        console.log(`Synchronized nav for ${file}`);
    }
});
