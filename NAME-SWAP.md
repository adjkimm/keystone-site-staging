# Name swap checklist — company #2 site

"Project Keystone" is a working title, not a brand. When Andrew picks the
real name, follow these steps. Nothing else in the copy references the
working title.

## The one-line swap

1. Open `config.js`.
2. Change `PRODUCT_NAME` to the real name, e.g.
   `const PRODUCT_NAME = "Acme Identity";`
3. Every page updates: masthead, `<title>` tags (via the
   `{{PRODUCT_NAME}}` token), footer, and all `[data-product-name]`
   headings. No other file needs editing for the name itself.

## After the swap

4. Set `SHOW_PLACEHOLDER_NOTICE = false` in `config.js` (or delete the
   `#placeholder-notice` div from each page) to remove the
   "working title, name TBD" banner.
5. Update the footer line "Working title, pre-launch" in each HTML file
   (search for `Working title, pre-launch`).
6. If the real name has a domain, add it to waitlist/contact references
   and set `LEAD_API` in `config.js` once the platform API has a
   "keystone" entry in SITES_CONFIG.

## Waitlist wiring

7. Add `"keystone"` to SITES_CONFIG in `~/workspace/platform/api/server.py`
   (copy the checklane entry pattern), redeploy the platform API, then set
   `LEAD_API` in `config.js` to the leads endpoint. The form posts
   `site_id`, `name`, `email`, `business`, `domain`, and
   `source` = `waitlist-merchant` or `waitlist-builder`, matching the
   existing `/api/v1/leads` contract. Until then the form shows a
   "preview mode" notice and submits nothing.

## Files

- `config.js`, `site.js`, `styles.css`
- `index.html`, `how-it-works.html`, `merchants.html`, `builders.html`,
  `spec.html`, `demo.html`, `waitlist.html`, `neutrality.html`
