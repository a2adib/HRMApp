# Enterprise Human Resource Management (HRM) Platform

[![Python](https://img.shields.io/badge/Python-3.12-blue.svg)](https://www.python.org/)
[![Django](https://img.shields.io/badge/Django-5.1-0C4B33.svg)](https://www.djangoproject.com/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB.svg)](https://react.dev/)
[![React Native](https://img.shields.io/badge/React%20Native-0.76-61DAFB.svg)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-52.0-000020.svg)](https://expo.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791.svg)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED.svg)](https://www.docker.com/)

An enterprise-grade, production-oriented Human Resource Management and Workforce Intelligence platform. Engineered with a modular Python Django REST backend, multi-tenant PostgreSQL data isolation, a modern React Vite admin dashboard, an Expo React Native employee self-service mobile application, and passive 802.1X corporate Wi-Fi attendance tracking with network flapping suppression.

---

## 1. System Architecture & Topology

```
                                  +-------------------------------------------------------+
                                  |           ENTERPRISE NETWORK INFRASTRUCTURE           |
                                  |  Access Points (802.1X) ---> RADIUS Accounting Stream |
                                  +---------------------------+---------------------------+
                                                              |
                                                    (Syslog / M2M Batch)
                                                              |
                                                              v
+-------------------------------+              +-------------------------------+
|     REACT WEB ADMIN PORTAL    |              |     WI-FI INGESTION GATEWAY   |
|   (Vite + Tailwind + Recharts)|              |  /api/v1/internal/wifi-events |
+---------------+---------------+              +---------------+---------------+
                |                                              |
     (REST API / JWT Bearer)                     (HMAC Service Token Validation)
                |                                              |
                +----------------------+-----------------------+
                                       |
                                       v
                     +-----------------------------------+
                     |      DJANGO 5.1 CORE BACKEND      |
                     |   (Tenant Middleware + SimpleJWT) |
                     +-----------------+-----------------+
                                       |
            +--------------------------+--------------------------+
            |                          |                          |
            v                          v                          v
+-----------------------+  +-----------------------+  +-----------------------+
|  POSTGRESQL 16 (DB)   |  |   REDIS 7 (CACHE/MQ)  |  |    CELERY WORKERS     |
| Tenant Schema Filter  |  | Task Queue & Sessions |  | Flapping / Reconcile  |
+-----------------------+  +-----------------------+  +-----------------------+
            ^
            |
+-----------+-------------------+
|  REACT NATIVE MOBILE APP      |
|  (Expo SDK 52 + TypeScript)   |
+-------------------------------+
```

---

## 2. Technology Stack

| Domain | Technology | Purpose |
| :--- | :--- | :--- |
| **Backend Framework** | Python 3.12 / Django 5.1 / DRF 3.15 | REST API, Business Domain Services, ORM |
| **Authentication** | Django REST SimpleJWT 5.3 | JWT Tokens with Automatic Refresh Rotation |
| **Database** | PostgreSQL 16 | Relational Storage with Multi-Company Tenancy |
| **Caching & Messaging**| Redis 7 | Celery Task Broker & Ephemeral Caching |
| **Async Task Engine** | Celery 5.3 & Celery Beat | Nightly Attendance Reconciliation & Wi-Fi Ingest |
| **Web Admin Dashboard**| React 18 / TypeScript / Vite / Tailwind| Executive Overview, Employee Directory, Reports |
| **Mobile Application** | React Native / Expo 52 / TypeScript | Employee Self-Service, Attendance, Leaves |
| **API Documentation** | drf-spectacular (OpenAPI 3.0 / Swagger)| Interactive API Explorer & Schemas |
| **Containerization** | Docker / Docker Compose / Nginx | Multi-Container Production Orchestration |

---

## 3. Pre-Seeded Demonstration Accounts

The platform includes two fully configured corporate tenants (**Acme Global Technologies** and **Beta Innovations Inc.**). Use these pre-seeded accounts to explore role-based permissions:

| Role | Email | Password | Access Scope |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@acme-corp.com` | `Admin123!` | System-wide cross-tenant administration |
| **HR Administrator** | `sarah.jenkins@acme-corp.com` | `Password123!` | Full workforce, shift, leave, & AP management |
| **People Manager** | `marcus.brody@acme-corp.com` | `Password123!` | Team roster, attendance exceptions, approvals |
| **Employee** | `alex.rivera@acme-corp.com` | `Password123!` | Mobile self-service, punch clock, time off |

---

## 4. Quickstart Guide

### Option A: Complete Docker Compose Deployment (Recommended)

Start the entire production stack (PostgreSQL, Redis, Django Backend, Celery Worker, Celery Beat, and Nginx Web Dashboard) with a single command:

```bash
# 1. Clone repository
git clone git@github.com:a2adib/HRMApp.git
cd HRMApp

# 2. Copy environment template
cp .env.example .env

# 3. Build and launch containers
docker compose up -d --build

# 4. Seed initial database data
docker compose exec backend python manage.py seed_data
```

Once running, access the services:
* **Web Admin Dashboard:** [http://localhost](http://localhost) (Port 80)
* **API Endpoints:** [http://localhost/api/v1/](http://localhost/api/v1/)
* **Interactive Swagger Documentation:** [http://localhost:8000/api/v1/docs/](http://localhost:8000/api/v1/docs/)
* **Django Admin Portal:** [http://localhost:8000/admin/](http://localhost:8000/admin/)

---

### Option B: Local Native Development Setup

#### 1. Backend Setup
```bash
# Create and activate Python virtual environment
python3 -m venv backend/venv
source backend/venv/bin/activate

# Install dependencies
pip install -r backend/requirements.txt

# Run migrations and seed demo data
python backend/manage.py migrate
python backend/manage.py seed_data

# Start local development server
python backend/manage.py runserver 0.0.0.0:8000
```

#### 2. React Web Admin Setup
```bash
cd hrm_frontend
npm install
npm run dev
# Dashboard launches at http://localhost:5173
```

#### 3. React Native Mobile App Setup
```bash
cd hrm_mobile
npm install
npx expo start
# Press 'i' for iOS Simulator, 'a' for Android Emulator, or 'w' for Web Preview
```

---

## 5. Wi-Fi Attendance Processing Engine

Adapted from [Omar-El-Hawary/Wifi_based_attendance_tracking](https://github.com/Omar-El-Hawary/Wifi_based_attendance_tracking.git) with enterprise hardening:

### Technical Adaptations:
1. **Resolved Reference Vulnerabilities:** Replaced volatile in-memory caching and syntax-broken property access (`req.body.Called-Station-Id`) with persistent PostgreSQL staging (`WiFiSession`) and strict typing.
2. **Network Flapping Suppression:** Automatic roaming detection merges access point transitions occurring within 5 minutes into a single continuous presence block, eliminating session fragmentation.
3. **Shift Grace Periods:** Automatically evaluates first Wi-Fi association against assigned shift schedules, accounting for configured grace periods (e.g. 15 minutes) before flagging records as `LATE`.
4. **Nightly Reconciliation Engine:** Nightly Celery Beat task auto-closes abandoned sessions at shift end, detects unexcused absences, and flags approved leaves and public holidays.

### Simulating Wi-Fi Accounting Traffic:
```bash
# Run simulation command in Django backend
python backend/manage.py simulate_wifi_traffic --reconcile

# Or execute external synthetic collector feeder
python scripts/mock_wifi_feeder.py http://localhost:8000/api/v1/internal/wifi-events/
```

---

## 6. Automated Testing & Verification

The platform is covered by an automated test suite across backend services, frontend web builds, and mobile TypeScript typechecking:

```bash
# 1. Execute Django Backend Pytest Suite (20 tests)
source backend/venv/bin/activate
pytest backend/tests/ -v

# 2. Build React Web Application
cd hrm_frontend && npm run build

# 3. Type-check React Native Mobile App
cd hrm_mobile && npx tsc --noEmit
```

---

## 7. Project Directory Structure

```text
HRMApp/
├── backend/                  # Python 3.12 Django 5 REST Backend
│   ├── apps/
│   │   ├── accounts/         # Custom User, JWT Authentication, RBAC
│   │   ├── organizations/    # Multi-Tenant Organizations, Offices, AccessPoints
│   │   ├── employees/        # Employee Profiles & 802.1X RADIUS Mapping
│   │   ├── departments/      # Departments & Designation Hierarchy
│   │   ├── shifts/           # Shifts, Grace Tolerances, Employee Scheduling
│   │   ├── attendance/       # Attendance Calculation Engine & Events
│   │   ├── wifi_attendance/  # Ingestion Gateway, Flapping Suppression, Celery
│   │   ├── leaves/           # Leave Policies, Balances, & Approval Workflow
│   │   ├── holidays/         # Public & Company Holiday Schedules
│   │   ├── notifications/    # Push Alerts & Announcements
│   │   ├── reports/          # Workforce Analytics & CSV Exporters
│   │   └── audit/            # Immutable Security Audit Logging
│   ├── tests/                # Pytest Test Suite
│   ├── manage.py
│   └── requirements.txt
│
├── hrm_frontend/             # React 18 Admin Dashboard (Vite + Tailwind)
│   ├── src/
│   │   ├── api/              # Axios Client with Auto JWT Token Refresh
│   │   ├── components/       # Design System UI Library
│   │   ├── context/          # Auth & Role Persistence Context
│   │   └── pages/            # 19 Enterprise Administration Views
│   └── package.json
│
├── hrm_mobile/               # React Native Employee Mobile App (Expo SDK 52)
│   ├── src/
│   │   ├── api/              # Mobile API Layer with Platform IP Resolution
│   │   ├── components/       # Native Cards, Badges, & Action Buttons
│   │   ├── navigation/       # Native Stack & 5-Tab Bottom Navigator
│   │   └── screens/          # Home, Attendance, Leave, Alerts, Profile
│   └── package.json
│
├── infrastructure/           # Deployment & Container Configuration
│   ├── docker/               # Dockerfiles for Backend, Frontend, Celery
│   └── nginx/                # Production Reverse Proxy Configuration
│
├── docs/                     # Specifications & Architecture Documentation
├── scripts/                  # Standalone Synthetic RADIUS Feeder
├── docker-compose.yml        # Production Multi-Service Container Setup
├── .env.example              # Environment Variable Template
└── README.md
```

---

## 8. License

This project is licensed under the MIT License.
