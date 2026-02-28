# Specification

## Summary
**Goal:** Fix the admin dashboard so registered students are visible with full details, add the ability to edit student records, and make sessions and study materials per-student (assigned to and visible only on a specific student's dashboard).

**Planned changes:**
- Update the admin Students page to fetch and display all registered students from the backend, showing name, email, contact info, enrolled course, and enrollment/payment status with search/filter support
- Add an Edit Student modal/form in the admin Students page, pre-populated with the student's current data, allowing admins to update any field (name, email, contact info, enrollment status, etc.) and persist changes to the backend
- Add a backend `updateStudent` function (admin-only) that updates any field of a student record in stable storage
- Update the admin ManageStudentSessions page with a student selector dropdown; sessions added (date, time, Google Meet link, topic) are saved and associated only with the selected student, appearing solely on that student's dashboard
- Update the admin ManageStudentMaterials page with a student selector dropdown; materials added (title, description, URL/link) are saved and associated only with the selected student, appearing solely on that student's dashboard
- Fix the admin Dashboard overview to fetch and display accurate stats (total, active, pending, payments) and a recent students list from the backend via React Query

**User-visible outcome:** Admins can see all registered students with their details, edit any student's information, and assign sessions and study materials to individual students — each student only sees their own assigned sessions and materials on their dashboard.
