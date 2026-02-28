# Specification

## Summary
**Goal:** Fix IC0508 "canister-stopped" errors by adding frontend error handling, a canister health check indicator in the admin layout, and backend defensive coding for the payment approval flow.

**Planned changes:**
- In `Payments.tsx` and `Students.tsx`, wrap `approveUpiPayment`, `rejectUpiPayment`, and related actor calls in try/catch blocks that detect IC0508 / "Canister is stopped" errors and display a user-friendly toast or inline message distinguishing this error from generic ones.
- Add a canister health check badge to `AdminLayout.tsx` that pings the backend on mount and every 60 seconds, showing a green "Online" or red "Service Unavailable" status indicator based on the response.
- Review and update `approveUpiPayment` in `backend/main.mo` to return a structured `Result<Text, Text>` type, add input validation to handle empty/invalid parameters gracefully, and remove any logic that could cause unexpected traps or canister stops.

**User-visible outcome:** Admins see a live backend status badge in the admin panel and receive clear, actionable error messages when the backend is temporarily unavailable, instead of unhandled errors during payment approval actions.
