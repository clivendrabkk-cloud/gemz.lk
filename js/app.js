/* gemz.lk — public data, shared layout, inquiry cart, and lightweight interactions */
let GEMS = [
  {slug:'yellow-sapphire',name:'Yellow Sapphire',c:['#fff3a8','#f2b705','#a86a00'],bg:['#3a2a08','#8a5a12'],origin:'Ratnapura, Sri Lanka',hardness:'9',clarity:'Eye-clean to VS',treat:'Unheated available',colour:'Yellow',
   text:'Honey-gold corundum with a warm, luminous body colour. Sri Lankan yellow sapphires are celebrated for brilliance and natural, untreated character.'},
  {slug:'white-sapphire',name:'White Sapphire',c:['#ffffff','#cfe3ff','#8aa6d6'],bg:['#1a2238','#4a5f8f'],origin:'Elahera, Sri Lanka',hardness:'9',clarity:'Eye-clean',treat:'Natural, untreated',colour:'Colourless',
   text:'Colourless corundum with diamond-like sparkle and exceptional durability. A pure, versatile stone for fine jewellery.'},
  {slug:'violet-sapphire',name:'Violet Sapphire',c:['#e6c8ff','#8a4fd0','#41197a'],bg:['#1d0f3a','#5a2f8f'],origin:'Ratnapura, Sri Lanka',hardness:'9',clarity:'Eye-clean to VS',treat:'Unheated available',colour:'Violet',
   text:'A rare royal violet with shifting purple and blue flashes. Prized by collectors for saturation and soft colour play.'},
  {slug:'vanadium-chrysoberyl',name:'Vanadium Chrysoberyl',c:['#d9ffb8','#5fbf3a','#1d6b1f'],bg:['#0f2a14','#2f7a36'],origin:'Sri Lanka',hardness:'8.5',clarity:'Eye-clean',treat:'Natural, untreated',colour:'Green',
   text:'An exceptionally rare chrysoberyl coloured by vanadium, showing vivid green with a glassy, electric brilliance.'},
  {slug:'padparadscha',name:'Padparadscha',c:['#ffe0cf','#ff8f6b','#c4452a'],bg:['#3a140c','#b0462e'],origin:'Sri Lanka',hardness:'9',clarity:'Eye-clean',treat:'Natural, untreated',colour:'Pink-orange',
   text:'The legendary lotus-blossom sapphire — a delicate balance of pink and orange, born in Sri Lanka and sought worldwide.'},
  {slug:'blue-sapphire',name:'Ceylon Blue Sapphire',c:['#cfe0ff','#2f63e0','#0e2a7a'],bg:['#0a1430','#27399c'],origin:'Ratnapura, Sri Lanka',hardness:'9',clarity:'Eye-clean to VVS',treat:'Unheated available',colour:'Blue',
   text:'Cornflower to royal blue with a sparkling, silky glow. The signature gemstone of Sri Lanka, the island of gems.'},
  {slug:'spinel',name:'Natural Spinel',c:['#ffd0e4','#e0407f','#7a0f3f'],bg:['#2e0a1e','#a02a60'],origin:'Sri Lanka',hardness:'8',clarity:'Eye-clean',treat:'Natural, untreated',colour:'Pink-red',
   text:'Singly refractive and brilliantly saturated, spinel offers vivid pinks and reds with remarkable clarity and rarity.'},
  {slug:'alexandrite',name:'Alexandrite',c:['#c8f5e4','#2fa58a','#7a2f78'],bg:['#0c2a28','#5a2f6a'],origin:'Sri Lanka',hardness:'8.5',clarity:'Eye-clean to SI',treat:'Natural, untreated',colour:'Green to raspberry',
   text:'The chameleon gem: green by daylight, raspberry under candlelight. One of the rarest and most collectible stones.'}
];
let GEM_CATEGORIES = [
  {label:'Blue Sapphire',match:g=>/blue sapphire/i.test(g.name)},
  {label:'Ruby',match:g=>/ruby/i.test(g.name)},
  {label:'Pink Sapphire',match:g=>/pink sapphire/i.test(g.name)},
  {label:'Yellow Sapphire',match:g=>/yellow sapphire/i.test(g.name)},
  {label:'Purple Sapphire',match:g=>/purple|violet sapphire/i.test(g.name)},
  {label:'Teal Sapphire',match:g=>/teal sapphire/i.test(g.name)},
  {label:'Padparadscha',match:g=>/padparadscha/i.test(g.name)},
  {label:'Star Sapphire',match:g=>/star sapphire/i.test(g.name)},
  {label:"Cat's Eye",match:g=>/cat.?s eye/i.test(g.name)},
  {label:'Other',match:g=>!/blue sapphire|ruby|pink sapphire|yellow sapphire|purple sapphire|violet sapphire|teal sapphire|padparadscha|star sapphire|cat.?s eye/i.test(g.name)}
];
let JEWELLERY_CATEGORIES = ['Rings','Pendants','Necklaces','Earrings','Bangle','Gent','Wedding','Bracelets'];
let JEWELLERY_PRODUCTS = [];
let WATCH_PRODUCTS = [];
const JEWELLERY_DETAIL_FIELDS = [
  'Metal','Weight','Gemstones','Gemstone Weight','Number of Diamonds','Diamond Weight',
  'Diamond Colour','Diamond Clarity','Setting type','Final finishing','Dimensions','Comment'
];
let ARTICLES = [
  {t:'How to read a gemstone certificate',k:'Guide',g:0,p:'What origin, treatment and clarity grades really mean before you buy.'},
  {t:'Unheated vs heated sapphires',k:'Education',g:5,p:'Understanding treatments and why unheated Ceylon stones command a premium.'},
  {t:'Padparadscha: the rarest sapphire',k:'Collector',g:4,p:'Colour, origin and the debate around this lotus-blossom treasure.'},
  {t:'Buying gems from Sri Lanka',k:'Trade',g:2,p:'A buyer’s guide to Ratnapura, Elahera and the island’s gem markets.'},
  {t:'Caring for your fine gemstones',k:'Care',g:1,p:'Cleaning, storage and setting advice to keep stones brilliant for generations.'},
  {t:'Why natural gems hold value',k:'Insight',g:3,p:'Rarity, provenance and demand across three continents.'}
];
let SITE_SETTINGS = {};

const htmlEscape=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
function publicMediaURL(value){
  const url=String(value||'').trim();
  return /^(https?:\/\/|\/)/i.test(url)&&!/^javascript:/i.test(url)?url:'';
}
function productFromRow(row){
  const specs=row.specs||{},visual=row.visual||{};
  const validColors=(items,fallback)=>Array.isArray(items)&&items.length===fallback.length&&items.every(item=>/^#[0-9a-f]{3,8}$/i.test(item))?items:fallback;
  const colors=validColors(visual.colors,['#fff3a8','#f2b705','#a86a00']);
  const background=validColors(visual.background,['#3a2a08','#8a5a12']);
  return { ...specs, specs, slug:row.slug, name:row.name, type:row.product_type, category:row.category||'',
    text:row.description||'', description:row.description||'', image_url:publicMediaURL(row.image_url),
    seo_title:row.seo_title||'',seo_description:row.seo_description||'',status:row.status, featured:row.featured, sort_order:row.sort_order,
    c:colors,bg:background,visual:{colors,background} };
}
async function fetchPublicTable(table,query){
  const config=window.GEMZ_SUPABASE_CONFIG;
  if(!config?.url||!config?.anonKey)throw new Error('Supabase public configuration is missing.');
  const controller=new AbortController();
  const timeout=window.setTimeout(()=>controller.abort(),6000);
  try{
    const params=new URLSearchParams(query);
    const response=await fetch(`${config.url.replace(/\/+$/,'')}/rest/v1/${table}?${params}`,{
      headers:{apikey:config.anonKey},signal:controller.signal
    });
    if(!response.ok)throw new Error(`Supabase ${table} request failed (${response.status}).`);
    return await response.json();
  }finally{window.clearTimeout(timeout)}
}
async function createInquiry(record){
  const config=window.GEMZ_SUPABASE_CONFIG;
  if(!config?.url||!config?.anonKey)throw new Error('Enquiry service is unavailable.');
  const controller=new AbortController();
  const timeout=window.setTimeout(()=>controller.abort(),15000);
  try{
    const response=await fetch(`${config.url.replace(/\/+$/,'')}/rest/v1/inquiries`,{
      method:'POST',
      headers:{apikey:config.anonKey,'Content-Type':'application/json',Prefer:'return=minimal'},
      body:JSON.stringify(record),signal:controller.signal
    });
    if(!response.ok)throw new Error(`Enquiry request failed (${response.status}).`);
  }finally{window.clearTimeout(timeout)}
}
async function loadPublicContent(){
  try{
    const [productResult,articleResult,settingsResult]=await Promise.allSettled([
      fetchPublicTable('products',{select:'*',status:'eq.published',order:'sort_order.asc,created_at.asc'}),
      fetchPublicTable('articles',{select:'*',status:'eq.published',order:'created_at.desc'}),
      fetchPublicTable('site_settings',{select:'setting_key,setting_value'})
    ]);
    const products=productResult.status==='fulfilled'?productResult.value:null;
    const articles=articleResult.status==='fulfilled'?articleResult.value:null;
    const settings=settingsResult.status==='fulfilled'?settingsResult.value:null;
    if(products){
      const rows=products.map(productFromRow);
      GEMS=rows.filter(row=>row.type==='gem');
      JEWELLERY_PRODUCTS=rows.filter(row=>row.type==='jewellery');
      WATCH_PRODUCTS=rows.filter(row=>row.type==='watch');
      const gemCategories=[...new Set(GEMS.map(row=>row.category).filter(Boolean))];
      if(gemCategories.length)GEM_CATEGORIES=gemCategories.map(label=>({label,match:gem=>gem.category===label}));
      const categories=[...new Set(JEWELLERY_PRODUCTS.map(row=>row.category).filter(Boolean))];
      if(categories.length)JEWELLERY_CATEGORIES=categories;
    }
    if(articles) ARTICLES=articles.map(row=>({
      t:row.title,k:row.category||'Insight',g:0,p:row.excerpt||'',slug:row.slug,content:row.content||'',
      image_url:publicMediaURL(row.cover_image)
    }));
    if(settings) SITE_SETTINGS=Object.fromEntries(settings.map(row=>[row.setting_key,row.setting_value]));
    const loaded=Boolean(products||articles||settings);
    if(!loaded)console.warn('Gemz public content could not be loaded from Supabase.');
    return loaded;
  }catch(error){console.warn('Gemz public content could not be loaded from Supabase.',error)}
  return false;
}
// Public pages render from the built-in content immediately. Supabase refreshes in the
// background and notifies pages when it is ready, so network latency never blocks first paint.
window.GEMZ_READY=Promise.resolve();
window.GEMZ_CONTENT_PENDING=true;
let contentSettled=false;
function announcePublicContent(loaded){
  if(!window.GEMZ_CONTENT_PENDING&&window.GEMZ_CONTENT_LOADED===loaded)return;
  window.GEMZ_CONTENT_PENDING=false;
  window.GEMZ_CONTENT_LOADED=loaded;
  window.dispatchEvent(new CustomEvent('gemz-content-updated',{detail:{loaded}}));
}
const contentFallbackTimer=window.setTimeout(()=>{
  if(!contentSettled)announcePublicContent(false);
},2500);
window.GEMZ_CONTENT_READY=loadPublicContent().then(loaded=>{
  contentSettled=true;
  window.clearTimeout(contentFallbackTimer);
  announcePublicContent(loaded);
  return loaded;
});

/* Faceted gem SVG */
function gemSVG(g,uid){
  if(!g)return '';
  const [a,b,c]=g.c, id='g'+uid;
  return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs><linearGradient id="${id}a" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset=".55" stop-color="${b}"/><stop offset="1" stop-color="${c}"/></linearGradient>
  <linearGradient id="${id}b" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}" stop-opacity=".9"/><stop offset="1" stop-color="${c}"/></linearGradient></defs>
  <polygon points="50,30 150,30 185,75 100,180 15,75" fill="url(#${id}a)"/>
  <polygon points="50,30 100,75 15,75" fill="${a}" opacity=".55"/>
  <polygon points="150,30 100,75 185,75" fill="${b}" opacity=".5"/>
  <polygon points="50,30 150,30 100,75" fill="#fff" opacity=".35"/>
  <polygon points="15,75 100,75 100,180" fill="url(#${id}b)" opacity=".85"/>
  <polygon points="185,75 100,75 100,180" fill="${c}" opacity=".55"/>
  <polygon points="50,30 100,75 150,30" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="1"/>
  <polyline points="15,75 100,75 185,75" fill="none" stroke="#fff" stroke-opacity=".4"/>
  <polygon points="62,42 88,42 76,58" fill="#fff" opacity=".7"/></svg>`;
}
const bgOf=g=>`linear-gradient(145deg,${g.bg[0]},${g.bg[1]})`;
const icon={
  phone:'<svg viewBox="0 0 24 24"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/></svg>',
  mail:'<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>',
  pin:'<svg viewBox="0 0 24 24"><path d="M12 21s7-6.2 7-11a7 7 0 0 0-14 0c0 4.8 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>',
  bag:'<svg viewBox="0 0 24 24"><path d="M5 8h14l-1 12H6L5 8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>',
  user:'<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>',
  arrow:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14m-6-6 6 6-6 6"/></svg>'
};

/* Cart (inquiry list) */
const Cart={
  get(){try{const items=JSON.parse(localStorage.getItem('gemz_cart')||'[]');return Array.isArray(items)?items.filter(item=>typeof item==='string'):[]}catch(e){return[]}},
  set(v){try{localStorage.setItem('gemz_cart',JSON.stringify(v))}catch(e){}this.badge()},
  add(s){const c=this.get();if(!c.includes(s))c.push(s);this.set(c)},
  remove(s){this.set(this.get().filter(x=>x!==s))},
  badge(){document.querySelectorAll('.cart-count').forEach(e=>e.textContent=this.get().length)}
};

/* Shared layout */
let ACTIVE_PAGE='home';
function layout(active){
  ACTIVE_PAGE=active;
  document.body.style.overflow='';
  const label=(key,fallback)=>htmlEscape(SITE_SETTINGS[key]||fallback);
  const L=(h,t,k)=>`<a href="${h}" class="${active===k?'active':''}">${t}</a>`;
  const storeName=htmlEscape(SITE_SETTINGS.store_name||'GEMZ');
  const brandMark=(variant='dark')=>`<img class="logo-image" src="${variant==='light'?'assets/gemz-logo-light.png':'assets/gemz-logo.png'}" data-dark-src="assets/gemz-logo.png" data-light-src="assets/gemz-logo-light.png" alt="" width="399" height="183" fetchpriority="high" decoding="sync">`;
  const email=htmlEscape(SITE_SETTINGS.contact_email||'info@gemz.lk');
  const phone=htmlEscape(SITE_SETTINGS.contact_phone||'+94 11 234 5678');
  const address=htmlEscape(SITE_SETTINGS.contact_address||'Colombo, Sri Lanka');
  const announce=htmlEscape(SITE_SETTINGS.announcement||'Natural Gems & Fine Jewellery from Sri Lanka.');
  const navHome=label('nav_home','Home'),navCollection=label('nav_collection','Our Gemstones'),navGems=label('nav_gemstones','GEM'),navJewellery=label('nav_jewellery','JEWELLERY'),navAllJewellery=label('nav_all_jewellery','All Jewellery'),navWatches=label('nav_watches','WATCH'),navAbout=label('nav_about','About us'),navInsights=label('nav_insights','Insights'),navContact=label('nav_contact','Contact Us'),navAccount=label('nav_account','Account');
  document.getElementById('site-header').innerHTML=`
  <div class="announce"><span class="sr-only">${announce}</span><div class="announce-track" aria-hidden="true">${Array(8).fill(`<span>${announce}</span><span>Over 40 Years of Ceylon Gem Expertise.</span>`).join('')}</div></div>
  <header class="header" id="hdr"><div class="header-in">
    <nav class="nav" aria-label="Main navigation">${L('index.html',navHome,'home')}${L('collection.html',navCollection,'collection')}<a class="nav-gem ${active==='collection'?'active':''}" href="collection.html?section=gem">${navGems}</a><details class="nav-drop"><summary class="${active==='collection'?'active':''}">${navJewellery}</summary><div class="nav-dropdown"><a href="collection.html?section=jewellery">${navAllJewellery}</a>${JEWELLERY_CATEGORIES.map(category=>`<a href="${jewelleryCategoryURL(category)}">${htmlEscape(category)}</a>`).join('')}</div></details>${L('collection.html?section=watch',navWatches,'collection')}${L('about.html',navAbout,'about')}</nav>
    <button class="burger" id="burger" aria-label="Open menu" aria-controls="mnav" aria-expanded="false"><i></i><i></i><i></i></button>
    <a href="index.html" class="logo logo-only" aria-label="${storeName} home">${brandMark(active==='home'?'dark':'light')}</a>
    <div class="utils">
      <a href="insights.html" class="txt">${navInsights}</a><a href="contact.html" class="txt">${navContact}</a>
      <a class="ico opt" href="tel:${phone.replace(/[^+\d]/g,'')}" aria-label="${label('contact_phone_label','Call')}">${icon.phone}</a>
      <a class="ico opt" href="mailto:${email}" aria-label="${label('contact_email_label','Email')}">${icon.mail}</a>
      <a class="ico opt" href="contact.html" aria-label="${label('contact_location_label','Location')}">${icon.pin}</a>
      <a class="ico opt" href="login.html" aria-label="${navAccount}">${icon.user}</a>
      <a class="ico" href="cart.html" aria-label="Inquiry cart">${icon.bag}<span class="cart-count">0</span></a>
    </div></div></header>
  <div class="mobile-nav" id="mnav" inert><a href="index.html">${navHome}</a><a href="collection.html">${navCollection}</a><a href="collection.html?section=gem">${navGems}</a><div class="mobile-jewellery"><a class="mobile-jewellery-title" href="collection.html?section=jewellery">${navJewellery}</a><div class="mobile-jewellery-subnav">${JEWELLERY_CATEGORIES.map(category=>`<a href="${jewelleryCategoryURL(category)}">${htmlEscape(category)}</a>`).join('')}</div></div><a href="collection.html?section=watch">${navWatches}</a><a href="about.html">${navAbout}</a><a href="insights.html">${navInsights}</a><a href="contact.html">${navContact}</a><a href="login.html">${navAccount}</a></div>`;
  document.getElementById('site-footer').innerHTML=`<footer class="footer"><div class="wrap"><div class="foot-grid">
    <div class="foot-brand"><a href="index.html" class="logo logo-only footer-logo" aria-label="${storeName} home">${brandMark('dark')}</a><p data-setting="footer_tagline">Authentic natural gemstones sourced in Sri Lanka and delivered worldwide. Established 1985.</p></div>
    <div><h4>${label('footer_explore_title','Explore')}</h4><a href="index.html">${navHome}</a><a href="collection.html">${navCollection}</a><a href="about.html">${navAbout}</a><a href="insights.html">${navInsights}</a></div>
    <div><h4>${label('footer_account_title','Account')}</h4><a href="cart.html">Inquiry Cart</a><a href="login.html">${navAccount}</a><a href="contact.html">${navContact}</a></div>
    <div><h4>${label('footer_contact_title','Contact')}</h4><a href="mailto:${email}">${email}</a><a href="tel:${phone.replace(/[^+\d]/g,'')}">${phone}</a><a href="contact.html">${address}</a></div>
  </div><div class="foot-bot"><span>© ${new Date().getFullYear()} · ${label('footer_copyright','All rights reserved.')}</span><span>${label('footer_motto','Natural · Authentic · Ceylon')}</span></div></div></footer>`;
  const b=document.getElementById('burger'),m=document.getElementById('mnav');
  const setMenuOpen=open=>{
    b.classList.toggle('open',open);
    b.setAttribute('aria-expanded',String(open));
    b.setAttribute('aria-label',open?'Close menu':'Open menu');
    m.classList.toggle('open',open);
    m.inert=!open;
    document.body.style.overflow=open?'hidden':'';
  };
  b.onclick=()=>setMenuOpen(b.getAttribute('aria-expanded')!=='true');
  m.onclick=event=>{if(event.target.closest('a'))setMenuOpen(false)};
  document.onkeydown=event=>{if(event.key==='Escape'&&b.getAttribute('aria-expanded')==='true')setMenuOpen(false)};
  Cart.badge();
}

function productDetailURL(product){
  return product.type==='jewellery'||product.type==='watch'?`jewellery-product.html?slug=${encodeURIComponent(product.slug)}`:`gemstone.html?slug=${encodeURIComponent(product.slug)}`;
}
function cardHTML(g,i){
  const href=productDetailURL(g);
  if(g.image_url)return `<a class="card" href="${href}" data-tilt><div class="frame" style="background:${bgOf(g)}"><img src="${htmlEscape(g.image_url)}" alt="${htmlEscape(g.name)}" loading="lazy" decoding="async"></div><div class="card-body"><h3>${htmlEscape(g.name)}</h3><span class="tag">Price on Request</span></div></a>`;
  const art=g.type==='jewellery'?jewelleryArt(g.category):g.type==='watch'?'<span class="watch-glyph" aria-hidden="true">⌚</span>':gemSVG(g,'c'+i+Math.random().toString(36).slice(2,5));
  return `<a class="card" href="${href}" data-tilt>
  <div class="frame" style="background:${bgOf(g)}">${art}</div>
  <div class="card-body"><h3>${htmlEscape(g.name)}</h3><span class="tag">Price on Request</span></div></a>`;
}

function jewelleryCategoryURL(category){
  return `collection.html?section=jewellery&category=${encodeURIComponent(category)}`;
}

function jewelleryArt(category){
  const art={
    Rings:'<ellipse cx="120" cy="144" rx="60" ry="35" stroke-width="14"/><path d="M98 85 120 58l22 27-22 35z" stroke-width="5"/>',
    Pendants:'<path d="M82 42c2 49 18 64 38 82 20-18 36-33 38-82" stroke-width="7"/><path d="m120 122 28 30-28 48-28-48z" stroke-width="5"/>',
    Necklaces:'<path d="M48 50c6 118 38 158 72 158s66-40 72-158" stroke-width="7"/><path d="m120 173 19 20-19 34-19-34z" stroke-width="5"/>',
    Earrings:'<path d="M78 58v28m64-28v28" stroke-width="6"/><circle cx="78" cy="139" r="34" stroke-width="7"/><circle cx="142" cy="139" r="34" stroke-width="7"/>',
    Bangle:'<ellipse cx="120" cy="128" rx="62" ry="82" stroke-width="14"/><path d="m120 36 15 21-15 22-15-22z" stroke-width="5"/>',
    Gent:'<path d="M72 118h96l-9 40H81z" stroke-width="8"/><path d="M92 118c0-46 56-46 56 0" stroke-width="8"/><path d="m120 128 18 16-18 20-18-20z" stroke-width="4"/>',
    Wedding:'<ellipse cx="120" cy="144" rx="59" ry="34" stroke-width="12"/><path d="m120 65 27 31-27 31-27-31z" stroke-width="6"/><path d="M120 54v-9" stroke-width="5"/>',
    Bracelets:'<path d="M60 93c32-31 88-31 120 0M60 159c32 31 88 31 120 0" stroke-width="9"/><path d="M60 93c-19 20-19 46 0 66m120-66c19 20 19 46 0 66" stroke-width="9"/><circle cx="120" cy="126" r="11" stroke-width="5"/>'
  };
  return `<svg viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><g fill="none" stroke="#e8c77f" stroke-linecap="round" stroke-linejoin="round">${art[category]||art.Rings}</g><circle cx="120" cy="120" r="105" fill="none" stroke="rgba(255,255,255,.14)" stroke-width="1"/></svg>`;
}

function jewelleryCardHTML(category){
  const product=JEWELLERY_PRODUCTS.find(item=>item.category===category);
  const href=product?`jewellery-product.html?slug=${encodeURIComponent(product.slug)}`:jewelleryCategoryURL(category);
  const art=product?.image_url?`<img src="${htmlEscape(product.image_url)}" alt="${htmlEscape(category)}" loading="lazy" decoding="async">`:jewelleryArt(category);
  return `<a class="jewellery-card" href="${href}"><div class="jewellery-art">${art}</div><div class="jewellery-card-body"><h3>${htmlEscape(category)}</h3><span class="tag">Explore</span></div></a>`;
}

/* Effects use native browser APIs so the storefront does not depend on a motion CDN. */
function initTilt(root=document){
  if(matchMedia('(prefers-reduced-motion:reduce)').matches||!matchMedia('(hover:hover) and (pointer:fine)').matches)return;
  root.querySelectorAll('[data-tilt]:not([data-tilt-ready])').forEach(card=>{
    card.dataset.tiltReady='true';
    card.addEventListener('pointermove',event=>{
      const rect=card.getBoundingClientRect();
      const x=(event.clientX-rect.left)/rect.width-.5;
      const y=(event.clientY-rect.top)/rect.height-.5;
      card.style.transform=`perspective(900px) rotateX(${-y*5}deg) rotateY(${x*5}deg)`;
    });
    card.addEventListener('pointerleave',()=>{card.style.transform=''});
  });
}
function initViewer(){
  const viewer=document.querySelector('.viewer');
  const visual=viewer?.querySelector('.gem3d');
  if(!viewer||!visual||viewer.dataset.dragReady)return;
  viewer.dataset.dragReady='true';
  let rx=-10,ry=0,lastX=0,lastY=0,dragging=false;
  const paint=()=>{visual.style.transform=`perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)`};
  paint();
  viewer.addEventListener('pointerdown',event=>{
    if(event.button!==0)return;
    dragging=true;lastX=event.clientX;lastY=event.clientY;
    viewer.setPointerCapture(event.pointerId);
  });
  viewer.addEventListener('pointermove',event=>{
    if(!dragging)return;
    ry+=(event.clientX-lastX)*.6;
    rx=Math.max(-50,Math.min(50,rx-(event.clientY-lastY)*.4));
    lastX=event.clientX;lastY=event.clientY;paint();
  });
  const stop=()=>{dragging=false};
  viewer.addEventListener('pointerup',stop);
  viewer.addEventListener('pointercancel',stop);
}
function loadLazyVideo(video){
  const source=video.querySelector('source');
  const url=source?.dataset.src;
  if(!source||!url)return;
  let resolvedURL;
  try{resolvedURL=new URL(url,document.baseURI).href}catch(error){return}
  if(source.src!==resolvedURL){source.src=url;video.load()}
  const reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;
  if(video.dataset.autoplay==='true'&&!reduced&&!navigator.connection?.saveData){
    const playback=video.play();
    if(playback?.catch)playback.catch(()=>{});
  }
}
function initLazyVideos(){
  const videos=[...document.querySelectorAll('video[data-lazy-video]:not([data-video-observed])')];
  if(!videos.length)return;
  videos.forEach(video=>{
    video.dataset.videoObserved='true';
    video.addEventListener('play',()=>loadLazyVideo(video),{once:true});
  });
  if('IntersectionObserver' in window){
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(!entry.isIntersecting)return;
      loadLazyVideo(entry.target);observer.unobserve(entry.target);
    }),{rootMargin:'300px'});
    videos.forEach(video=>observer.observe(video));
  }else{
    window.setTimeout(()=>videos.forEach(loadLazyVideo),1200);
  }
}
function initFX(){
  const header=document.getElementById('hdr'),hero=document.querySelector('.hero');
  if(header&&hero&&!header.dataset.themeReady){
    header.dataset.themeReady='true';
    const update=()=>{
      const dark=scrollY<hero.offsetHeight-120;
      header.classList.toggle('dark',dark);
      const logo=header.querySelector('.logo-image');
      const src=dark?logo?.dataset.darkSrc:logo?.dataset.lightSrc;
      if(logo&&src&&logo.getAttribute('src')!==src)logo.src=src;
    };
    update();window.addEventListener('scroll',update,{passive:true});
  }
  initTilt();initViewer();initLazyVideos();
}
function onPageRefresh(callback){
  window.GEMZ_PAGE_REFRESH=callback;
  if(window.GEMZ_CONTENT_LOADED!==undefined||!window.GEMZ_CONTENT_PENDING)callback();
}
function boot(active){layout(active);initFX();applySiteSettings();return Promise.resolve();}
function applySiteSettings(){
  const setText=(selector,value)=>{const node=document.querySelector(selector);if(node&&value)node.textContent=value};
  setText('.hero .eyebrow',SITE_SETTINGS.hero_eyebrow);
  setText('.hero h1',SITE_SETTINGS.hero_title);
  setText('.hero p',SITE_SETTINGS.hero_description);
  setText('.announce span',SITE_SETTINGS.announcement);
  const videoURL=publicMediaURL(SITE_SETTINGS.hero_video_url);
  if(videoURL)document.querySelectorAll('video[data-lazy-video] source').forEach(source=>{
    if(source.dataset.src===videoURL)return;
    source.dataset.src=videoURL;
    const pathname=new URL(videoURL,document.baseURI).pathname.toLowerCase();
    source.type=pathname.endsWith('.webm')?'video/webm':'video/mp4';
    loadLazyVideo(source.parentElement);
  });
  setText('.promo-card-copy h3',SITE_SETTINGS.home_promo_title);
  const meta=document.querySelector('meta[name="description"]');if(meta&&SITE_SETTINGS.meta_description)meta.content=SITE_SETTINGS.meta_description;
  document.querySelectorAll('[data-setting]').forEach(node=>{const value=SITE_SETTINGS[node.dataset.setting];if(value!==undefined&&value!==null)node.textContent=String(value)});
  const phone=String(SITE_SETTINGS.contact_phone||'+94 11 234 5678'),email=String(SITE_SETTINGS.contact_email||'info@gemz.lk');
  const phoneLink=document.getElementById('contactPhoneInfo'),emailLink=document.getElementById('contactEmailInfo');
  if(phoneLink)phoneLink.href=`tel:${phone.replace(/[^+\d]/g,'')}`;
  if(emailLink)emailLink.href=`mailto:${email}`;
  applySeoSettings();
}
function applySeoSettings(overrides={}){
  const pathname=location.pathname.split('/').pop().toLowerCase();
  const page=pathname==='index.html'||pathname===''?'home':pathname==='collection.html'?'collection':pathname==='insights.html'?'insights':pathname==='contact.html'?'contact':pathname==='about.html'?'about':pathname==='cart.html'?'cart':pathname==='login.html'?'login':pathname==='gemstone.html'||pathname==='jewellery-product.html'?'product':'home';
  const siteName=String(SITE_SETTINGS.store_name||'Gemz.lk');
  const pageNames={home:String(SITE_SETTINGS.hero_title||'Fine Gems & Jewellery from Sri Lanka'),collection:'Gemstones, Jewellery & Watches',insights:'Gemstone Guides & Insights',contact:'Contact Us',about:'About Us',product:'Gemstone & Jewellery Details',cart:'Your Enquiry Selection',login:'Customer Account'};
  const titleTemplate=String(SITE_SETTINGS.seo_title_template||'{page} | {site}');
  const fallbackTitle=page==='home'?(document.title||`${siteName} — Fine Gems & Jewellery`):document.title.split(/\s+[—|]\s+/)[0];
  const title=String(overrides.title||SITE_SETTINGS[`seo_${page}_title`]|| (page==='home'&&SITE_SETTINGS.seo_title) || titleTemplate.replaceAll('{page}',pageNames[page]||fallbackTitle).replaceAll('{site}',siteName));
  const description=String(overrides.description||SITE_SETTINGS[`seo_${page}_description`]||SITE_SETTINGS.meta_description||'');
  const setMeta=(selector,attributes,value)=>{
    let node=document.head.querySelector(selector);
    if(!node){node=document.createElement('meta');Object.entries(attributes).forEach(([key,attrValue])=>node.setAttribute(key,attrValue));document.head.append(node)}
    node.content=value;
  };
  document.title=title;
  setMeta('meta[name="description"]',{name:'description'},description);
  setMeta('meta[name="keywords"]',{name:'keywords'},String(SITE_SETTINGS.seo_keywords||''));
  if(SITE_SETTINGS.seo_google_verification)setMeta('meta[name="google-site-verification"]',{name:'google-site-verification'},String(SITE_SETTINGS.seo_google_verification));
  if(SITE_SETTINGS.seo_bing_verification)setMeta('meta[name="msvalidate.01"]',{name:'msvalidate.01'},String(SITE_SETTINGS.seo_bing_verification));
  const robots=['index,follow','noindex,follow','noindex,nofollow'].includes(SITE_SETTINGS.seo_robots)?SITE_SETTINGS.seo_robots:'index,follow';
  setMeta('meta[name="robots"]',{name:'robots'},robots);
  const theme=String(SITE_SETTINGS.seo_theme_color||'#171b29');
  setMeta('meta[name="theme-color"]',{name:'theme-color'},/^#[0-9a-f]{6}$/i.test(theme)?theme:'#171b29');
  setMeta('meta[property="og:title"]',{property:'og:title'},title);
  setMeta('meta[property="og:description"]',{property:'og:description'},description);
  setMeta('meta[property="og:type"]',{property:'og:type'},overrides.type||'website');
  setMeta('meta[property="og:site_name"]',{property:'og:site_name'},siteName);
  setMeta('meta[name="twitter:title"]',{name:'twitter:title'},title);
  setMeta('meta[name="twitter:description"]',{name:'twitter:description'},description);
  const handle=String(SITE_SETTINGS.seo_twitter_handle||'').trim();
  if(handle)setMeta('meta[name="twitter:site"]',{name:'twitter:site'},handle.startsWith('@')?handle:`@${handle}`);
  const rawBase=String(SITE_SETTINGS.seo_site_url||'').trim();
  let baseURL='';
  try{const parsed=new URL(rawBase||location.origin);if(/^https?:$/.test(parsed.protocol))baseURL=parsed.origin}catch{}
  let canonicalURL='';
  if(baseURL){
    const canonicalPath=page==='home'?'/':`/${pathname}`;
    const canonical=new URL(canonicalPath,baseURL);
    if(page==='product'){const slug=new URLSearchParams(location.search).get('slug');if(slug)canonical.searchParams.set('slug',slug)}
    canonicalURL=canonical.href;
    let link=document.head.querySelector('link[rel="canonical"]');if(!link){link=document.createElement('link');link.rel='canonical';document.head.append(link)}link.href=canonicalURL;
    setMeta('meta[property="og:url"]',{property:'og:url'},canonicalURL);
  }
  const assetURL=value=>{try{const url=new URL(String(value||''),location.href);return /^https?:$/.test(url.protocol)?url.href:''}catch{return''}};
  const shareImage=assetURL(overrides.image||SITE_SETTINGS.seo_og_image);
  setMeta('meta[name="twitter:card"]',{name:'twitter:card'},shareImage?'summary_large_image':'summary');
  if(shareImage){setMeta('meta[property="og:image"]',{property:'og:image'},shareImage);setMeta('meta[name="twitter:image"]',{name:'twitter:image'},shareImage)}
  const faviconURL=assetURL(SITE_SETTINGS.store_favicon_url);
  if(faviconURL){let iconLink=document.head.querySelector('link[rel="icon"]');if(!iconLink){iconLink=document.createElement('link');iconLink.rel='icon';document.head.append(iconLink)}iconLink.href=faviconURL}
  const schemaType=['JewelryStore','Store','Organization'].includes(SITE_SETTINGS.seo_schema_type)?SITE_SETTINGS.seo_schema_type:'JewelryStore';
  const schema={
    '@context':'https://schema.org','@type':schemaType,'name':String(SITE_SETTINGS.seo_business_name||siteName),
    ...(baseURL?{url:baseURL}:{}),...(assetURL(SITE_SETTINGS.store_logo_url)?{logo:assetURL(SITE_SETTINGS.store_logo_url)}:{}),
    ...(SITE_SETTINGS.seo_business_email?{email:String(SITE_SETTINGS.seo_business_email)}:{}),
    ...(SITE_SETTINGS.seo_business_phone?{telephone:String(SITE_SETTINGS.seo_business_phone)}:{}),
    ...(SITE_SETTINGS.seo_business_address?{address:{'@type':'PostalAddress',streetAddress:String(SITE_SETTINGS.seo_business_address),addressCountry:String(SITE_SETTINGS.seo_business_country||'Sri Lanka')}}:{})
  };
  let schemaTag=document.getElementById('gemz-site-schema');if(!schemaTag){schemaTag=document.createElement('script');schemaTag.type='application/ld+json';schemaTag.id='gemz-site-schema';document.head.append(schemaTag)}schemaTag.textContent=JSON.stringify(schema);
  if(overrides.product){
    const productSchema={'@context':'https://schema.org','@type':'Product','name':String(overrides.product.name||''),...(description?{description}:{}),...(shareImage?{image:shareImage}:{}),...(overrides.product.category?{category:String(overrides.product.category)}:{})};
    let productTag=document.getElementById('gemz-product-schema');if(!productTag){productTag=document.createElement('script');productTag.type='application/ld+json';productTag.id='gemz-product-schema';document.head.append(productTag)}productTag.textContent=JSON.stringify(productSchema);
  }else document.getElementById('gemz-product-schema')?.remove();
}
window.addEventListener('gemz-content-updated',event=>{
  if(!event.detail?.loaded){window.GEMZ_PAGE_REFRESH?.();return}
  layout(ACTIVE_PAGE);
  applySiteSettings();
  window.GEMZ_PAGE_REFRESH?.();
  initFX();
});
document.addEventListener('error',event=>{
  const image=event.target;
  if(!(image instanceof HTMLImageElement))return;
  image.style.display='none';
  image.parentElement?.setAttribute('data-image-error','true');
},true);
