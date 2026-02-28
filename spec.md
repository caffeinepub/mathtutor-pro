# Specification

## Summary
**Goal:** Fix the hardcoded admin login credentials so that the admin account uses `admin@mathtutor.com` / `Admin@123` consistently across the backend and frontend.

**Planned changes:**
- Update the backend admin authentication logic to accept email `admin@mathtutor.com` and password `Admin@123`, returning a valid admin session on success.
- Update the frontend login logic (including the localStorage/store fallback) so the hardcoded admin record uses `admin@mathtutor.com` and `Admin@123`.
- Ensure the login form no longer shows "invalid credentials" when the correct admin credentials are submitted.

**User-visible outcome:** Logging in with `admin@mathtutor.com` / `Admin@123` successfully authenticates the admin and redirects to the admin dashboard without any error.
