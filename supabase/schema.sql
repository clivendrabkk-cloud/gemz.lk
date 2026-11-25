-- Gemz.lk storefront schema. Run this once in the Supabase SQL editor.
create extension if not exists pgcrypto;

create table if not exists public.gemz_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.is_gemz_admin()
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (select 1 from public.gemz_admins where user_id = auth.uid());
$$;
revoke all on function public.is_gemz_admin() from public;
grant execute on function public.is_gemz_admin() to anon, authenticated;

create table if not exists public.product_categories (
  id uuid primary key default gen_random_uuid(),
  product_type text not null check (product_type in ('gem','jewellery','watch')),
  name text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_type, name)
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  product_type text not null check (product_type in ('gem','jewellery','watch')),
  slug text not null unique,
  name text not null,
  category text not null default '',
  description text not null default '',
  seo_title text not null default '',
  seo_description text not null default '',
  image_url text,
  visual jsonb not null default '{"colors":["#fff3a8","#f2b705","#a86a00"],"background":["#3a2a08","#8a5a12"]}'::jsonb,
  specs jsonb not null default '{}'::jsonb,
  status text not null default 'draft' check (status in ('published','draft','archived')),
  featured boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.products add column if not exists seo_title text not null default '';
alter table public.products add column if not exists seo_description text not null default '';

create or replace function public.sync_products_after_category_rename()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if old.name is distinct from new.name or old.product_type is distinct from new.product_type then
    update public.products
    set category = new.name, product_type = new.product_type, updated_at = now()
    where product_type = old.product_type and category = old.name;
  end if;
  return new;
end;
$$;
drop trigger if exists product_categories_sync_products on public.product_categories;
create trigger product_categories_sync_products
after update of name, product_type on public.product_categories
for each row execute function public.sync_products_after_category_rename();

create or replace function public.prevent_deleting_used_product_category()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if exists (
    select 1 from public.products
    where product_type = old.product_type and category = old.name
  ) then
    raise exception 'This category is used by products. Reassign or delete those products first.';
  end if;
  return old;
end;
$$;
drop trigger if exists product_categories_prevent_used_delete on public.product_categories;
create trigger product_categories_prevent_used_delete
before delete on public.product_categories
for each row execute function public.prevent_deleting_used_product_category();

create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  category text not null default 'Insight',
  excerpt text not null default '',
  content text not null default '',
  cover_image text,
  status text not null default 'draft' check (status in ('published','draft','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text not null default '',
  product_slug text,
  message text not null,
  status text not null default 'new' check (status in ('new','in_progress','resolved')),
  created_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  setting_key text primary key,
  setting_value jsonb not null default '""'::jsonb,
  updated_at timestamptz not null default now()
);

-- Integration secrets are admin-only and are never loaded by public storefront pages.
create table if not exists public.private_site_settings (
  secret_key text primary key,
  secret_value text not null,
  updated_at timestamptz not null default now()
);

alter table public.gemz_admins enable row level security;
alter table public.product_categories enable row level security;
alter table public.products enable row level security;
alter table public.articles enable row level security;
alter table public.inquiries enable row level security;
alter table public.site_settings enable row level security;
alter table public.private_site_settings enable row level security;

drop policy if exists "admins can read own membership" on public.gemz_admins;
create policy "admins can read own membership" on public.gemz_admins
  for select to authenticated using (user_id = auth.uid());

drop policy if exists "product categories are public to read" on public.product_categories;
create policy "product categories are public to read" on public.product_categories
  for select to anon, authenticated using (true);
drop policy if exists "admins manage product categories" on public.product_categories;
create policy "admins manage product categories" on public.product_categories
  for all to authenticated using (public.is_gemz_admin()) with check (public.is_gemz_admin());

drop policy if exists "published products are public" on public.products;
create policy "published products are public" on public.products
  for select to anon, authenticated using (status = 'published' or public.is_gemz_admin());
drop policy if exists "admins manage products" on public.products;
create policy "admins manage products" on public.products
  for all to authenticated using (public.is_gemz_admin()) with check (public.is_gemz_admin());

drop policy if exists "published articles are public" on public.articles;
create policy "published articles are public" on public.articles
  for select to anon, authenticated using (status = 'published' or public.is_gemz_admin());
drop policy if exists "admins manage articles" on public.articles;
create policy "admins manage articles" on public.articles
  for all to authenticated using (public.is_gemz_admin()) with check (public.is_gemz_admin());

drop policy if exists "visitors can send inquiries" on public.inquiries;
create policy "visitors can send inquiries" on public.inquiries
  for insert to anon, authenticated with check (true);
drop policy if exists "admins manage inquiries" on public.inquiries;
create policy "admins manage inquiries" on public.inquiries
  for all to authenticated using (public.is_gemz_admin()) with check (public.is_gemz_admin());

drop policy if exists "settings are public to read" on public.site_settings;
create policy "settings are public to read" on public.site_settings
  for select to anon, authenticated using (true);
drop policy if exists "admins manage settings" on public.site_settings;
create policy "admins manage settings" on public.site_settings
  for all to authenticated using (public.is_gemz_admin()) with check (public.is_gemz_admin());

drop policy if exists "admins manage private site settings" on public.private_site_settings;
create policy "admins manage private site settings" on public.private_site_settings
  for all to authenticated using (public.is_gemz_admin()) with check (public.is_gemz_admin());
revoke all on table public.private_site_settings from public, anon;
grant select, insert, update, delete on public.private_site_settings to authenticated;

grant select on public.products, public.product_categories, public.articles, public.site_settings to anon, authenticated;
grant insert on public.inquiries to anon, authenticated;
grant select, insert, update, delete on public.products, public.product_categories, public.articles, public.site_settings to authenticated;
grant select, update, delete on public.inquiries to authenticated;
grant select on public.gemz_admins to authenticated;

insert into public.products (product_type,slug,name,category,description,visual,specs,status,featured,sort_order) values
('gem','yellow-sapphire','Yellow Sapphire','Yellow Sapphire','Honey-gold corundum with a warm, luminous body colour. Sri Lankan yellow sapphires are celebrated for brilliance and natural, untreated character.','{"colors":["#fff3a8","#f2b705","#a86a00"],"background":["#3a2a08","#8a5a12"]}','{"origin":"Ratnapura, Sri Lanka","hardness":"9","clarity":"Eye-clean to VS","treat":"Unheated available","colour":"Yellow"}','published',true,1),
('gem','white-sapphire','White Sapphire','Other','Colourless corundum with diamond-like sparkle and exceptional durability. A pure, versatile stone for fine jewellery.','{"colors":["#ffffff","#cfe3ff","#8aa6d6"],"background":["#1a2238","#4a5f8f"]}','{"origin":"Elahera, Sri Lanka","hardness":"9","clarity":"Eye-clean","treat":"Natural, untreated","colour":"Colourless"}','published',true,2),
('gem','violet-sapphire','Violet Sapphire','Purple Sapphire','A rare royal violet with shifting purple and blue flashes. Prized by collectors for saturation and soft colour play.','{"colors":["#e6c8ff","#8a4fd0","#41197a"],"background":["#1d0f3a","#5a2f8f"]}','{"origin":"Ratnapura, Sri Lanka","hardness":"9","clarity":"Eye-clean to VS","treat":"Unheated available","colour":"Violet"}','published',true,3),
('gem','vanadium-chrysoberyl','Vanadium Chrysoberyl','Other','An exceptionally rare chrysoberyl coloured by vanadium, showing vivid green with a glassy, electric brilliance.','{"colors":["#d9ffb8","#5fbf3a","#1d6b1f"],"background":["#0f2a14","#2f7a36"]}','{"origin":"Sri Lanka","hardness":"8.5","clarity":"Eye-clean","treat":"Natural, untreated","colour":"Green"}','published',true,4),
('gem','padparadscha','Padparadscha','Padparadscha','The legendary lotus-blossom sapphire — a delicate balance of pink and orange, born in Sri Lanka and sought worldwide.','{"colors":["#ffe0cf","#ff8f6b","#c4452a"],"background":["#3a140c","#b0462e"]}','{"origin":"Sri Lanka","hardness":"9","clarity":"Eye-clean","treat":"Natural, untreated","colour":"Pink-orange"}','published',true,5),
('gem','blue-sapphire','Ceylon Blue Sapphire','Blue Sapphire','Cornflower to royal blue with a sparkling, silky glow. The signature gemstone of Sri Lanka, the island of gems.','{"colors":["#cfe0ff","#2f63e0","#0e2a7a"],"background":["#0a1430","#27399c"]}','{"origin":"Ratnapura, Sri Lanka","hardness":"9","clarity":"Eye-clean to VVS","treat":"Unheated available","colour":"Blue"}','published',true,6),
('gem','spinel','Natural Spinel','Other','Singly refractive and brilliantly saturated, spinel offers vivid pinks and reds with remarkable clarity and rarity.','{"colors":["#ffd0e4","#e0407f","#7a0f3f"],"background":["#2e0a1e","#a02a60"]}','{"origin":"Sri Lanka","hardness":"8","clarity":"Eye-clean","treat":"Natural, untreated","colour":"Pink-red"}','published',true,7),
('gem','alexandrite','Alexandrite','Other','The chameleon gem: green by daylight, raspberry under candlelight. One of the rarest and most collectible stones.','{"colors":["#c8f5e4","#2fa58a","#7a2f78"],"background":["#0c2a28","#5a2f6a"]}','{"origin":"Sri Lanka","hardness":"8.5","clarity":"Eye-clean to SI","treat":"Natural, untreated","colour":"Green to raspberry"}','published',true,8)
on conflict (slug) do nothing;

insert into public.products (product_type,slug,name,category,description,status,featured,sort_order) values
('jewellery','jewellery-rings','Rings','Rings','Fine jewellery crafted with care in Sri Lanka. Contact us for availability and custom details.','published',true,20),
('jewellery','jewellery-pendants','Pendants','Pendants','Gemstone pendants selected and crafted in Sri Lanka. Contact us for availability and custom details.','published',true,21),
('jewellery','jewellery-necklaces','Necklaces','Necklaces','Fine necklaces made to complement natural gemstones. Contact us for availability and custom details.','published',true,22),
('jewellery','jewellery-earrings','Earrings','Earrings','Gemstone earrings available on request. Contact us for current pieces and custom details.','published',true,23),
('jewellery','jewellery-bangle','Bangle','Bangle','Fine gemstone bangles crafted in Sri Lanka. Contact us for availability and custom details.','published',true,24),
('jewellery','jewellery-gent','Gent','Gent','Fine jewellery for him, crafted with natural gemstones. Contact us for availability and custom details.','published',true,25),
('jewellery','jewellery-wedding','Wedding','Wedding','Wedding jewellery featuring natural Sri Lankan gemstones. Contact us for availability and custom details.','published',true,26),
('jewellery','jewellery-bracelets','Bracelets','Bracelets','Gemstone bracelets selected and crafted in Sri Lanka. Contact us for availability and custom details.','published',true,27)
on conflict (slug) do nothing;

-- Keep the managed category list in sync with product records already in the catalog.
insert into public.product_categories (product_type, name, sort_order)
select product_type, category, min(sort_order)
from public.products
where trim(category) <> ''
group by product_type, category
on conflict (product_type, name) do nothing;

insert into public.articles (slug,title,category,excerpt,content,status) values
('read-gemstone-certificate','How to read a gemstone certificate','Guide','What origin, treatment and clarity grades really mean before you buy.','A gemstone certificate records key information about a stone, including its identity, measurements, origin assessment and any treatment detected. Ask the seller to explain each report field and confirm the issuing laboratory.','published'),
('unheated-vs-heated-sapphires','Unheated vs heated sapphires','Education','Understanding treatments and why unheated Ceylon stones command a premium.','Heat treatment is a widely used practice that can improve a sapphire’s colour and clarity. Unheated stones are valued for their natural state, and a reputable laboratory report can help document treatment status.','published'),
('padparadscha-sapphire','Padparadscha: the rarest sapphire','Collector','Colour, origin and the debate around this lotus-blossom treasure.','Padparadscha describes a delicate balance of pink and orange. Colour is central to the designation, and origin and laboratory opinion can matter to collectors.','published'),
('buying-gems-sri-lanka','Buying gems from Sri Lanka','Trade','A buyer’s guide to Ratnapura, Elahera and the island’s gem markets.','Sri Lanka has a long history of gem trading. Buyers should review the stone in suitable lighting, ask clear questions about treatments and provenance, and obtain independent verification for significant purchases.','published'),
('caring-for-fine-gemstones','Caring for your fine gemstones','Care','Cleaning, storage and setting advice to keep stones brilliant for generations.','Store gemstones separately to avoid scratches. Use mild soap and a soft brush for routine cleaning, and ask a jeweller before using ultrasonic or steam cleaning, especially for treated or included stones.','published'),
('natural-gem-value','Why natural gems hold value','Insight','Rarity, provenance and demand across three continents.','Natural gemstones are valued through a combination of rarity, colour, quality, origin, treatment status and market demand. Each stone is individual, so an expert assessment is useful.','published')
on conflict (slug) do nothing;

insert into public.site_settings (setting_key,setting_value) values
('announcement','"Natural Gems & Fine Jewellery from Sri Lanka."'::jsonb),
('hero_eyebrow','"Sri Lanka · Est. 1985"'::jsonb),
('hero_title','"Fine Gems & Jewellery, Made to Last"'::jsonb),
('hero_description','"Discover natural Ceylon gemstones, considered jewellery and exceptional pieces selected with care."'::jsonb),
('hero_video_url','""'::jsonb),
('home_watch_video_url','""'::jsonb),
('home_promo_video_url','""'::jsonb),
('home_promo_title','"Over 40 Years in Gems"'::jsonb),
('contact_email','"info@gemz.lk"'::jsonb),
('contact_phone','"+94 11 234 5678"'::jsonb),
('contact_address','"Colombo, Sri Lanka"'::jsonb),
('meta_description','"Discover natural gemstones and fine jewellery from Sri Lanka, with over 40 years of expertise."'::jsonb)
on conflict (setting_key) do nothing;

-- Clear the retired Vercel Blob hero URL when this schema is reapplied.
update public.site_settings
set setting_value = '""'::jsonb, updated_at = now()
where setting_key = 'hero_video_url'
  and setting_value::text like '%blob.vercel-storage.com%';

insert into public.site_settings (setting_key,setting_value) values
('home_carousel_speed','50'::jsonb),
('home_arrivals_eyebrow','"Just selected"'::jsonb),
('home_arrivals_title','"New Arrivals"'::jsonb),
('home_arrivals_description','"Discover a few of the natural stones now available to enquire about."'::jsonb),
('home_gem_eyebrow','"From Ceylon"'::jsonb),
('home_gem_title','"Gemstone Collection"'::jsonb),
('home_gem_description','"Browse our natural gemstone selection."'::jsonb),
('home_jewellery_eyebrow','"Designed for every occasion"'::jsonb),
('home_jewellery_title','"Jewellery"'::jsonb),
('home_jewellery_description','"Explore rings, pendants, necklaces and more."'::jsonb),
('home_watch_eyebrow','"Time, considered"'::jsonb),
('home_watch_title','"A Watch Worth a Closer Look"'::jsonb),
('home_watch_description','"Explore our watch selection and enquire for availability and details."'::jsonb),
('home_videos_eyebrow','"Stories from Sri Lanka"'::jsonb),
('home_videos_title','"Promotional Videos"'::jsonb),
('home_videos_description','"A closer look at the stones and story behind Gemz.lk."'::jsonb),
('home_video_title','"Natural Gems of Ceylon"'::jsonb),
('collection_eyebrow','"Our Collection"'::jsonb),
('collection_title','"Gems, Jewellery & Watches"'::jsonb),
('collection_description','"Explore gemstones, jewellery and watches from Sri Lanka. Prices are available on request."'::jsonb),
('insights_eyebrow','"Journal"'::jsonb),
('insights_title','"Insights"'::jsonb),
('insights_description','"Guides, education and market stories from the world of natural gemstones."'::jsonb),
('contact_eyebrow','"Get in touch"'::jsonb),
('contact_title','"Contact Us"'::jsonb),
('contact_description','"Tell us what you are looking for and we will respond personally."'::jsonb),
('contact_note','"Placeholder details — replace with your real phone, email and address."'::jsonb),
('about_eyebrow','"Since 1985"'::jsonb),
('about_title','"About Gemz.lk"'::jsonb),
('about_description','"Four decades of expertise in exceptional natural gemstones, from the island of gems to the world."'::jsonb),
('about_story_eyebrow','"Our Story"'::jsonb),
('about_story_title','"Rooted in Ceylon, Trusted Worldwide"'::jsonb),
('about_story_paragraph_1','"Gemz.lk grew from a small family trade in Sri Lanka into a global network spanning three continents, guided by one principle: only authentic natural stones, honestly presented."'::jsonb),
('about_story_paragraph_2','"We work directly with miners and master cutters, selecting stones for colour, clarity and character, and we welcome every client — from first-time buyers to seasoned collectors."'::jsonb),
('about_image_url','""'::jsonb),
('about_image_alt','"Gemstone expertise rooted in Ceylon"'::jsonb),
('about_badge','"Ceylon · Est. 1985"'::jsonb),
('about_values_eyebrow','"Our Values"'::jsonb),
('about_values_title','"What We Stand For"'::jsonb),
('about_value_1_number','"01"'::jsonb),
('about_value_1_title','"Authenticity"'::jsonb),
('about_value_1_description','"100% natural stones with transparent origin and treatment disclosure."'::jsonb),
('about_value_2_number','"02"'::jsonb),
('about_value_2_title','"Expertise"'::jsonb),
('about_value_2_description','"Over 40 years of grading, sourcing and cutting knowledge."'::jsonb),
('about_value_3_number','"03"'::jsonb),
('about_value_3_title','"Trust"'::jsonb),
('about_value_3_description','"Long-term relationships built on honesty, discretion and service."'::jsonb),
('about_milestones_eyebrow','"Milestones"'::jsonb),
('about_milestones_title','"Our Journey"'::jsonb),
('about_milestone_1_year','"1985"'::jsonb),
('about_milestone_1_description','"Founded in Sri Lanka, trading Ratnapura sapphires."'::jsonb),
('about_milestone_2_year','"2000s"'::jsonb),
('about_milestone_2_description','"Expansion into international gem fairs and private clients."'::jsonb),
('about_milestone_3_year','"2010s"'::jsonb),
('about_milestone_3_description','"Presence across three continents and a global buyer network."'::jsonb),
('about_milestone_4_year','"Today"'::jsonb),
('about_milestone_4_description','"Gemz.lk online — Ceylon gems, now one enquiry away."'::jsonb),
('about_cta_title','"Begin your gemstone journey"'::jsonb),
('about_cta_description','"Speak with our team about the perfect stone."'::jsonb),
('about_cta_button','"Contact Us"'::jsonb),
('about_cta_url','"contact.html"'::jsonb),
('footer_tagline','"Authentic natural gemstones sourced in Sri Lanka and delivered worldwide. Established 1985."'::jsonb)
on conflict (setting_key) do nothing;

insert into public.site_settings (setting_key,setting_value) values
('cart_eyebrow','"Your selection"'::jsonb),
('cart_title','"Inquiry Cart"'::jsonb),
('cart_description','"Prices are on request. Send us your selection and we will reply with details."'::jsonb),
('cart_empty_title','"Your inquiry cart is empty"'::jsonb),
('cart_empty_description','"Browse the collection and add pieces you like."'::jsonb),
('cart_explore_button','"Explore the collection"'::jsonb),
('cart_name_label','"Name"'::jsonb),
('cart_email_label','"Email"'::jsonb),
('cart_phone_label','"Phone"'::jsonb),
('cart_message_label','"Message"'::jsonb),
('cart_price_label','"Price on Request"'::jsonb),
('cart_remove_label','"Remove"'::jsonb),
('cart_submit_label','"Send enquiry"'::jsonb),
('cart_default_message','"I am interested in: {products}"'::jsonb),
('cart_success_message','"Thank you. Your enquiry has been sent to our team."'::jsonb),
('account_eyebrow','"Welcome back"'::jsonb),
('account_title','"Account Login"'::jsonb),
('account_email_label','"Email"'::jsonb),
('account_password_label','"Password"'::jsonb),
('account_submit_label','"Sign In"'::jsonb),
('account_note','"You can send an enquiry without an account."'::jsonb),
('account_cart_link','"Open your inquiry cart"'::jsonb)
on conflict (setting_key) do nothing;

insert into public.site_settings (setting_key,setting_value) values
('nav_home','"Home"'::jsonb),
('nav_collection','"Our Gemstones"'::jsonb),
('nav_gemstones','"GEM"'::jsonb),
('nav_jewellery','"JEWELLERY"'::jsonb),
('nav_all_jewellery','"All Jewellery"'::jsonb),
('nav_watches','"WATCH"'::jsonb),
('nav_about','"About us"'::jsonb),
('nav_insights','"Insights"'::jsonb),
('nav_contact','"Contact Us"'::jsonb),
('nav_account','"Account"'::jsonb),
('footer_explore_title','"Explore"'::jsonb),
('footer_account_title','"Account"'::jsonb),
('footer_contact_title','"Contact"'::jsonb),
('footer_copyright','"All rights reserved."'::jsonb),
('footer_motto','"Natural · Authentic · Ceylon"'::jsonb),
('contact_visit_title','"Visit & Connect"'::jsonb),
('contact_phone_label','"Call"'::jsonb),
('contact_email_label','"Email"'::jsonb),
('contact_location_label','"Location"'::jsonb),
('store_name','"Gemz.lk"'::jsonb),
('brand_subtitle','"SRI LANKA"'::jsonb),
('store_logo_url','""'::jsonb),
('store_favicon_url','""'::jsonb),
('seo_title_template','"{page} | {site}"'::jsonb),
('seo_og_title','""'::jsonb),
('seo_og_description','""'::jsonb),
('seo_keywords','"Ceylon gemstones, natural gemstones, Sri Lankan sapphires, fine jewellery"'::jsonb),
('seo_site_url','""'::jsonb),
('seo_language','"en"'::jsonb),
('seo_robots','"index,follow"'::jsonb),
('seo_robots_txt','""'::jsonb),
('seo_twitter_handle','""'::jsonb),
('seo_google_verification','""'::jsonb),
('seo_bing_verification','""'::jsonb),
('seo_og_image','""'::jsonb),
('seo_theme_color','"#171b29"'::jsonb),
('seo_ga4_id','""'::jsonb),
('seo_gtm_id','""'::jsonb),
('seo_adsense_id','""'::jsonb),
('seo_facebook_pixel_id','""'::jsonb),
('seo_capi_test_code','""'::jsonb),
('seo_ads_txt_lines','""'::jsonb),
('seo_custom_head','""'::jsonb),
('seo_custom_footer','""'::jsonb),
('seo_social_facebook','""'::jsonb),
('seo_social_instagram','""'::jsonb),
('seo_social_x','""'::jsonb),
('seo_social_youtube','""'::jsonb),
('seo_social_linkedin','""'::jsonb),
('seo_social_pinterest','""'::jsonb),
('seo_social_tiktok','""'::jsonb),
('seo_social_whatsapp','""'::jsonb),
('seo_schema_type','"JewelryStore"'::jsonb),
('seo_business_name','"Gemz.lk"'::jsonb),
('seo_business_email','"info@gemz.lk"'::jsonb),
('seo_business_phone','"+94 11 234 5678"'::jsonb),
('seo_business_address','"Colombo, Sri Lanka"'::jsonb),
('seo_business_country','"Sri Lanka"'::jsonb),
('seo_home_title','"Fine Gems & Jewellery from Sri Lanka | Gemz.lk"'::jsonb),
('seo_home_description','"Discover natural gemstones and fine jewellery from Sri Lanka, with over 40 years of expertise."'::jsonb),
('seo_collection_title','"Gemstones, Jewellery & Watches | Gemz.lk"'::jsonb),
('seo_collection_description','"Explore natural Sri Lankan gemstones, fine jewellery and watches, selected with care by Gemz.lk."'::jsonb),
('seo_insights_title','"Gemstone Guides & Insights | Gemz.lk"'::jsonb),
('seo_insights_description','"Read gemstone guides, education and market stories from the world of natural Ceylon gems."'::jsonb),
('seo_contact_title','"Contact Gemz.lk | Enquire About Natural Gems"'::jsonb),
('seo_contact_description','"Contact Gemz.lk for help choosing natural gemstones, fine jewellery and watches from Sri Lanka."'::jsonb),
('seo_about_title','"About Gemz.lk | Ceylon Gemstone Expertise Since 1985"'::jsonb),
('seo_about_description','"Learn about Gemz.lk and our family history in natural Sri Lankan gemstones and fine jewellery."'::jsonb),
('seo_product_title','"Gemstone & Jewellery Details | Gemz.lk"'::jsonb),
('seo_product_description','"Explore product details and specifications for natural gemstones and fine jewellery from Gemz.lk."'::jsonb),
('seo_cart_title','"Your Enquiry Selection | Gemz.lk"'::jsonb),
('seo_cart_description','"Review your selected gemstones and jewellery, then send Gemz.lk an enquiry."'::jsonb),
('seo_login_title','"Customer Account | Gemz.lk"'::jsonb),
('seo_login_description','"Sign in to your Gemz.lk customer account."'::jsonb)
on conflict (setting_key) do nothing;

insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('gemz-media','gemz-media',true,52428800,array['image/jpeg','image/png','image/webp','image/gif','image/x-icon','image/vnd.microsoft.icon','video/mp4','video/webm'])
on conflict (id) do update set public=true, file_size_limit=excluded.file_size_limit, allowed_mime_types=excluded.allowed_mime_types;

drop policy if exists "Gemz media public read" on storage.objects;
create policy "Gemz media public read" on storage.objects
  for select to anon, authenticated using (bucket_id = 'gemz-media');
drop policy if exists "Gemz admins upload media" on storage.objects;
create policy "Gemz admins upload media" on storage.objects
  for insert to authenticated with check (bucket_id = 'gemz-media' and public.is_gemz_admin());
drop policy if exists "Gemz admins update media" on storage.objects;
create policy "Gemz admins update media" on storage.objects
  for update to authenticated using (bucket_id = 'gemz-media' and public.is_gemz_admin())
  with check (bucket_id = 'gemz-media' and public.is_gemz_admin());
drop policy if exists "Gemz admins delete media" on storage.objects;
create policy "Gemz admins delete media" on storage.objects
  for delete to authenticated using (bucket_id = 'gemz-media' and public.is_gemz_admin());

-- After creating an Auth user for the site owner, run this once with their email:
-- insert into public.gemz_admins (user_id)
-- select id from auth.users where email = 'owner@example.com'
-- on conflict do nothing;
