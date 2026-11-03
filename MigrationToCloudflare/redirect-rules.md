# Old WordPress URL redirects (Cloudflare Redirect Rules)

The WordPress site uses plain permalinks (`/?page_id=N`). Cloudflare Pages `_redirects` can't match query strings, so these go in the Cloudflare dashboard: thementalgain.com zone → Rules → Redirect Rules → Create rule → "Custom filter expression" → edit expression.

Create these **after** the Pages custom domain is attached (Phase 3). Free plan allows 10 rules; this uses 5, plus 1 for www → apex.

For every rule: Type = Static, status code 301, and **leave "Preserve query string" off**.

| # | Old URL (WordPress page) | Expression | Redirect to |
|---|---|---|---|
| 1 | `/?page_id=3539` Services | `(http.host eq "thementalgain.com" and http.request.uri.path eq "/" and http.request.uri.query eq "page_id=3539")` | `https://thementalgain.com/services` |
| 2 | `/?page_id=5037` Testimonials | same, `page_id=5037` | `https://thementalgain.com/my-clients` |
| 3 | `/?page_id=4572` Contact | same, `page_id=4572` | `https://thementalgain.com/contact` |
| 4 | `/?page_id=4835` My Story | same, `page_id=4835` | `https://thementalgain.com/about` |
| 5 | `/?page_id=5148` Book Me | same, `page_id=5148` | `https://thementalgain.com/book-me` |

Optional 6th rule, www → apex, if you don't use the Pages `www` custom domain redirect:
`(http.host eq "www.thementalgain.com")` → dynamic `concat("https://thementalgain.com", http.request.uri.path)`, 301, preserve query string on.

Page IDs were read from the live WordPress home page navigation on 2026-10-19. Other IDs (old posts, attachments) aren't covered. Check Google Search Console's Pages / Performance report after cutover for any old URLs that still get traffic, and add rules for those.

Test after creating: `curl -sI "https://thementalgain.com/?page_id=3539"` should return `301` with the matching `Location`.
