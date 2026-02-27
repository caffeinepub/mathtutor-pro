# Specification

## Summary
**Goal:** Add per-student session scheduling, materials management, and attendance tracking to both the Admin Panel and Student Dashboard of Rajat Math Academy.

**Planned changes:**
- Add backend data models and functions for Sessions, Materials, and Attendance, with strict per-student data isolation and admin-only mutation access
- Add "Manage Student Sessions" page to Admin Panel: student dropdown, session creation form (date, time, duration, Meet link, optional topic), and session list with delete
- Add "Manage Student Materials" page to Admin Panel: student dropdown, material form supporting file upload or URL link (title, description, related course), and materials list with delete
- Add "Attendance Management" page to Admin Panel: student dropdown, session dropdown, Present/Absent marking, and attendance records table
- Update Student Dashboard with three new sections: "My Sessions" (with Join button, duration, topic, attendance status), "My Materials" (with view/download), and "My Attendance Summary" (stat cards for total, present, absent)
- Add sidebar navigation links for all three new admin sections with admin auth guard protection
- Add backend migration to preserve existing stable state and initialise new maps as empty on upgrade

**User-visible outcome:** Admins can schedule sessions, upload/link materials, and mark attendance for individual students. Students can view their own sessions, materials, and attendance summary on their dashboard — no cross-student data is ever visible.
