# Name swap checklist — company #2 site

"Agent identity for commerce" is a working title, not a brand. When Andrew
picks the real name, follow these steps.

## The swap (name is baked into the HTML)

The product name now lives as literal text in each HTML file — `<title>`
tags, the masthead brand link, and the footer — so link previews and
search engines see it with no JavaScript. `config.js` `PRODUCT_NAME`
remains only as a JS fallback. To swap the name:

1. In `index.html`, `waitlist.html`, `spec.html`, and `404.html`:
   replace the literal "Agent identity for commerce" in the `<title>`
   tag, the `.brand` link, and the footer `<strong>`.
2. Update the `og:title` / `twitter:title` meta tags on each page.
3. Update `PRODUCT_NAME` in `config.js` to match (fallback only).
4. If the real name has a domain, point it at this site.

## Waitlist wiring

6. The form posts to the shared platform lead API
   (`LEAD_API` in `config.js`, `site_id` = `keystone`), matching the
   existing `/api/v1/leads` contract: `site_id`, `name`, `email`,
   `business`, `domain`, and `source` = `waitlist-merchant` or
   `waitlist-builder` plus the track question, folded into the 120-char
   `source` field. If `LEAD_API` is ever unset, the form shows a
   not-live notice and submits nothing.

## Files (clean rebuild 2026-09-30)

- `config.js`, `site.js`, `styles.css`
- `index.html`, `spec.html`, `waitlist.html`, `404.html`
- `.nojekyll`, `README.md`, `NAME-SWAP.md`

The pre-rebuild staging site (8 pages incl. demo prototype) is archived at
`~/workspace/hidden_files/company2-site-pre-rebuild-2026-09-30-1703/`.
