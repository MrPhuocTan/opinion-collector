<div align="center">
  <h1>Opinion Collector System</h1>
  <p><b>A professional, dynamic, and robust survey and opinion collection platform.</b></p>
  
  [![Node.js](https://img.shields.io/badge/Node.js-18.x-339933.svg?logo=nodedotjs&logoColor=white)](#)
  [![Express](https://img.shields.io/badge/Express-4.x-000000.svg?logo=express&logoColor=white)](#)
  [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791.svg?logo=postgresql&logoColor=white)](#)
  [![Frontend](https://img.shields.io/badge/Vanilla_JS-HTML5-E34F26.svg?logo=html5&logoColor=white)](#)
  [![License](https://img.shields.io/badge/License-Proprietary-red.svg)](#)
</div>

---

## Overview

The **Opinion Collector System** is an advanced platform designed to configure, collect, and analyze user feedback across multiple departments dynamically.

### Core Objectives
- Flexible management of organizational departments and users via a unified Dashboard UI.
- Concurrent opinion collection across multiple document-based surveys.
- **Real-time Analytics:** Collection and visualization of voting metrics and feedback.
- **Workflow Automation:** Seamless transitioning from document ingestion to automated reporting and KPI calculation.

---

## Key Features

| Feature | Description |
| :--- | :--- |
| **Department Management** | Logical grouping of users across various administrative departments for accurate polling. |
| **Survey & Document Control** | Full CRUD for dynamic surveys and referencing multiple PDF/Text documents per request. |
| **Dynamic Questionnaires**| Support for defining multiple questions (Boolean Yes/No, or Text) per document. |
| **Rich Text Integration** | Integrated Quill.js editor for rich text formatting of surveys and announcements. |
| **Built-in Visualization**| Interactive Chart.js integration embedded directly within the dashboard for real-time statistics. |
| **Role-based Access** | Distinct portals for System Administrators (management) and standard Users (answering surveys). |
| **Data Mapping** | Automated `camelCase` to `snake_case` mapping ensuring consistent Backend to Frontend workflows. |

---

## Core Entities

| Entity | Description |
| :--- | :--- |
| **Users** | System participants categorized by roles (ADMIN, USER) and assigned to Departments. |
| **Departments** | Organizational units used to segment and analyze survey results. |
| **Requests** | The overarching survey/campaign linking multiple documents together. |
| **Documents** | The core material (PDF/Content) that users review before answering questions. |
| **Questions** | Specific inquiries attached to documents (e.g., Do you agree with this policy?). |
| **Answers** | User-submitted feedback mapped to specific questions. |

---

## System Architecture

```mermaid
graph TD
    User([User Browser]) -->|HTTP / UI| FE[Frontend Vanilla JS]
    
    subgraph Opinion Collector Platform
        direction TB
        FE -->|REST API| BE[Backend Express.js]
        BE --> Controllers[Controllers]
        BE --> Middleware[Auth & Rate Limiter]
        Controllers --> Models[Models]
        Models --> Mapper[Data Mapper]
        Mapper --> DB[(PostgreSQL)]
    end
    
    subgraph External
        FE -.->|Chart.js| CDN1[CDN]
        FE -.->|Quill.js| CDN2[CDN]
    end
```

---

## Database Design

```mermaid
erDiagram
    DEPARTMENT {
        int depart_id PK
        string depart_name
        timestamp created_at
    }
    
    USERS {
        int user_id PK
        string user_name UK
        string user_pass
        string user_info
        int depart_id FK
        string user_role
    }
    
    REQUEST {
        int req_id PK
        string req_name
        string req_des
        timestamp created_at
    }
    
    DOCUMENT {
        int doc_id PK
        int req_id FK
        string doc_no
        string doc_des
        string pdf_url
    }
    
    QUESTION {
        int que_id PK
        int doc_id FK
        string que_des
        string answer_type
    }
    
    USER_ANSWER {
        int answer_id PK
        int user_id FK
        int que_id FK
        string user_answer
    }
    
    DEPARTMENT ||--o{ USERS : "has"
    REQUEST ||--o{ DOCUMENT : "contains"
    DOCUMENT ||--o{ QUESTION : "has"
    USERS ||--o{ USER_ANSWER : "submits"
    QUESTION ||--o{ USER_ANSWER : "receives"
```

---

## Benchmark Execution Flow

```mermaid
sequenceDiagram
    participant Admin
    participant User
    participant WebUI
    participant Backend
    participant DB as PostgreSQL

    Admin->>WebUI: Create Request & Upload Documents
    WebUI->>Backend: POST /api/v1/requests
    Backend->>DB: INSERT request, document, questions
    
    Note over User,DB: Survey Collection Phase
    User->>WebUI: Login & Select Request
    WebUI->>Backend: GET /api/v1/questions/request/:id
    Backend-->>WebUI: Return questions & PDF URLs
    User->>WebUI: Submit Answers
    WebUI->>Backend: POST /api/v1/answers/submit-multiple
    Backend->>DB: Save USER_ANSWER records
    
    Note over Admin,DB: Analysis Phase
    Admin->>WebUI: Open Dashboard Statistics
    WebUI->>Backend: GET /api/v1/statistics/department/:id
    Backend->>DB: Aggregate Answer counts by Department
    Backend-->>WebUI: Return Aggregated Stats
    WebUI-->>Admin: Display Chart.js Visualizations
```

---

## Getting Started

### 1. Prerequisites
- **Node.js 18+**
- **PostgreSQL 15+**

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/MrPhuocTan/opinion-collector.git
cd opinion-collector

# Install backend dependencies
cd backend
npm install

# Setup Database
# Execute the SQL scripts in the `db/` folder into your PostgreSQL instance.
```

### 3. Running the Platform
```bash
# Start backend server (Port 3000)
cd backend
npm run dev

# Start frontend (use VSCode Live Server or a simple HTTP server on Port 9090)
cd ../frontend
npx serve . -p 9090
```
*The Web UI will be accessible at `http://localhost:9090/pages/login.html`*

---

## Support & Contact
For platform inquiries, infrastructure support, or architectural discussions, contact the engineering team.

**Author & Credits:**
MrPhuocTan - phtan.working@gmail.com - 097.201.2901

*Opinion Collector System - © 2026 MrPhuocTan. All rights reserved.*
