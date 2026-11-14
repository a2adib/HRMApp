# Enterprise HR Management Platform — REST API Specification

**Document Version:** 1.0.0-PROD  
**Base URL:** `https://api.hrmapp.internal/api/v1`  
**API Standard:** RESTful JSON with OpenAPI 3.1 / RFC 7807 Compliance  
**Status:** Approved for Implementation (Phase 1 Baseline)  

---

## 1. Global Conventions & Standards

### 1.1 Authentication & Authorization Headers
Except for public authentication endpoints, all requests require a valid Bearer JWT:
```http
Authorization: Bearer <access_token>
Content-Type: application/json
Accept: application/json
```

Internal Machine-to-Machine (M2M) endpoints (e.g. Wi-Fi Ingestion) require pre-shared service authentication:
```http
X-Service-Token: <secure_internal_hmac_secret>
Content-Type: application/json
```

### 1.2 Pagination Standard
List endpoints support limit-offset pagination:
- `page`: Page index (default: `1`)
- `page_size`: Items per page (default: `20`, max: `100`)

```json
{
  "count": 142,
  "next": "https://api.hrmapp.internal/api/v1/employees/?page=2&page_size=20",
  "previous": null,
  "results": [ ... ]
}
```

### 1.3 Standard Error Format (RFC 7807)
```json
{
  "type": "https://api.hrmapp.internal/errors/validation-error",
  "title": "Validation Error",
  "status": 400,
  "detail": "One or more fields failed validation checks.",
  "errors": {
    "network_username": ["An employee with this enterprise network username already exists."]
  },
  "timestamp": "2026-11-15T08:30:00Z"
}
```

---

## 2. Authentication Endpoints

### 2.1 User Login
* **Method:** `POST /api/v1/auth/login/`
* **Access:** Public
* **Request Body:**
```json
{
  "email": "sarah.admin@acme-corp.com",
  "password": "Password123!"
}
```
* **Response (200 OK):**
```json
{
  "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "e4b1025a-4cb4-4db5-bdf3-b3c95c80db01",
    "email": "sarah.admin@acme-corp.com",
    "role": "HR_ADMIN",
    "organization": {
      "id": "780d6b63-d1f8-4e89-a9a5-c7255f058091",
      "name": "Acme Global Technologies",
      "slug": "acme-global",
      "timezone": "America/New_York"
    },
    "employee": {
      "id": "a90947ee-9976-4d76-b510-721db59ca120",
      "employee_code": "EMP-001",
      "first_name": "Sarah",
      "last_name": "Jenkins",
      "avatar_url": "https://cdn.hrmapp.internal/avatars/emp-001.png"
    }
  }
}
```

### 2.2 Refresh Token
* **Method:** `POST /api/v1/auth/refresh/`
* **Access:** Public
* **Request Body:**
```json
{
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```
* **Response (200 OK):**
```json
{
  "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 2.3 User Logout
* **Method:** `POST /api/v1/auth/logout/`
* **Access:** Authenticated (All Roles)
* **Request Body:**
```json
{
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```
* **Response (204 No Content)**

### 2.4 Authenticated User Profile (`me`)
* **Method:** `GET /api/v1/auth/me/`
* **Access:** Authenticated (All Roles)
* **Response (200 OK):** Returns detailed profile, permissions, assigned shift, and office topology.

---

## 3. Employee Management Endpoints

### 3.1 List Employees
* **Method:** `GET /api/v1/employees/`
* **Access:** `HR_ADMIN`, `MANAGER` (Manager filtered to team)
* **Query Params:** `search`, `department`, `employment_status`, `page`, `page_size`
* **Response (200 OK):** Paginated array of employee summaries.

### 3.2 Create Employee
* **Method:** `POST /api/v1/employees/`
* **Access:** `HR_ADMIN`
* **Request Body:**
```json
{
  "first_name": "Alex",
  "last_name": "Rivera",
  "work_email": "alex.rivera@acme-corp.com",
  "employee_code": "EMP-1044",
  "phone_number": "+1-512-555-0199",
  "department_id": "93b2a265-7182-411a-85d7-8c82ebaa5b11",
  "designation_id": "31bfa283-e892-491c-848e-f1cc23f4b455",
  "office_id": "45d1d6fb-4537-4d92-a1f2-1d547f44d567",
  "manager_id": "a90947ee-9976-4d76-b510-721db59ca120",
  "shift_id": "52ba41b0-2b10-4497-b6bb-993d08f43818",
  "joining_date": "2026-11-01",
  "network_username": "arivera",
  "role": "EMPLOYEE"
}
```
* **Response (201 Created):** Full employee representation with initialized `LeaveBalance` records.

### 3.3 Employee Detail & Update
* **Method:** `GET /api/v1/employees/{id}/`
* **Method:** `PATCH /api/v1/employees/{id}/`
* **Access:** `HR_ADMIN`, `MANAGER` (read-only for direct reports), `EMPLOYEE` (read-only for self).

---

## 4. Attendance Management Endpoints

### 4.1 Today's Attendance State
* **Method:** `GET /api/v1/attendance/today/`
* **Access:** Authenticated Employee
* **Response (200 OK):**
```json
{
  "attendance_date": "2026-11-15",
  "status": "PRESENT",
  "source": "WIFI",
  "first_check_in": "2026-11-15T08:52:14Z",
  "last_check_out": "2026-11-15T17:34:02Z",
  "total_work_minutes": 522,
  "late_minutes": 0,
  "early_departure_minutes": 0,
  "shift": {
    "name": "Standard Day Shift",
    "start_time": "09:00:00",
    "end_time": "18:00:00",
    "grace_period_minutes": 15
  },
  "wifi_sessions_count": 3
}
```

### 4.2 Attendance History & Monthly Calendar
* **Method:** `GET /api/v1/attendance/history/`
* **Method:** `GET /api/v1/attendance/monthly/`
* **Query Params:** `year=2026`, `month=11`, `employee_id` (optional for HR)
* **Response (200 OK):** Aggregated monthly metrics (days present, days late, days absent, total hours, average punctuality) alongside daily calendar cell records.

### 4.3 Team Attendance Overview
* **Method:** `GET /api/v1/attendance/team/`
* **Access:** `MANAGER`, `HR_ADMIN`
* **Query Params:** `date=2026-11-15`, `department_id`
* **Response (200 OK):** Real-time roster of team members with presence status (`IN_OFFICE`, `WORKING_REMOTE`, `LATE`, `ON_LEAVE`, `ABSENT`).

### 4.4 Mobile / Manual Punches
* **Method:** `POST /api/v1/attendance/check-in/`
* **Method:** `POST /api/v1/attendance/check-out/`
* **Access:** Authenticated Employee
* **Request Body:**
```json
{
  "latitude": 30.267153,
  "longitude": -97.743057,
  "device_info": "iOS 18.2 / iPhone 15 Pro",
  "notes": "Remote field visit punch"
}
```
* **Response (201 Created):** Recorded `AttendanceEvent` and updated `AttendanceRecord`.

### 4.5 Attendance Adjustments & Corrections
* **Method:** `POST /api/v1/attendance/adjustments/`
* **Access:** Authenticated Employee / Manager
* **Request Body:**
```json
{
  "attendance_record_id": "97e68bc4-b778-4354-9418-86d1a938b812",
  "requested_check_in": "2026-11-14T09:00:00Z",
  "requested_check_out": "2026-11-14T18:00:00Z",
  "requested_status": "PRESENT",
  "reason": "Campus Wi-Fi AP maintenance during morning hours; badge reader also offline."
}
```
* **Response (201 Created):** Created adjustment ticket awaiting HR/Manager review.

---

## 5. Leave Management Endpoints

### 5.1 List & Apply Leaves
* **Method:** `GET /api/v1/leaves/`
* **Method:** `POST /api/v1/leaves/`
* **Access:** Authenticated Employee
* **Request Body:**
```json
{
  "leave_type_id": "0d6e191a-7b3b-48c0-8da1-80776bf7d8ee",
  "start_date": "2026-11-20",
  "end_date": "2026-11-22",
  "reason": "Family vacation",
  "attachment_url": null
}
```
* **Response (201 Created):** Created leave request with deduction from `pending_days` in `LeaveBalance`.

### 5.2 Approve or Reject Leave Request
* **Method:** `POST /api/v1/leaves/{id}/approve/`
* **Method:** `POST /api/v1/leaves/{id}/reject/`
* **Access:** `MANAGER`, `HR_ADMIN`
* **Request Body:**
```json
{
  "review_notes": "Approved. Have a great vacation!"
}
```
* **Response (200 OK):** Updated leave request status, automatically converts corresponding dates in `AttendanceRecord` to `ON_LEAVE`.

---

## 6. Dashboard Metrics Endpoints

### 6.1 Employee Dashboard
* **Method:** `GET /api/v1/dashboard/employee/`
* **Access:** Authenticated Employee
* **Response (200 OK):** Today's punch card, weekly hours bar chart data, upcoming holidays, active announcements, leave balance chips.

### 6.2 Manager Dashboard
* **Method:** `GET /api/v1/dashboard/manager/`
* **Access:** `MANAGER`, `HR_ADMIN`
* **Response (200 OK):** Team presence pie chart, pending leave approvals counter, today's late arrivals list.

### 6.3 HR Administrator Dashboard
* **Method:** `GET /api/v1/dashboard/hr/`
* **Access:** `HR_ADMIN`
* **Response (200 OK):**
```json
{
  "metrics": {
    "total_employees": 248,
    "present_today": 218,
    "absent_today": 12,
    "late_today": 9,
    "on_leave_today": 9,
    "attendance_rate_percentage": 91.5,
    "pending_leave_requests": 6,
    "pending_attendance_adjustments": 3
  },
  "attendance_trend_30_days": [
    { "date": "2026-10-16", "rate": 94.2 },
    { "date": "2026-11-15", "rate": 91.5 }
  ],
  "department_attendance_breakdown": [
    { "department": "Engineering", "total": 95, "present": 89, "rate": 93.6 },
    { "department": "Product & Design", "total": 32, "present": 30, "rate": 93.7 }
  ]
}
```

---

## 7. Departments, Shifts & Settings Endpoints

* **Departments:** `GET /api/v1/departments/`, `POST /api/v1/departments/`
* **Shifts:** `GET /api/v1/shifts/`, `POST /api/v1/shifts/`
* **Holidays:** `GET /api/v1/holidays/`, `POST /api/v1/holidays/`
* **Access Points:** `GET /api/v1/access-points/`, `POST /api/v1/access-points/`

---

## 8. Wi-Fi Ingestion Internal Endpoint

* **Method:** `POST /api/v1/internal/wifi-events/`
* **Access:** Protected by `X-Service-Token` (Internal M2M Only)
* **Request Body:**
```json
{
  "organization_id": "780d6b63-d1f8-4e89-a9a5-c7255f058091",
  "batch_id": "batch-20261115-085000-001",
  "events": [
    {
      "called_station_id": "00:1A:1E:17:F1:80",
      "user_name": "arivera",
      "calling_station_id": "F4:D4:88:51:2A:9C",
      "nas_ip_address": "10.0.1.1",
      "session_start": "2026-11-15T08:52:14Z",
      "session_end": "2026-11-15T12:30:00Z",
      "session_duration_seconds": 13066
    },
    {
      "called_station_id": "00:1A:1E:17:F1:82",
      "user_name": "arivera",
      "calling_station_id": "F4:D4:88:51:2A:9C",
      "nas_ip_address": "10.0.1.2",
      "session_start": "2026-11-15T13:15:00Z",
      "session_end": "2026-11-15T17:34:02Z",
      "session_duration_seconds": 15542
    }
  ]
}
```
* **Response (202 Accepted):**
```json
{
  "status": "ACCEPTED",
  "batch_id": "batch-20261115-085000-001",
  "events_received": 2,
  "events_queued": 2,
  "duplicates_skipped": 0
}
```

---

## 9. Reports & Analytics Endpoints

* **Attendance Report:** `GET /api/v1/reports/attendance/?from_date=2026-11-01&to_date=2026-11-15&format=json|csv`
* **Leave Report:** `GET /api/v1/reports/leave/?year=2026&department_id=...&format=json|csv`
