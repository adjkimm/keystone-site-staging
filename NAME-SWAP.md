# Name swap checklist — company #2 site

"Agent identity for commerce" is a working title, not a brand. When Andrew
picks the real name, follow these steps. Nothing else in the copy references
the working title.

## The one-line swap

1. Open `config.js`.
2. Change `PRODUCT_NAME` to the real name, e.g.
   `const PRODUCT_NAME = "Acme Identity";`
3. Every page updates: masthead, `<title>` tags (via the
   `{{PRODUCT_NAME}}` token), and footer. No other file needs editing for
   the name itself.

## After the swap

4. Update the footer line "working title, the final name is still to come"
   in each HTML file (search for `working title`).
5. If the real name has a domain, point it at this site.

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
- `index.html`, `spec.html`, `waitlist.html`
- `.nojekyll`, `README.md`, `NAME-SWAP.md`

The pre-rebuild staging site (8 pages incl. demo prototype) is archived at
`~/workspace/hidden_files/company2-site-pre-rebuild-2026-09-30-1703/`.
