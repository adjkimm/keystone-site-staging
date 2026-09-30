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

/* Waitlist: posts to the platform lead API when enabled.
   The API needs a "keystone" entry in SITES_CONFIG first.
   While null, the form shows a "preview mode" notice instead
   of submitting. */
const LEAD_API = null; /* set to the leads endpoint URL once the platform API has a "keystone" site entry */
const LEAD_SITE_ID = "keystone";
