/* ============================================================
   COMPANY #2 SITE: single-source configuration.
   NAME SWAP: change PRODUCT_NAME on the next line and the name
   updates on every page (masthead, titles, footer, headings).
   "Project Keystone" is a WORKING TITLE only, not a brand.
   See NAME-SWAP.md for the full swap checklist.
   ============================================================ */
const PRODUCT_NAME = "Project Keystone";   /* <-- change this one line */

/* Dev-only: shows the "working title, name TBD" notice on every
   page. Set to false (or delete the banner element) when the real
   name is chosen. */
const SHOW_PLACEHOLDER_NOTICE = true;

/* Waitlist: posts to the platform lead API.
   The platform API has a "keystone" entry in SITES_CONFIG (added 2026-09-30),
   so the live endpoint is set below. */
const LEAD_API = "https://platform-api-yf9l.onrender.com/api/v1/leads";
const LEAD_SITE_ID = "keystone";
