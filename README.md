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

The homepage hero video is served from the public Vercel Blob store `gemz-hero-media` in Singapore (`sin1`). Its URL is set directly in `index.html`, so the static site does not need a Blob SDK or runtime token.

The local `assets/hero.mp4` copy is ignored to keep it out of future deployments. To replace the video, upload a new file with a unique URL:

```sh
vercel blob put ./path/to/new-hero.mp4 --access public --pathname hero.mp4 --add-random-suffix --content-type video/mp4 --cache-control-max-age 31536000
```

Then update the hero `<source>` URL in `index.html` with the URL returned by the command.

## Supabase and the admin panel

The storefront uses Supabase for its catalog, insights, contact enquiries, site settings, and uploaded media. The admin panel is at `/admin.html`.

1. Create a Supabase project.
2. Add the project URL and anon/public key to `js/supabase-config.js`. The anon key is intended for browser use; never put a `service_role` key in the website.
3. Run `supabase/schema.sql` in the project SQL editor. It creates the tables, public/admin row-level security policies, the `gemz-media` storage bucket, and starter products and articles.
4. Create or invite your administrator in Supabase Authentication. Then run the final commented SQL snippet from `supabase/schema.sql` with that user’s email to grant admin access.
5. Open `/admin.html` and sign in. The admin can manage the product catalog, articles, enquiries, media, and storefront settings.

Public pages continue to show the built-in starter content until Supabase is configured. When connected, they read published products and articles from Supabase; contact form submissions are stored as enquiries. Storage uploads are public-read so product and article media can be shown on the storefront. Database and storage writes require an authenticated user listed in `gemz_admins`.
