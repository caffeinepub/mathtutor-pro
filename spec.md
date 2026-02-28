# Specification

## Summary
**Goal:** Improve the scannability and usability of the UPI payment QR code on the student payment page by fixing the QR encoding format, upgrading quality settings, and adding a copyable fallback section.

**Planned changes:**
- Generate the QR code using a properly formatted UPI deep link (`upi://pay?pa=<UPI_ID>&pn=<PAYEE_NAME>&am=<AMOUNT>&cu=INR`) so all UPI apps (Google Pay, PhonePe, BHIM, Paytm, etc.) can scan it correctly
- Render the QR code with error correction level H, a white quiet zone border, high-contrast black-on-white modules, and a minimum size of 256x256 pixels
- Add a fallback section below the QR code labeled "Can't scan? Use these instead:" with a copyable UPI ID (copy button with "Copied!" toast feedback) and a tappable UPI deep link that opens the user's default UPI app

**User-visible outcome:** Students can reliably scan the QR code with any UPI app, and if scanning fails, they can copy the UPI ID or tap a direct payment link to complete the payment manually.
