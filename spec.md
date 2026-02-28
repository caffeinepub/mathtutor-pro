# Specification

## Summary
**Goal:** Remove the payment gate from student sign-in so all registered students can access the portal freely, and fix the student selector dropdowns in the admin sessions and materials management pages so enrolled/registered students always appear.

**Planned changes:**
- Remove all payment status, access code, and approval checks from the student sign-in flow on the frontend so any student authenticated via Internet Identity reaches the student dashboard without interruption
- Remove backend payment gate / access-denied guards that block authenticated student principals from accessing their sessions, materials, or profile data
- Update the admin Students section to list all registered students with their payment and active status visually displayed
- Fix the ManageStudentSessions admin page so the student selector dropdown is populated with all enrolled/booked/active students, allowing the admin to add sessions for any listed student
- Fix the ManageStudentMaterials admin page so the student selector dropdown is populated with all enrolled/registered/active students, allowing the admin to add materials for any listed student

**User-visible outcome:** Students can log in via Internet Identity and immediately access the student portal with no payment or access code prompts. Admins can view all registered students with their statuses, and can select any enrolled student from the dropdowns in both the sessions and materials management pages to add records for them.
