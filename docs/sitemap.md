# Site map

From **TMG site layout.txt** / **TMG rqmts.docx**.

| Page | Route (planned) | Content file |
|------|-----------------|--------------|
| Home | `/` | `content/pages/home.md` |
| Services | `/services/` | `content/pages/services.md` |
| Initial Consultation | `/services/initial-consultation/` | `site/services/initial-consultation/index.html` · copy: `site/text_content/service-initial-consultation.md` |
| Individual Sessions | `/services/individual-sessions/` | `site/services/individual-sessions/index.html` · copy: `site/text_content/service-individual-sessions.md` |
| Online Learning Modules | `/services/online-learning-modules/` | `site/services/online-learning-modules/index.html` · copy: `site/text_content/service-online-learning-modules.md` |
| Team Sessions | `/services/team-sessions/` | `site/services/team-sessions/index.html` · copy: `site/text_content/service-team-sessions.md` |
| My Clients | `/my-clients.html` | `site/my-clients.html` · testimonials, school logos, individual client types |
| About TMG | `/about.html` | `site/about.html` · copy: `site/text_content/about.md` (My Story, CMPC, Instagram & podcast resources) |
| Book Me | `/book-me.html` | `site/book-me.html` · SimplyBook widget |
| Contact | `/contact.html` | `site/contact.html` · Web3Forms contact form |
| Confidentiality | `/confidentiality/` | Not in main menu |

Live site (`site/`): the footer comes from `site/partials/site-footer.html`, baked into every page by `npm run bake:site`. The primary menu is still copied by hand into each page's `<header>`. (`content/config/site.json` holds the menu and footer for the Astro scaffold only.)
