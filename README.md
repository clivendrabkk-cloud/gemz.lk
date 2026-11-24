# gemz.lk

Static website project for gemz.lk.

## Project structure

This is a no-build static site. Keep the HTML pages in the repository root so their URLs work directly on static hosting. Shared files are grouped by type:

```text
.
├── index.html                 # Storefront home page
├── about.html                 # Public pages
├── collection.html
├── contact.html
├── insights.html
├── cart.html
├── gemstone.html              # Product detail pages
├── jewellery-product.html
├── login.html
├── admin.html                 # Store admin
├── css/                        # Shared and admin stylesheets
├── js/                         # Storefront, admin, and browser config scripts
├── supabase/
│   └── schema.sql              # Database schema and policies
└── README.md
```

No `.env` file is needed for this layout: the browser loads `js/supabase-config.js` directly. Keep only the Supabase project URL and public anon/publishable key in that file; secret keys and database passwords must stay server-side.

To preview locally, serve the repository root with any static file server, for example `python3 -m http.server 8000`, then open `http://localhost:8000`.

Homepage videos are served from the public Supabase Storage bucket `gemz-media`. In `/admin.html`, open **Site settings**, upload an MP4 or WebM under **Hero and media**, then save site settings. The uploaded URL is used by the homepage video placements. The bucket allows files up to 50 MB; larger videos need to be compressed before uploading.

## Supabase and the admin panel

The storefront uses Supabase for its catalog, insights, contact enquiries, site settings, and uploaded media. The admin panel is at `/admin.html`.

1. Create a Supabase project.
2. Add the project URL and anon/public key to `js/supabase-config.js`. The anon key is intended for browser use; never put a `service_role` key in the website.
3. Run `supabase/schema.sql` in the project SQL editor. It creates the tables, public/admin row-level security policies, the `gemz-media` storage bucket, and starter products and articles. If the project is already set up, run the updated SQL again to add product SEO fields and allow favicon image types; existing setting values are kept, except a retired Vercel Blob URL in `hero_video_url` is cleared.
4. Create or invite your administrator in Supabase Authentication. Then run the final commented SQL snippet from `supabase/schema.sql` with that user’s email to grant admin access.
5. Open `/admin.html` and sign in. The admin can manage the product catalog, articles, enquiries, media, page content, store branding, and SEO settings. Store logos and favicons are uploaded through the public-read `gemz-media` bucket. Site settings are public-read so the storefront can display them; do not store private information there.

Public pages continue to show the built-in starter content until Supabase is configured. When connected, they read published products and articles from Supabase; contact form submissions are stored as enquiries. Storage uploads are public-read so product and article media can be shown on the storefront. Database and storage writes require an authenticated user listed in `gemz_admins`.

SEO titles, descriptions, canonical URLs, robots directives, social cards, and structured store data are applied by storefront JavaScript after public settings load. Since this is a static site, crawlers that do not execute JavaScript may only see the metadata in the original HTML.
