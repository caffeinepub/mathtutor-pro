# Specification

## Summary
**Goal:** Fix student registration, add WhatsApp demo-booking CTAs on all course sections, and apply "The Rajat's Equation" brand logo throughout the app.

**Planned changes:**
- Fix the `registerStudent` function so that submitting `/register` with valid data correctly creates both a user record and a pending student record in the local store, redirects to `/login` with a success toast, and shows appropriate errors for invalid or duplicate submissions
- Add a WhatsApp CTA button (WhatsApp green #25D366, WhatsApp icon) to every course card and course subsection on the landing page, `/student/courses`, `/admin/courses`, and the course selection step of `/student/book`; clicking opens `https://wa.me/919424135055` in a new tab with a pre-filled demo booking message
- Replace all "MathTutor Pro" branding text/placeholder logos with the Rajat's Equation logo in the admin sidebar header, student sidebar header, landing page navbar, and login/register page headers
- Use the Rajat's Equation monogram as the browser favicon
- Update the `<title>` in `index.html` to "The Rajat's Equation"

**User-visible outcome:** Students can successfully register and log in; every course section shows a one-tap WhatsApp button to book a demo; and the entire app consistently displays "The Rajat's Equation" branding with the correct logo and favicon.
