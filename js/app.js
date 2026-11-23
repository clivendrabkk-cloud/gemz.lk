/* gemz.lk — data, shared layout, cart, GSAP + 3D */
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
    status:row.status, featured:row.featured, sort_order:row.sort_order,
    c:colors,bg:background,visual:{colors,background} };
}
async function loadPublicContent(){
  try{
    const client=window.GEMZ_SUPABASE||await window.GEMZ_SUPABASE_READY;
    if(!client)return;
    const [productResult,articleResult,settingsResult]=await Promise.all([
      client.from('products').select('*').eq('status','published').order('sort_order').order('created_at'),
      client.from('articles').select('*').eq('status','published').order('created_at',{ascending:false}),
      client.from('site_settings').select('setting_key,setting_value')
    ]);
    if(!productResult.error){
      const rows=(productResult.data||[]).map(productFromRow);
      GEMS=rows.filter(row=>row.type==='gem');
      JEWELLERY_PRODUCTS=rows.filter(row=>row.type==='jewellery');
      WATCH_PRODUCTS=rows.filter(row=>row.type==='watch');
      const gemCategories=[...new Set(GEMS.map(row=>row.category).filter(Boolean))];
      if(gemCategories.length)GEM_CATEGORIES=gemCategories.map(label=>({label,match:gem=>gem.category===label}));
      const categories=[...new Set(JEWELLERY_PRODUCTS.map(row=>row.category).filter(Boolean))];
      if(categories.length)JEWELLERY_CATEGORIES=categories;
    }
    if(!articleResult.error) ARTICLES=(articleResult.data||[]).map(row=>({
      t:row.title,k:row.category||'Insight',g:0,p:row.excerpt||'',slug:row.slug,content:row.content||'',
      image_url:publicMediaURL(row.cover_image)
    }));
    if(!settingsResult.error) SITE_SETTINGS=Object.fromEntries((settingsResult.data||[]).map(row=>[row.setting_key,row.setting_value]));
  }catch(error){console.warn('Gemz public content could not be loaded from Supabase.',error)}
}
window.GEMZ_READY=window.GEMZ_READY||Promise.resolve().then(loadPublicContent);

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
  get(){try{return JSON.parse(localStorage.getItem('gemz_cart')||'[]')}catch(e){return[]}},
  set(v){try{localStorage.setItem('gemz_cart',JSON.stringify(v))}catch(e){}this.badge()},
  add(s){const c=this.get();if(!c.includes(s))c.push(s);this.set(c)},
  remove(s){this.set(this.get().filter(x=>x!==s))},
  badge(){document.querySelectorAll('.cart-count').forEach(e=>e.textContent=this.get().length)}
};

/* Shared layout */
function layout(active){
  const L=(h,t,k)=>`<a href="${h}" class="${active===k?'active':''}">${t}</a>`;
  const logoGem=GEMS[5]||GEMS[0];
  const email=htmlEscape(SITE_SETTINGS.contact_email||'info@gemz.lk');
  const phone=htmlEscape(SITE_SETTINGS.contact_phone||'+94 11 234 5678');
  const address=htmlEscape(SITE_SETTINGS.contact_address||'Colombo, Sri Lanka');
  const announce=htmlEscape(SITE_SETTINGS.announcement||'Natural Gems & Fine Jewellery from Sri Lanka.');
  document.getElementById('site-header').innerHTML=`
  <div class="announce"><div class="announce-track">${Array(8).fill(`<span>${announce}</span><span>Over 40 Years of Ceylon Gem Expertise.</span>`).join('')}</div></div>
  <header class="header" id="hdr"><div class="header-in">
    <nav class="nav" aria-label="Main navigation">${L('index.html','Home','home')}${L('collection.html','Our Gemstones','collection')}<a class="nav-gem ${active==='collection'?'active':''}" href="collection.html?section=gem">GEM</a><details class="nav-drop"><summary class="${active==='collection'?'active':''}">JEWELLERY</summary><div class="nav-dropdown"><a href="collection.html?section=jewellery">All Jewellery</a>${JEWELLERY_CATEGORIES.map(category=>`<a href="${jewelleryCategoryURL(category)}">${htmlEscape(category)}</a>`).join('')}</div></details>${L('collection.html?section=watch','WATCH','collection')}${L('about.html','About us','about')}</nav>
    <button class="burger" id="burger" aria-label="Menu"><i></i><i></i><i></i></button>
    <a href="index.html" class="logo" aria-label="Gemz.lk home"><svg viewBox="0 0 200 200">${gemSVG(logoGem,'logo').replace(/<\/?svg[^>]*>/g,'')}</svg><span>GEMZ<small>SRI LANKA</small></span></a>
    <div class="utils">
      <a href="insights.html" class="txt">Insights</a><a href="contact.html" class="txt">Contact Us</a>
      <a class="ico opt" href="tel:${phone.replace(/[^+\d]/g,'')}" aria-label="Call">${icon.phone}</a>
      <a class="ico opt" href="mailto:${email}" aria-label="Email">${icon.mail}</a>
      <a class="ico opt" href="contact.html" aria-label="Location">${icon.pin}</a>
      <a class="ico" href="cart.html" aria-label="Inquiry cart">${icon.bag}<span class="cart-count">0</span></a>
      <a class="ico opt" href="login.html" aria-label="Account">${icon.user}</a>
    </div></div></header>
  <div class="mobile-nav" id="mnav"><a href="index.html">Home</a><a href="collection.html">Our Gemstones</a><a href="collection.html?section=gem">GEM</a><div class="mobile-jewellery"><a class="mobile-jewellery-title" href="collection.html?section=jewellery">JEWELLERY</a><div class="mobile-jewellery-subnav">${JEWELLERY_CATEGORIES.map(category=>`<a href="${jewelleryCategoryURL(category)}">${htmlEscape(category)}</a>`).join('')}</div></div><a href="collection.html?section=watch">WATCH</a><a href="about.html">About us</a><a href="insights.html">Insights</a><a href="contact.html">Contact Us</a><a href="login.html">Account</a></div>`;
  document.getElementById('site-footer').innerHTML=`<footer class="footer"><div class="wrap"><div class="foot-grid">
    <div><div class="logo" style="color:#fff;margin-bottom:16px">GEMZ<small>.LK</small></div><p data-setting="footer_tagline" style="max-width:34ch;font-size:.92rem">Authentic natural gemstones sourced in Sri Lanka and delivered worldwide. Established 1985.</p></div>
    <div><h4>Explore</h4><a href="index.html">Home</a><a href="collection.html">Our Gemstones</a><a href="about.html">About us</a><a href="insights.html">Insights</a></div>
    <div><h4>Account</h4><a href="cart.html">Inquiry Cart</a><a href="login.html">Login</a><a href="contact.html">Contact Us</a></div>
    <div><h4>Contact</h4><a href="mailto:${email}">${email}</a><a href="tel:${phone.replace(/[^+\d]/g,'')}">${phone}</a><a href="contact.html">${address}</a></div>
  </div><div class="foot-bot"><span>© ${new Date().getFullYear()} Gemz.lk. All rights reserved.</span><span>Natural · Authentic · Ceylon</span></div></div></footer>`;
  const b=document.getElementById('burger'),m=document.getElementById('mnav');
  b.onclick=()=>{b.classList.toggle('open');m.classList.toggle('open');document.body.style.overflow=m.classList.contains('open')?'hidden':''};
  Cart.badge();
}

function productDetailURL(product){
  return product.type==='jewellery'||product.type==='watch'?`jewellery-product.html?slug=${encodeURIComponent(product.slug)}`:`gemstone.html?slug=${encodeURIComponent(product.slug)}`;
}
function cardHTML(g,i){
  const href=productDetailURL(g);
  if(g.image_url)return `<a class="card" href="${href}" data-tilt><div class="frame" style="background:${bgOf(g)}"><img src="${htmlEscape(g.image_url)}" alt="${htmlEscape(g.name)}" loading="lazy"></div><div class="card-body"><h3>${htmlEscape(g.name)}</h3><span class="tag">Price on Request</span></div></a>`;
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
  const art=product?.image_url?`<img src="${htmlEscape(product.image_url)}" alt="${htmlEscape(category)}" loading="lazy">`:jewelleryArt(category);
  return `<a class="jewellery-card" href="${href}"><div class="jewellery-art">${art}</div><div class="jewellery-card-body"><h3>${htmlEscape(category)}</h3><span class="tag">Explore</span></div></a>`;
}

/* Effects */
function initFX(){
  const hasG=typeof gsap!=='undefined';
  const reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
  /* header theme over hero */
  const hdr=document.getElementById('hdr'),hero=document.querySelector('.hero');
  if(hdr&&hero){const f=()=>hdr.classList.toggle('dark',scrollY<hero.offsetHeight-120);f();addEventListener('scroll',f,{passive:true});}
  /* 3D tilt cards */
  document.querySelectorAll('[data-tilt]').forEach(el=>{
    if(!hasG||reduce)return;
    const rx=gsap.quickTo(el,'rotationX',{duration:.5,ease:'power3'}),ry=gsap.quickTo(el,'rotationY',{duration:.5,ease:'power3'});
    gsap.set(el,{transformPerspective:900});
    el.addEventListener('pointermove',e=>{const r=el.getBoundingClientRect();ry(((e.clientX-r.left)/r.width-.5)*14);rx(-((e.clientY-r.top)/r.height-.5)*14)});
    el.addEventListener('pointerleave',()=>{rx(0);ry(0)});
  });
  if(!hasG||reduce)return;
  gsap.registerPlugin(ScrollTrigger);
  /* reveals */
  gsap.utils.toArray('[data-reveal]').forEach(el=>{
    gsap.to(el,{opacity:1,y:0,duration:1,ease:'power3.out',delay:+(el.dataset.delay||0),scrollTrigger:{trigger:el,start:'top 88%'}});
  });
  gsap.utils.toArray('[data-stagger]').forEach(p=>{
    gsap.from(p.children,{opacity:0,y:50,duration:.9,stagger:.12,ease:'power3.out',scrollTrigger:{trigger:p,start:'top 85%'}});
  });
  /* parallax */
  gsap.utils.toArray('[data-parallax]').forEach(el=>{
    gsap.to(el,{yPercent:+el.dataset.parallax,ease:'none',scrollTrigger:{trigger:el.parentElement,scrub:true,start:'top bottom',end:'bottom top'}});
  });
  /* counters */
  gsap.utils.toArray('[data-count]').forEach(el=>{
    const o={v:0},end=+el.dataset.count,suf=el.dataset.suffix||'';
    gsap.to(o,{v:end,duration:2,ease:'power2.out',scrollTrigger:{trigger:el,start:'top 90%'},onUpdate:()=>el.textContent=Math.round(o.v)+suf});
  });
  /* hero text intro */
  gsap.from('.hero .eyebrow,.hero h1,.hero p,.hero .btn',{y:60,opacity:0,duration:1.2,stagger:.14,ease:'power4.out',delay:.2});
  /* split visual 3D scroll */
  const sv=document.querySelector('.split-visual');
  if(sv){gsap.set(sv,{transformPerspective:1000});gsap.fromTo(sv,{rotationY:-18,rotationX:6},{rotationY:0,rotationX:0,ease:'none',scrollTrigger:{trigger:sv,start:'top 90%',end:'center 50%',scrub:true}});
    gsap.to('.split-visual .gem-in',{rotationY:360,duration:18,repeat:-1,ease:'none'});}
  /* detail viewer drag */
  const v=document.querySelector('.viewer .gem3d');
  if(v){
    let rx=-10,ry=0,drag=false,lx=0,ly=0;const vw=v.parentElement;
    gsap.set(v,{transformPerspective:900,rotationX:rx});
    const auto=gsap.to({}, {duration:1,repeat:-1,onRepeat:()=>{if(!drag){ry+=18;gsap.to(v,{rotationY:ry,duration:1,ease:'none'})}}});
    vw.addEventListener('pointerdown',e=>{drag=true;lx=e.clientX;ly=e.clientY;vw.setPointerCapture(e.pointerId)});
    vw.addEventListener('pointerup',()=>drag=false);
    vw.addEventListener('pointermove',e=>{if(!drag)return;ry+=(e.clientX-lx)*.6;rx=Math.max(-50,Math.min(50,rx-(e.clientY-ly)*.4));lx=e.clientX;ly=e.clientY;gsap.to(v,{rotationY:ry,rotationX:rx,duration:.3})});
  }
  /* magnetic buttons */
  document.querySelectorAll('.btn-gold,.btn-dark').forEach(b=>{
    b.addEventListener('pointermove',e=>{const r=b.getBoundingClientRect();gsap.to(b,{x:(e.clientX-r.left-r.width/2)*.25,y:(e.clientY-r.top-r.height/2)*.35,duration:.4})});
    b.addEventListener('pointerleave',()=>gsap.to(b,{x:0,y:0,duration:.6,ease:'elastic.out(1,.4)'}));
  });
}
function boot(active){return window.GEMZ_READY.then(()=>{layout(active);initFX();applySiteSettings();});}
function applySiteSettings(){
  const setText=(selector,value)=>{const node=document.querySelector(selector);if(node&&value)node.textContent=value};
  setText('.hero .eyebrow',SITE_SETTINGS.hero_eyebrow);
  setText('.hero h1',SITE_SETTINGS.hero_title);
  setText('.hero p',SITE_SETTINGS.hero_description);
  setText('.announce span',SITE_SETTINGS.announcement);
  const videoURL=publicMediaURL(SITE_SETTINGS.hero_video_url);
  if(videoURL){document.querySelectorAll('#heroVideo source,.watch-clip video source,.promo-card video source').forEach(source=>{source.src=videoURL;source.parentElement.load?.()})}
  setText('.promo-card-copy h3',SITE_SETTINGS.home_promo_title);
  const meta=document.querySelector('meta[name="description"]');if(meta&&SITE_SETTINGS.meta_description)meta.content=SITE_SETTINGS.meta_description;
  document.querySelectorAll('[data-setting]').forEach(node=>{const value=SITE_SETTINGS[node.dataset.setting];if(value!==undefined&&value!==null)node.textContent=String(value)});
}
