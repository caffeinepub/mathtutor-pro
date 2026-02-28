# Specification

## Summary
**Goal:** Replace the custom student login (email + unique code) with Internet Identity authentication, while leaving all admin and other features untouched.

**Planned changes:**
- Remove the email and unique code fields from the student login section on the Login page; replace with a single Internet Identity login button that triggers the `useInternetIdentity` hook.
- After successful Internet Identity login, check if the student's principal is approved in the backend — redirect approved students to the dashboard, show a pending approval message for unapproved ones.
- Remove backend functions that validate email + unique code pairs for student authentication; student identity checks must rely solely on the caller's Internet Identity principal.
- Update student route guards to protect routes using `isAuthenticated` from the `useInternetIdentity` hook instead of any localStorage-based custom token.
- Update the StudentLayout logout button to call the Internet Identity logout function.
- Admin login, admin route guards, AdminLayout, and all other backend features remain completely unchanged.

**User-visible outcome:** Students log in exclusively via Internet Identity instead of email and unique code. Approved students are directed to their dashboard; unapproved students see a pending approval message. Admins continue to log in with the existing email-based flow without any changes.
