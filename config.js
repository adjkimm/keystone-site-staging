/* ============================================================
   SITE CONFIG — single source of truth.
   NAME SWAP: change PRODUCT_NAME on the next line and the name
   updates on every page (masthead, titles, footer).
   "Agent identity for commerce" is a WORKING TITLE only, not a brand.
   See NAME-SWAP.md for the full swap checklist.
   ============================================================ */
const PRODUCT_NAME = "Agent identity for commerce";   /* <-- change this one line */

/* Waitlist: posts to the shared platform lead API.
   The platform API recognizes the "keystone" site_id. */
const LEAD_API = "https://platform-api-yf9l.onrender.com/api/v1/leads";
const LEAD_SITE_ID = "keystone";

/* Free agent-access check: GET /api/agent-access?domain=example.com */
const ACCESS_API = "https://platform-api-yf9l.onrender.com/api/agent-access";
