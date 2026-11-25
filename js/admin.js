(() => {
  const $ = (selector, root=document) => root.querySelector(selector);
  const $$ = (selector, root=document) => [...root.querySelectorAll(selector)];
  const escapeHTML=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const defaultVisual={colors:['#fff3a8','#f2b705','#a86a00'],background:['#3a2a08','#8a5a12']};
  const aboutDefaults={about_image_url:'',about_image_alt:'Gemstone expertise rooted in Ceylon',about_badge:'Ceylon · Est. 1985',about_values_eyebrow:'Our Values',about_values_title:'What We Stand For',about_value_1_number:'01',about_value_1_title:'Authenticity',about_value_1_description:'100% natural stones with transparent origin and treatment disclosure.',about_value_2_number:'02',about_value_2_title:'Expertise',about_value_2_description:'Over 40 years of grading, sourcing and cutting knowledge.',about_value_3_number:'03',about_value_3_title:'Trust',about_value_3_description:'Long-term relationships built on honesty, discretion and service.',about_milestones_eyebrow:'Milestones',about_milestones_title:'Our Journey',about_milestone_1_year:'1985',about_milestone_1_description:'Founded in Sri Lanka, trading Ratnapura sapphires.',about_milestone_2_year:'2000s',about_milestone_2_description:'Expansion into international gem fairs and private clients.',about_milestone_3_year:'2010s',about_milestone_3_description:'Presence across three continents and a global buyer network.',about_milestone_4_year:'Today',about_milestone_4_description:'Gemz.lk online — Ceylon gems, now one enquiry away.',about_cta_title:'Begin your gemstone journey',about_cta_description:'Speak with our team about the perfect stone.',about_cta_button:'Contact Us',about_cta_url:'contact.html',cart_eyebrow:'Your selection',cart_title:'Inquiry Cart',cart_description:'Prices are on request. Send us your selection and we will reply with details.',cart_empty_title:'Your inquiry cart is empty',cart_empty_description:'Browse the collection and add pieces you like.',cart_explore_button:'Explore the collection',cart_name_label:'Name',cart_email_label:'Email',cart_phone_label:'Phone',cart_message_label:'Message',cart_price_label:'Price on Request',cart_remove_label:'Remove',cart_submit_label:'Send enquiry',cart_default_message:'I am interested in: {products}',cart_success_message:'Thank you. Your enquiry has been sent to our team.',account_eyebrow:'Welcome back',account_title:'Account Login',account_email_label:'Email',account_password_label:'Password',account_submit_label:'Sign In',account_note:'You can send an enquiry without an account.',account_cart_link:'Open your inquiry cart',home_carousel_speed:'50'};
  aboutDefaults.announcement_speed='50';
  Object.assign(aboutDefaults,{home_promo_title:'Over 40 Years in Gems',home_heritage_eyebrow:'Our heritage',home_heritage_image_url:'',home_heritage_image_alt:'Our gemstone heritage',home_heritage_link_label:'Discover our story',home_heritage_link_url:'about.html'});
  Object.assign(aboutDefaults,{whatsapp_enabled:'true',whatsapp_number:'',whatsapp_button_label:'Chat with us',whatsapp_greeting:'Hello! How can we help you today?',whatsapp_inquiry_template:'Hello, I would like to make an enquiry.\n\nProducts: {products}\n\nName: {name}\nEmail: {email}\nPhone: {phone}\n\nMessage: {message}\n\n{site}'});
  const state={client:null,user:null,products:[],categories:[],articles:[],inquiries:[],settings:{},privateSettings:[],view:'overview',editing:null,editingCategory:null,toastTimer:null,sitemapText:''};
  const viewTitles={overview:'Overview',catalog:'Catalog',categories:'Categories',articles:'Insights',inquiries:'Inquiries',whatsapp:'WhatsApp',media:'Media library',settings:'Site settings',seo:'SEO Dashboard'};

  function notify(message,type='success'){
    const toast=$('#toast');toast.textContent=message;toast.className=`toast show${type==='error'?' error':''}`;
    clearTimeout(state.toastTimer);state.toastTimer=setTimeout(()=>toast.classList.remove('show'),3600);
  }
  function showGate(mode,message=''){
    $('#adminLoading').hidden=true;$('#gate').hidden=false;$('#adminShell').hidden=true;
    $('#loginCard').hidden=mode!=='login';$('#setupCard').hidden=mode!=='setup';
    if(message){$('#loginNotice').textContent=message;$('#loginNotice').classList.toggle('success',mode==='login-success')}
  }
  function setView(view){
    if(!viewTitles[view])return;state.view=view;
    $$('.view').forEach(node=>node.classList.toggle('active',node.id===`view-${view}`));
    $$('.side-nav button').forEach(button=>button.classList.toggle('active',button.dataset.view===view));
    $('#sectionTitle').textContent=viewTitles[view];$('#sectionEyebrow').textContent=view==='overview'?'Store workspace':`Manage ${viewTitles[view].toLowerCase()}`;
    $('#sidebar').classList.remove('open');
  }
  function setSitePage(page){
    const tabs=$$('#sitePageTabs [data-site-page-tab]');
    if(!tabs.some(tab=>tab.dataset.sitePageTab===page))return;
    tabs.forEach(tab=>{const active=tab.dataset.sitePageTab===page,panel=document.getElementById(tab.getAttribute('aria-controls'));if(panel){if(!tab.id)tab.id=`sitePageTab-${tab.dataset.sitePageTab}`;panel.setAttribute('aria-labelledby',tab.id)}tab.classList.toggle('active',active);tab.setAttribute('aria-selected',String(active));tab.tabIndex=active?0:-1});
    $$('#settingsForm [data-site-page-panel]').forEach(panel=>{panel.hidden=panel.dataset.sitePagePanel!==page});
  }
  function fmtDate(value){return value?new Intl.DateTimeFormat(undefined,{dateStyle:'medium',timeStyle:'short'}).format(new Date(value)):'—'}
  function slugify(value){return String(value||'').normalize('NFKD').toLowerCase().trim().replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')}
  function emptyState(title,message){return `<div class="empty-state"><b>${escapeHTML(title)}</b><p>${escapeHTML(message)}</p></div>`}
  function typeName(type){return ({gem:'Gemstone',jewellery:'Jewellery',watch:'Watch'})[type]||type}
  function badge(value){return `<span class="badge ${escapeHTML(value)}">${escapeHTML(String(value||'').replace('_',' '))}</span>`}
  function announceStorefrontChange(){try{localStorage.setItem('gemz-public-content-updated',String(Date.now()))}catch{}}
  function categoryOptions(type,selected='',legacy=''){
    const categories=state.categories.filter(item=>item.product_type===type);
    if(legacy&&!categories.some(item=>item.name===legacy))categories.push({name:legacy});
    return `<option value="">Choose a category</option>${categories.map(item=>`<option value="${escapeHTML(item.name)}" ${item.name===selected?'selected':''}>${escapeHTML(item.name)}</option>`).join('')}`;
  }

  async function authorize(user){
    state.user=user;
    const {data,error}=await state.client.from('gemz_admins').select('user_id').eq('user_id',user.id).maybeSingle();
    if(error){showGate('login','Could not verify admin access. Check that the Supabase schema and RLS policies are installed.');return}
    if(!data){await state.client.auth.signOut();showGate('login','This account is not listed as a Gemz.lk administrator.');return}
    $('#adminLoading').hidden=true;$('#gate').hidden=true;$('#adminShell').hidden=false;$('#userEmail').textContent=user.email||'';
    await loadAll();
  }

  async function loadAll(){
    const resources={
      products:state.client.from('products').select('*').order('sort_order').order('created_at',{ascending:false}),
      categories:state.client.from('product_categories').select('*').order('product_type').order('sort_order').order('name'),
      articles:state.client.from('articles').select('*').order('created_at',{ascending:false}),
      inquiries:state.client.from('inquiries').select('*').order('created_at',{ascending:false}),
      settings:state.client.from('site_settings').select('*').order('setting_key'),
      privateSettings:state.client.from('private_site_settings').select('secret_key')
    };
    let results;
    try{results=await Promise.all(Object.entries(resources).map(async([name,request])=>[name,await request]))}
    catch(error){notify(error.message||'Could not load store data.','error');return false}
    const errors=[];
    for(const [name,result] of results){
      if(result.error){errors.push(`${name}: ${result.error.message}`);continue}
      if(name==='products')state.products=result.data||[];
      if(name==='categories')state.categories=result.data||[];
      if(name==='articles')state.articles=result.data||[];
      if(name==='inquiries')state.inquiries=result.data||[];
      if(name==='settings')state.settings=Object.fromEntries((result.data||[]).map(row=>[row.setting_key,row.setting_value]));
      if(name==='privateSettings')state.privateSettings=(result.data||[]).map(row=>row.secret_key);
    }
    renderAll();
    if(errors.length)notify(`Some admin data could not be refreshed. ${errors.join(' · ')}`,'error');
    return errors.length===0;
  }
  function renderAll(){renderOverview();renderProducts();renderCategories();renderArticles();renderInquiries();populateSettings()}
  function renderOverview(){
    $('#statProducts').textContent=state.products.filter(item=>item.status==='published').length;
    $('#statArticles').textContent=state.articles.filter(item=>item.status==='published').length;
    $('#statInquiries').textContent=state.inquiries.filter(item=>item.status==='new').length;
    const list=state.inquiries.slice(0,5);
    $('#recentInquiries').innerHTML=list.length?inquiryTable(list,false):emptyState('No enquiries yet','New website messages will show here.');
  }
  function renderProducts(){
    const needle=$('#productSearch').value.trim().toLowerCase(),type=$('#productTypeFilter').value;
    const items=state.products.filter(item=>(!type||item.product_type===type)&&(!needle||`${item.name} ${item.slug} ${item.category}`.toLowerCase().includes(needle)));
    $('#productsTable').innerHTML=items.length?`<table class="data-table"><thead><tr><th>Product</th><th>Type</th><th>Category</th><th>Status</th><th>Featured</th><th>Actions</th></tr></thead><tbody>${items.map(item=>`<tr><td><div class="item-cell"><span class="item-thumb">${item.image_url?`<img src="${escapeHTML(item.image_url)}" alt="">`:'G'}</span><span><b>${escapeHTML(item.name)}</b><small>${escapeHTML(item.slug)}</small></span></div></td><td>${escapeHTML(typeName(item.product_type))}</td><td>${escapeHTML(item.category||'—')}</td><td>${badge(item.status)}</td><td>${item.featured?'Yes':'—'}</td><td><div class="table-actions"><button class="small-button" data-edit-product="${escapeHTML(item.id)}">Edit</button><button class="small-button remove" data-delete-product="${escapeHTML(item.id)}">Delete</button></div></td></tr>`).join('')}</tbody></table>`:emptyState('No products found','Add a gemstone, jewellery piece or watch to your catalog.');
  }
  function renderCategories(){
    const items=state.categories;
    $('#categoriesTable').innerHTML=items.length?`<table class="data-table"><thead><tr><th>Category</th><th>Product type</th><th>Products</th><th>Display order</th><th>Actions</th></tr></thead><tbody>${items.map(item=>{const count=state.products.filter(product=>product.product_type===item.product_type&&product.category===item.name).length;return `<tr><td><b>${escapeHTML(item.name)}</b></td><td>${escapeHTML(typeName(item.product_type))}</td><td>${count}</td><td>${item.sort_order}</td><td><div class="table-actions"><button class="small-button" data-edit-category="${escapeHTML(item.id)}">Edit</button><button class="small-button remove" data-delete-category="${escapeHTML(item.id)}">Delete</button></div></td></tr>`}).join('')}</tbody></table>`:emptyState('No categories yet','Add categories for gemstones, jewellery or watches. Run the updated Supabase schema if this section cannot load.');
  }
  function renderArticles(){
    const items=state.articles;
    $('#articlesTable').innerHTML=items.length?`<table class="data-table"><thead><tr><th>Article</th><th>Category</th><th>Status</th><th>Updated</th><th>Actions</th></tr></thead><tbody>${items.map(item=>`<tr><td><div class="item-cell"><span class="item-thumb">${item.cover_image?`<img src="${escapeHTML(item.cover_image)}" alt="">`:'✦'}</span><span><b>${escapeHTML(item.title)}</b><small>${escapeHTML(item.slug)}</small></span></div></td><td>${escapeHTML(item.category||'Insight')}</td><td>${badge(item.status)}</td><td>${escapeHTML(fmtDate(item.updated_at||item.created_at))}</td><td><div class="table-actions"><button class="small-button" data-edit-article="${escapeHTML(item.id)}">Edit</button><button class="small-button remove" data-delete-article="${escapeHTML(item.id)}">Delete</button></div></td></tr>`).join('')}</tbody></table>`:emptyState('No articles yet','Create an insight and publish it to the storefront.');
  }
  function inquiryTable(items,showActions=true){
    return `<table class="data-table"><thead><tr><th>Customer</th><th>Message</th><th>Received</th><th>Status</th>${showActions?'<th>Actions</th>':''}</tr></thead><tbody>${items.map(item=>`<tr><td><div class="item-cell"><span class="item-thumb">✉</span><span><b>${escapeHTML(item.name)}</b><small><a href="mailto:${escapeHTML(item.email)}">${escapeHTML(item.email)}</a>${item.phone?` · ${escapeHTML(item.phone)}`:''}</small></span></div></td><td><div class="inquiry-message">${escapeHTML(item.message)}</div>${item.product_slug?`<div class="inquiry-meta">Interested in: ${escapeHTML(item.product_slug)}</div>`:''}</td><td>${escapeHTML(fmtDate(item.created_at))}</td><td>${showActions?`<select class="status-select" data-inquiry-status="${escapeHTML(item.id)}" aria-label="Change inquiry status"><option value="new" ${item.status==='new'?'selected':''}>New</option><option value="in_progress" ${item.status==='in_progress'?'selected':''}>In progress</option><option value="resolved" ${item.status==='resolved'?'selected':''}>Resolved</option></select>`:badge(item.status)}</td>${showActions?`<td><a class="small-button" href="mailto:${escapeHTML(item.email)}?subject=${encodeURIComponent('Gemz.lk enquiry')}">Reply</a></td>`:''}</tr>`).join('')}</tbody></table>`;
  }
  function renderInquiries(){
    const status=$('#inquiryFilter').value;
    const items=state.inquiries.filter(item=>!status||item.status===status);
    $('#inquiriesTable').innerHTML=items.length?inquiryTable(items):emptyState('No enquiries here','Website contact form submissions will appear in this list.');
  }
  function settingValue(key){const value=state.settings[key];return value==null?'':typeof value==='string'?value:String(value)}
  function refreshSettingPreviews(){[['store_logo_url','storeLogoPreview'],['store_favicon_url','storeFaviconPreview'],['seo_og_image','seoOgImagePreview'],['about_image_url','aboutImagePreview'],['home_heritage_image_url','homeHeritageImagePreview']].forEach(([key,id])=>{const preview=$(`#${id}`),url=settingValue(key);preview.hidden=!url;if(url)preview.src=url;else preview.removeAttribute('src')})}
  function updateCarouselSpeedOutput(){const input=$('#homeCarouselSpeed'),output=$('#homeCarouselSpeedOutput');if(!input||!output)return;output.value=`${input.value} px per second`;output.textContent=output.value}
  function updateAnnouncementSpeedOutput(){const input=$('#announcementSpeed'),output=$('#announcementSpeedOutput');if(!input||!output)return;output.value=`${input.value} px per second`;output.textContent=output.value}
  const contentRepeaterConfig={
    value:{prefix:'about_value',countName:'about_values_count',container:'#aboutValuesRepeater',minimum:3,fields:[['number','Number','input'],['title','Title','input'],['description','Description','textarea']]},
    milestone:{prefix:'about_milestone',countName:'about_milestones_count',container:'#aboutMilestonesRepeater',minimum:4,fields:[['year','Year','input'],['description','Description','textarea']]}
  };
  function contentRepeaterItem(kind,index,useSaved=true){
    const config=contentRepeaterConfig[kind];
    const label=kind==='value'?'Value':'Milestone';
    const fields=config.fields.map(([field,title,type])=>{
      const name=`${config.prefix}_${index}_${field}`;
      const stored=state.settings[name]??aboutDefaults[name]??'';
      const fallback=useSaved?stored:(field==='number'&&kind==='value'?String(index).padStart(2,'0'):'');
      const control=type==='textarea'?`<textarea data-content-field="${field}" rows="2">${escapeHTML(fallback)}</textarea>`:`<input data-content-field="${field}" value="${escapeHTML(fallback)}">`;
      return `<label>${title}${control}</label>`;
    }).join('');
    return `<fieldset class="content-repeat-item" data-content-item data-index="${index}"><legend data-content-legend>${label} ${index}</legend><div class="content-repeat-fields">${fields}</div><button class="small-button remove" type="button" data-remove-content-item="${kind}">Remove ${label.toLowerCase()}</button></fieldset>`;
  }
  function syncContentRepeater(kind){
    const config=contentRepeaterConfig[kind],container=$(config.container),items=$$('[data-content-item]',container);
    items.forEach((item,index)=>{
      const number=index+1;item.dataset.index=String(number);
      item.querySelector('[data-content-legend]').textContent=`${kind==='value'?'Value':'Milestone'} ${number}`;
      item.querySelectorAll('[data-content-field]').forEach(field=>{field.name=`${config.prefix}_${number}_${field.dataset.contentField}`});
    });
    const countField=$(`[name="${config.countName}"]`);if(countField)countField.value=String(items.length);
    const add=$(`[data-add-content-item="${kind}"]`);if(add)add.disabled=items.length>=30;
  }
  function populateContentRepeater(kind){
    const config=contentRepeaterConfig[kind],container=$(config.container);if(!container)return;
    const savedCount=Number(state.settings[config.countName]);
    const keyPattern=new RegExp(`^${config.prefix}_(\\d+)_`);
    const savedIndexes=Object.keys(state.settings).map(key=>Number(key.match(keyPattern)?.[1]||0));
    const count=Math.max(1,Math.min(30,Number.isInteger(savedCount)&&savedCount>0?savedCount:Math.max(config.minimum,...savedIndexes)));
    container.innerHTML=Array.from({length:count},(_,index)=>contentRepeaterItem(kind,index+1)).join('');
    syncContentRepeater(kind);
  }
  function populateSettings(){
    for(const [key,value] of Object.entries(state.settings)){
      const field=$(`[name="${CSS.escape(key)}"]`,document);
      if(field?.type==='checkbox')field.checked=value===true||String(value).toLowerCase()==='true';
      else if(field&&field.type!=='file')field.value=typeof value==='string'?value:String(value??'');
    }
    for(const [key,value] of Object.entries(aboutDefaults)){
      if(state.settings[key]!==undefined&&state.settings[key]!==null)continue;
      const field=$(`[name="${CSS.escape(key)}"]`,document);
      if(field?.type==='checkbox')field.checked=value===true||String(value).toLowerCase()==='true';
      else if(field)field.value=value;
    }
    populateContentRepeater('value');populateContentRepeater('milestone');
    refreshSettingPreviews();updateCarouselSpeedOutput();updateAnnouncementSpeedOutput();
    const secretStatus=$('#seoSecretStatus');
    if(secretStatus)secretStatus.textContent=state.privateSettings.includes('seo_capi_access_token')?'A Conversions API token is stored in the admin-only settings table.':'No Conversions API token is stored.';
    updateSeoPreviews();updateRobotsPreview();updateAdsTxtPreview();
  }

  function openEditor(kind,row=null){
    state.editing={kind,id:row?.id||null};
    $('#editorEyebrow').textContent=kind==='product'?'Catalog item':'Journal article';
    $('#editorTitle').textContent=row?`Edit ${kind}`:`Add ${kind}`;
    $('#editorFields').innerHTML=kind==='product'?productFields(row):articleFields(row);
    $('#editorDialog').showModal();
  }
  function openCategoryEditor(category=null){
    state.editingCategory=category?.id||null;
    const form=$('#categoryForm');
    form.reset();
    form.elements.product_type.value=category?.product_type||'gem';
    form.elements.name.value=category?.name||'';
    form.elements.sort_order.value=category?.sort_order??0;
    $('#categoryDialogTitle').textContent=category?'Edit category':'Add category';
    $('#categoryDialog').showModal();
  }
  function formatSpecLabel(value){
    const aliases={treat:'Treatment',colour:'Colour',codeNo:'Code No',code_no:'Code No',setting_type:'Setting type',final_finishing:'Final finishing',diamond_colour:'Diamond Colour',clarity_grade:'Clarity Grade'};
    if(Object.hasOwn(aliases,value))return aliases[value];
    return String(value||'').replace(/([a-z0-9])([A-Z])/g,'$1 $2').replace(/[_-]+/g,' ').replace(/\b\w/g,letter=>letter.toUpperCase()).trim();
  }
  function canonicalSpecKey(label){
    let key=String(label||'').replace(/([a-z0-9])([A-Z])/g,'$1_$2').toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_|_$/g,'');
    if(['color','colour'].includes(key))key='colour';
    if(['treatment','treatments','treat'].includes(key))key='treat';
    if(['clarity','clarity_grade'].includes(key))key='clarity_grade';
    if(['code_no','codeno'].includes(key))key='code_no';
    return key;
  }
  const specificationTemplates={
    jewellery:['Metal','Weight','Gemstones','Gemstone Weight','Number of Diamonds','Diamond Weight','Diamond Colour','Diamond Clarity','Setting type','Final finishing','Dimensions','Comment'],
    gem:['Code No','Stone','Weight','Clarity Grade','Colour','Origin','Dimensions','Shape','Cut','Treatment','Certificate','Comment']
  };
  function specificationRows(specs,type='gem'){
    const entries=specs&&typeof specs==='object'&&!Array.isArray(specs)
      ?Object.entries(specs).filter(([,value])=>value==null||typeof value!=='object').map(([label,value])=>({label:formatSpecLabel(label),key:canonicalSpecKey(label),value:String(value??'')}))
      :[];
    const defaultLabels=specificationTemplates[type]||[];
    const defaultKeys=new Set(defaultLabels.map(canonicalSpecKey));
    const rows=defaultLabels.map(label=>({label,value:entries.find(item=>item.key===canonicalSpecKey(label))?.value||''}));
    rows.push(...entries.filter(item=>!defaultKeys.has(item.key)));
    const displayRows=rows.length?rows:[{label:'',value:''},{label:'',value:''}];
    return displayRows.map(({label,value})=>specificationRowHTML(label,value)).join('');
  }
  function specificationRowHTML(label='',value=''){
    return `<div class="specification-row"><label>Specification<input name="spec_name" value="${escapeHTML(label)}" placeholder="e.g. Origin"></label><label>Details<input name="spec_value" value="${escapeHTML(value)}" placeholder="Enter a value"></label><button class="small-button remove-spec" type="button" data-remove-spec aria-label="Remove specification">Remove</button></div>`;
  }
  function productFields(row){
    const value=(key,fallback='')=>escapeHTML(row?.[key]??fallback);
    return `<label>Type<select name="product_type" required><option value="gem" ${row?.product_type==='gem'?'selected':''}>Gemstone</option><option value="jewellery" ${row?.product_type==='jewellery'?'selected':''}>Jewellery</option><option value="watch" ${row?.product_type==='watch'?'selected':''}>Watch</option></select></label>
      <label>Category<select name="category" required>${categoryOptions(row?.product_type||'gem',row?.category||'',row?.category||'')}</select><span class="field-help">Manage these options in Categories.</span></label>
      <label class="full">Product name<input name="name" value="${value('name')}" required autocomplete="off"></label>
      <label class="full">URL slug<input name="slug" value="${value('slug')}" autocomplete="off"><span class="field-help">Lowercase letters and hyphens. Generated from the name if left blank.</span></label>
      <label class="full">Description<textarea name="description" rows="3">${value('description')}</textarea></label>
      <label class="full">SEO title<input name="seo_title" value="${value('seo_title')}" maxlength="70"><span class="field-help">Optional page title for this product. Leave blank to use the product name and store name.</span></label>
      <label class="full">SEO description<textarea name="seo_description" rows="3" maxlength="320">${value('seo_description')}</textarea><span class="field-help">Optional search and social description. Leave blank to use the product description.</span></label>
      <label class="full">Image URL<input name="image_url" id="imageUrl" type="url" value="${value('image_url')}" placeholder="https://…"></label>
      <label class="full">Upload product image<input name="product_file" id="productFile" type="file" accept="image/jpeg,image/png,image/webp,image/gif" data-upload-inline="product" data-feedback-id="editorUploadPreview"><div class="upload-feedback" id="editorUploadPreview" role="status" aria-live="polite" hidden></div></label>
      <label>Storefront status<select name="status"><option value="draft" ${value('status','published')==='draft'?'selected':''}>Draft</option><option value="published" ${value('status','published')==='published'?'selected':''}>Published</option><option value="archived" ${value('status')==='archived'?'selected':''}>Archived</option></select><span class="field-help">Published products appear on the customer storefront.</span></label>
      <label>Display order<input name="sort_order" type="number" value="${value('sort_order','0')}"></label>
      <label class="check-row"><input name="featured" type="checkbox" ${row?.featured?'checked':''}> Feature this item</label>
      <section class="full specifications-editor" aria-label="Product specifications"><div class="specifications-heading"><div><b>Specifications</b><span class="field-help">Product type loads its standard fields. Leave unused values blank or add your own specifications.</span></div><button class="small-button" type="button" data-add-spec>Add specification</button></div><div class="specification-list">${specificationRows(row?.specs,row?.product_type||'gem')}</div></section>`;
  }
  function articleFields(row){
    const value=key=>escapeHTML(row?.[key]||'');
    return `<label class="full">Article title<input name="title" value="${value('title')}" required></label><label>Category<input name="category" value="${value('category')||'Insight'}"></label><label>URL slug<input name="slug" value="${value('slug')}"><span class="field-help">Generated from the title if left blank.</span></label><label class="full">Short summary<textarea name="excerpt" rows="3">${value('excerpt')}</textarea></label><label class="full">Article content<textarea name="content" rows="8" required>${value('content')}</textarea></label><label class="full">Cover image URL<input name="cover_image" id="imageUrl" type="url" value="${value('cover_image')}" placeholder="https://…"></label><label class="full">Upload cover image<input name="article_file" id="articleFile" type="file" accept="image/jpeg,image/png,image/webp,image/gif" data-upload-inline="article" data-feedback-id="editorUploadPreview"><div class="upload-feedback" id="editorUploadPreview" role="status" aria-live="polite" hidden></div></label><label>Storefront status<select name="status"><option value="draft" ${row?.status==='draft'?'selected':''}>Draft</option><option value="published" ${!row||row.status==='published'?'selected':''}>Published</option><option value="archived" ${row?.status==='archived'?'selected':''}>Archived</option></select><span class="field-help">Published articles appear on the customer storefront.</span></label>`;
  }
  async function uploadFile(file,onProgress=()=>{}){
    if(!file)throw new Error('Choose a file first.');
    const safeName=file.name.normalize('NFKD').replace(/[^a-zA-Z0-9._-]+/g,'-').replace(/^-|-$/g,'').slice(-90)||'upload';
    const extension=safeName.split('.').pop().toLowerCase();
    const inferredTypes={mp4:'video/mp4',webm:'video/webm',jpg:'image/jpeg',jpeg:'image/jpeg',png:'image/png',webp:'image/webp',gif:'image/gif',ico:'image/x-icon'};
    const contentType=file.type||inferredTypes[extension]||'application/octet-stream';
    if(contentType.startsWith('video/')&&contentType!=='video/mp4')throw new Error('For mobile compatibility, export videos as H.264 MP4 before uploading.');
    const suffix=window.crypto?.randomUUID?.()||Math.random().toString(36).slice(2);
    const key=`${Date.now()}-${suffix}-${safeName}`;
    const {data,error}=await state.client.auth.getSession();
    if(error)throw error;
    if(!data.session?.access_token)throw new Error('Your admin session expired. Sign in again to upload media.');
    const projectURL=state.client.supabaseUrl||window.GEMZ_SUPABASE_CONFIG?.url;
    const publicKey=state.client.supabaseKey||window.GEMZ_SUPABASE_CONFIG?.anonKey;
    if(!projectURL||!publicKey)throw new Error('Supabase Storage is not configured.');
    const url=`${projectURL.replace(/\/$/,'')}/storage/v1/object/gemz-media/${encodeURIComponent(key)}`;
    await new Promise((resolve,reject)=>{
      const request=new XMLHttpRequest();
      request.open('POST',url);
      request.setRequestHeader('apikey',publicKey);
      request.setRequestHeader('Authorization',`Bearer ${data.session.access_token}`);
      request.setRequestHeader('cache-control','max-age=31536000');
      request.setRequestHeader('x-upsert','false');
      request.setRequestHeader('Content-Type',contentType);
      request.upload.addEventListener('progress',event=>{if(event.lengthComputable)onProgress(Math.round(event.loaded/event.total*100))});
      request.addEventListener('load',()=>{
        if(request.status>=200&&request.status<300){onProgress(100);resolve();return}
        let message=`Upload failed (${request.status}).`;
        try{const payload=JSON.parse(request.responseText);message=payload.message||payload.error||message}catch{}
        reject(new Error(message));
      });
      request.addEventListener('error',()=>reject(new Error('Network error while uploading. Check your connection and try again.')));
      request.addEventListener('abort',()=>reject(new Error('Upload cancelled.')));
      request.send(file);
    });
    return state.client.storage.from('gemz-media').getPublicUrl(key).data.publicUrl;
  }
  function uploadFeedbackStart(input,file){
    const box=input.dataset.feedbackId?document.getElementById(input.dataset.feedbackId):null;
    const oldURL=input.dataset.previewObjectUrl;if(oldURL)URL.revokeObjectURL(oldURL);
    const objectURL=URL.createObjectURL(file);input.dataset.previewObjectUrl=objectURL;
    const externalPreview=input.dataset.previewId?document.getElementById(input.dataset.previewId):null;
    if(externalPreview){externalPreview.src=objectURL;externalPreview.hidden=false;if(!externalPreview.dataset.previewClickBound){externalPreview.dataset.previewClickBound='true';externalPreview.addEventListener('click',event=>event.stopPropagation())}}
    if(box){
      const preview=file.type.startsWith('video/')?`<video class="upload-preview-media" src="${objectURL}" muted playsinline controls></video>`:`<img class="upload-preview-media" src="${objectURL}" alt="">`;
      box.innerHTML=`<div class="upload-result">${preview}<div class="upload-result-info"><strong>${escapeHTML(file.name)}</strong><span data-upload-status>Preparing upload…</span><progress max="100" aria-label="Upload progress"></progress></div></div>`;
      box.hidden=false;box.classList.remove('upload-failed');
      if(!box.dataset.previewClickBound){box.dataset.previewClickBound='true';box.addEventListener('click',event=>event.stopPropagation())}
    }
    return {box,externalPreview,objectURL};
  }
  function uploadFeedbackUpdate(view,status,percent,publicURL=''){
    const {box,externalPreview,objectURL}=view;
    if(box){const label=box.querySelector('[data-upload-status]'),bar=box.querySelector('progress');if(label)label.textContent=status;if(bar&&percent==null)bar.removeAttribute('value');else if(bar)bar.value=percent;box.classList.toggle('upload-failed',status.startsWith('Upload failed'))}
    if(publicURL){
      const media=box?.querySelector('.upload-preview-media');if(media){media.src=publicURL;if(media.tagName==='VIDEO')media.load()}
      if(externalPreview){externalPreview.src=publicURL;externalPreview.hidden=false}
      if(objectURL)URL.revokeObjectURL(objectURL);
    }
  }
  async function uploadSelectedFile(input){
    const file=input.files?.[0];if(!file)return'';
    const view=uploadFeedbackStart(input,file),form=input.closest('form'),submit=form?.querySelector('[type="submit"]');input.disabled=true;
    if(form){const count=Number(form.dataset.activeUploads||0);if(!count&&submit)form.dataset.submitWasDisabled=String(submit.disabled);form.dataset.activeUploads=String(count+1);if(submit)submit.disabled=true}
    try{
      uploadFeedbackUpdate(view,'Uploading…',null);
      const url=await uploadFile(file,percent=>uploadFeedbackUpdate(view,`Uploading… ${percent}%`,percent));
      uploadFeedbackUpdate(view,'Upload complete',100,url);return url;
    }catch(error){uploadFeedbackUpdate(view,`Upload failed: ${error.message||'Please retry.'}`,0);throw error}
    finally{
      input.disabled=false;input.value='';
      if(form){const remaining=Math.max(0,Number(form.dataset.activeUploads||1)-1);form.dataset.activeUploads=String(remaining);if(!remaining&&submit){submit.disabled=form.dataset.submitWasDisabled==='true';delete form.dataset.submitWasDisabled}}
    }
  }
  async function handleInlineUpload(input){
    try{const url=await uploadSelectedFile(input);if(url)$('#imageUrl').value=url;notify('Upload complete. Save the record to use this file.')}catch(error){notify(error.message||'Upload failed.','error')}
  }
  function readSpecifications(form){
    const names=[...form.querySelectorAll('[name="spec_name"]')],values=[...form.querySelectorAll('[name="spec_value"]')],specs={};
    names.forEach((field,index)=>{
      const label=field.value.trim(),value=values[index]?.value.trim()||'';
      if(!label||!value)return;
      let key=label.toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_|_$/g,'');
      if(['color','colour'].includes(key))key='colour';
      if(['treatment','treatments'].includes(key))key='treat';
      if(key==='code_no')key='codeNo';
      if(Object.hasOwn(specs,key))throw new Error(`“${label}” is listed more than once. Each specification name must be unique.`);
      specs[key]=value;
    });
    return specs;
  }
  async function saveRecord(event){
    event.preventDefault();if(!state.editing)return;
    const form=event.currentTarget,fd=new FormData(form),kind=state.editing.kind;
    const currentProduct=state.products.find(item=>item.id===state.editing.id);
    const record=kind==='product'?{
      product_type:fd.get('product_type'),category:fd.get('category').trim(),name:fd.get('name').trim(),slug:slugify(fd.get('slug')||fd.get('name')),
      description:fd.get('description').trim(),seo_title:fd.get('seo_title').trim(),seo_description:fd.get('seo_description').trim(),image_url:fd.get('image_url')||null,status:fd.get('status'),featured:fd.has('featured'),
      sort_order:Number(fd.get('sort_order')||0),specs:readSpecifications(form),visual:currentProduct?.visual||defaultVisual,updated_at:new Date().toISOString()
    }:{title:fd.get('title').trim(),slug:slugify(fd.get('slug')||fd.get('title')),category:fd.get('category').trim()||'Insight',excerpt:fd.get('excerpt').trim(),content:fd.get('content').trim(),cover_image:fd.get('cover_image')||null,status:fd.get('status'),updated_at:new Date().toISOString()};
    if(!record.slug)throw new Error('Enter a name that can be used to create a URL slug.');
    const table=kind==='product'?'products':'articles';
    const query=state.editing.id?state.client.from(table).update(record).eq('id',state.editing.id):state.client.from(table).insert(record);
    const {error}=await query;
    if(error)throw error;
    $('#editorDialog').close();notify(`${kind==='product'?'Product':'Article'} saved.`);announceStorefrontChange();await loadAll();
  }
  async function saveCategory(event){
    event.preventDefault();
    const form=event.currentTarget,fd=new FormData(form);
    const record={product_type:fd.get('product_type'),name:fd.get('name').trim(),sort_order:Number(fd.get('sort_order')||0),updated_at:new Date().toISOString()};
    if(!record.name)throw new Error('Enter a category name.');
    const query=state.editingCategory?state.client.from('product_categories').update(record).eq('id',state.editingCategory):state.client.from('product_categories').insert(record);
    const {error}=await query;
    if(error)throw error;
    $('#categoryDialog').close();notify('Category saved.');announceStorefrontChange();await loadAll();
  }
  async function deleteCategory(id){
    const category=state.categories.find(item=>item.id===id);
    if(!category)return;
    const used=state.products.filter(product=>product.product_type===category.product_type&&product.category===category.name).length;
    if(used){notify(`This category is used by ${used} product${used===1?'':'s'}. Reassign or delete those products first.`,'error');return}
    if(!confirm(`Delete the ${category.name} category? This cannot be undone.`))return;
    const {error}=await state.client.from('product_categories').delete().eq('id',id);
    if(error){notify(error.message,'error');return}
    notify('Category deleted.');announceStorefrontChange();await loadAll();
  }
  async function deleteRow(table,id,label){
    if(!confirm(`Delete this ${label}? This cannot be undone.`))return;
    const {error}=await state.client.from(table).delete().eq('id',id);
    if(error){notify(error.message,'error');return}notify(`${label[0].toUpperCase()+label.slice(1)} deleted.`);if(table==='products'||table==='articles')announceStorefrontChange();await loadAll();
  }
  async function updateInquiryStatus(id,status){
    const {error}=await state.client.from('inquiries').update({status}).eq('id',id);
    if(error){notify(error.message,'error');return}notify('Inquiry updated.');await loadAll();
  }
  async function saveSettings(event){
    event.preventDefault();const form=event.currentTarget,fd=new FormData(form),isSeo=form.id==='seoForm',isWhatsApp=form.id==='whatsappForm';
    const notice=$(isSeo?'#seoNoticeGlobal':isWhatsApp?'#whatsappNotice':'#settingsNotice');
    if(isWhatsApp){
      const rawNumber=String(fd.get('whatsapp_number')||'').trim(),digits=rawNumber.replace(/\D/g,'');
      if(form.elements.whatsapp_enabled.checked&&(digits.length<8||digits.length>15)){notice.textContent='Enter a valid international WhatsApp number with 8–15 digits before enabling the floating button.';notice.classList.remove('success');return}
      if(rawNumber&& (digits.length<8||digits.length>15)){notice.textContent='The WhatsApp number must contain 8–15 digits.';notice.classList.remove('success');return}
      fd.set('whatsapp_number',rawNumber);fd.set('whatsapp_enabled',form.elements.whatsapp_enabled.checked?'true':'false');
    }
    const token=String(fd.get('seo_capi_access_token')||'').trim(),clearToken=fd.has('seo_capi_clear_token');
    const rows=[...fd.entries()].filter(([key])=>!['seo_capi_access_token','seo_capi_clear_token'].includes(key)&&!key.endsWith('File')).map(([setting_key,setting_value])=>({setting_key,setting_value,updated_at:new Date().toISOString()}));
    const {error}=await state.client.from('site_settings').upsert(rows,{onConflict:'setting_key'});
    if(error){notice.textContent=error.message;notice.classList.remove('success');return}
    if(isSeo&&(token||clearToken)){
      const secretResult=clearToken
        ?await state.client.from('private_site_settings').delete().eq('secret_key','seo_capi_access_token')
        :await state.client.from('private_site_settings').upsert({secret_key:'seo_capi_access_token',secret_value:token,updated_at:new Date().toISOString()},{onConflict:'secret_key'});
      if(secretResult.error){notice.textContent=`Public SEO settings saved, but the private token could not be saved. ${secretResult.error.message}`;notice.classList.remove('success');return}
      $('#seoCapiClearToken').checked=false;
      $('#seoCapiToken').value='';
    }
    notice.textContent=isSeo?'SEO settings saved. Public metadata and enabled integrations are live.':isWhatsApp?'WhatsApp settings saved. The storefront chat button and enquiry links are updated.':'Site settings saved. Changes are now live on the storefront.';notice.classList.add('success');
    notify(isSeo?'SEO settings saved.':isWhatsApp?'WhatsApp settings saved.':'Site settings saved.');announceStorefrontChange();await loadAll();
  }

  async function loadMedia(){
    $('#mediaGrid').innerHTML=emptyState('Loading media','');
    const {data,error}=await state.client.storage.from('gemz-media').list('',{limit:100,sortBy:{column:'created_at',order:'desc'}});
    if(error){$('#mediaGrid').innerHTML=emptyState('Media could not be loaded',error.message);return}
    const files=(data||[]).filter(item=>item.name&&!item.id?.endsWith('/'));
    $('#mediaGrid').innerHTML=files.length?files.map(item=>{
      const url=state.client.storage.from('gemz-media').getPublicUrl(item.name).data.publicUrl;
      const isVideo=/^video\//.test(item.metadata?.mimetype||'')||/\.(mp4|webm)$/i.test(item.name);
      return `<article class="media-card"><div class="media-preview">${isVideo?`<video src="${escapeHTML(url)}" muted controls preload="metadata"></video>`:`<img src="${escapeHTML(url)}" alt="${escapeHTML(item.name)}" loading="lazy">`}</div><div class="media-info"><strong title="${escapeHTML(item.name)}">${escapeHTML(item.name)}</strong><small>${escapeHTML(item.metadata?.mimetype||'Stored media')}</small><div class="table-actions"><button class="small-button" data-copy-url="${escapeHTML(url)}">Copy URL</button><button class="small-button remove" data-delete-media="${escapeHTML(item.name)}">Delete</button></div></div></article>`;
    }).join(''):emptyState('No media uploaded','Upload a file here or from a product or article editor.');
  }
  async function uploadFromLibrary(input){
    try{const url=await uploadSelectedFile(input);if(!url)return;input.value='';await loadMedia();notify('File uploaded to Supabase Storage.')}catch(error){notify(error.message||'Upload failed.','error')}
  }
  async function handleSettingsUpload(input){
    const form=input.closest('form'),field=form.elements.namedItem(input.dataset.settingsUpload);
    try{const url=await uploadSelectedFile(input);if(!url)return;field.value=url;updateSeoPreviews();notify('Image uploaded. Save page changes to publish it.')}catch(error){notify(error.message||'Upload failed.','error')}
  }
  async function handleSettingsVideoUpload(input){
    const field=input.closest('form').elements.namedItem(input.dataset.settingsVideoUpload);
    try{const url=await uploadSelectedFile(input);if(!url)return;field.value=url;notify('Video uploaded. Save page changes to publish it.')}catch(error){notify(error.message||'Upload failed.','error')}
  }
  async function deleteMedia(name){
    if(!confirm(`Delete ${name} from storage? Any page using its URL will stop showing it.`))return;
    const {error}=await state.client.storage.from('gemz-media').remove([name]);
    if(error){notify(error.message,'error');return}await loadMedia();notify('Media file deleted.');
  }

  function setSeoTab(name){
    const allowed=['overview','technical','offpage','tools','sitemap'];
    if(!allowed.includes(name))return;
    $$('[data-seo-tab]').forEach(button=>{
      const active=button.dataset.seoTab===name;
      button.classList.toggle('active',active);button.setAttribute('aria-selected',String(active));
    });
    $$('[data-seo-panel]').forEach(panel=>panel.hidden=panel.dataset.seoPanel!==name);
  }
  function seoBaseURL(){
    try{const value=new URL($('#seoForm [name="seo_site_url"]').value.trim()||location.origin);return /^https?:$/.test(value.protocol)?value.origin:location.origin}catch{return location.origin}
  }
  function updateSeoPreviews(){
    const form=$('#seoForm');if(!form)return;
    const title=form.elements.seo_home_title?.value.trim()||settingValue('store_name')||'Gemz.lk';
    const description=form.elements.meta_description?.value.trim()||'Add a concise description of the store.';
    const siteUrl=seoBaseURL(),domain=new URL(siteUrl).host;
    $('#seoTitleCount').textContent=String(form.elements.seo_home_title?.value.length||0);
    $('#seoDescriptionCount').textContent=String(form.elements.meta_description?.value.length||0);
    $('#seoSearchTitle').textContent=title;$('#seoSearchURL').textContent=siteUrl;$('#seoSearchDescription').textContent=description;
    $('#seoOgDomain').textContent=domain;
    $('#seoOgTitlePreview').textContent=form.elements.seo_og_title?.value.trim()||title;
    $('#seoOgDescriptionPreview').textContent=form.elements.seo_og_description?.value.trim()||description;
    const image=String(form.elements.seo_og_image?.value||'').trim(),imageCard=$('#seoOgImagePreviewCard');
    let safeImage='';try{const parsed=new URL(image,location.href);if(/^https?:$/.test(parsed.protocol))safeImage=parsed.href}catch{}
    imageCard.style.backgroundImage=safeImage?`linear-gradient(#0c0e1366,#0c0e1366),url("${safeImage.replace(/["\\]/g,'')}")`:'';
    imageCard.textContent=safeImage?'':'Gemz.lk';
    $('#seoBacklinkURL').value=siteUrl;
  }
  function updateRobotsPreview(){
    const field=$('#robotsText');if(!field)return;
    $('#robotsPreview').textContent=field.value.trim()||`User-agent: *\nAllow: /\nSitemap: ${seoBaseURL()}/sitemap.xml`;
  }
  function downloadText(filename,contents,type='text/plain'){
    const blob=new Blob([contents],{type:`${type};charset=utf-8`}),url=URL.createObjectURL(blob),link=document.createElement('a');
    link.href=url;link.download=filename;document.body.append(link);link.click();link.remove();window.setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  function xmlEscape(value){return String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[char]))}
  function generateSitemap(){
    const base=seoBaseURL(),now=new Date().toISOString().slice(0,10),paths=['/','/collection.html','/about.html','/insights.html','/contact.html'];
    const urls=paths.map(path=>({loc:new URL(path,base).href,lastmod:now}));
    for(const category of state.categories){
      const url=new URL('/collection.html',base);url.searchParams.set('section',category.product_type);url.searchParams.set('category',category.name);
      urls.push({loc:url.href,lastmod:String(category.updated_at||category.created_at||now).slice(0,10)});
    }
    for(const product of state.products.filter(item=>item.status==='published')){
      const file=product.product_type==='gem'?'gemstone.html':'jewellery-product.html',url=new URL(`/${file}`,base);url.searchParams.set('slug',product.slug);
      urls.push({loc:url.href,lastmod:String(product.updated_at||product.created_at||now).slice(0,10)});
    }
    const lastmodRegex=/^\d{4}-\d{2}-\d{2}$/;
    state.sitemapText=`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(item=>`  <url><loc>${xmlEscape(item.loc)}</loc><lastmod>${lastmodRegex.test(item.lastmod)?item.lastmod:now}</lastmod></url>`).join('\n')}\n</urlset>`;
    $('#sitemapPreview').textContent=state.sitemapText;$('#sitemapCount').textContent=`${urls.length} URLs`;$('#downloadSitemap').disabled=false;
  }
  function downloadRobots(){updateRobotsPreview();downloadText('robots.txt',$('#robotsPreview').textContent.trim()+'\n')}
  function adsTxtContents(){
    const raw=String($('#seoForm').elements.seo_adsense_id.value||'').trim(),publisher=raw.replace(/^ca-/i,'');
    const lines=/^pub-\d{10,20}$/.test(publisher)?[`google.com, ${publisher}, DIRECT, f08c47fec0942fa0`]:[];
    const extras=String($('#seoForm').elements.seo_ads_txt_lines.value||'').split(/\r?\n/).map(line=>line.trim()).filter(Boolean);
    return [...new Set([...lines,...extras])].join('\n');
  }
  function updateAdsTxtPreview(){
    const contents=adsTxtContents();
    $('#adsTxtPreview').textContent=contents||'Enter a valid AdSense publisher ID or additional seller lines to preview ads.txt.';
  }
  function downloadAdsTxt(){
    const contents=adsTxtContents();
    if(!contents){notify('Enter a valid AdSense publisher ID or additional seller lines.','error');return}
    downloadText('ads.txt',contents+'\n');
  }

  function bindEvents(){
    setSitePage('home');
    $$('.side-nav button').forEach(button=>button.addEventListener('click',()=>{setView(button.dataset.view);if(button.dataset.view==='media')loadMedia();if(button.dataset.view==='seo')updateSeoPreviews()}));
    $$('[data-jump]').forEach(button=>button.addEventListener('click',()=>{setView(button.dataset.jump);if(button.dataset.productType){$('#productTypeFilter').value=button.dataset.productType;renderProducts()}if(button.dataset.jump==='seo')setSeoTab('overview')}));
    $$('[data-site-page-tab]').forEach(button=>button.addEventListener('click',()=>setSitePage(button.dataset.sitePageTab)));
    $('#sitePageTabs').addEventListener('keydown',event=>{if(!['ArrowRight','ArrowLeft','Home','End'].includes(event.key))return;event.preventDefault();const tabs=$$('#sitePageTabs [data-site-page-tab]'),current=tabs.indexOf(document.activeElement);const next=event.key==='Home'?0:event.key==='End'?tabs.length-1:(current+(event.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;tabs[next].focus();tabs[next].click()});
    $('#menuToggle').addEventListener('click',()=>$('#sidebar').classList.toggle('open'));
    $('#refreshButton').addEventListener('click',()=>loadAll().then(()=>state.view==='media'?loadMedia():null));
    $('#signout').addEventListener('click',async()=>{await state.client.auth.signOut();showGate('login')});
    $('#loginForm').addEventListener('submit',async event=>{event.preventDefault();const fd=new FormData(event.currentTarget);$('#loginNotice').textContent='Signing in…';$('#loginNotice').classList.remove('success');const {data,error}=await state.client.auth.signInWithPassword({email:fd.get('email'),password:fd.get('password')});if(error){$('#loginNotice').textContent=error.message;return}await authorize(data.user)});
    $('#productSearch').addEventListener('input',renderProducts);$('#productTypeFilter').addEventListener('change',renderProducts);
    $('#inquiryFilter').addEventListener('change',renderInquiries);
    $('#addProduct').addEventListener('click',()=>openEditor('product'));
    $('#addCategory').addEventListener('click',()=>openCategoryEditor());
    $('#addArticle').addEventListener('click',()=>openEditor('article'));
    $('#productsTable').addEventListener('click',event=>{const edit=event.target.closest('[data-edit-product]'),remove=event.target.closest('[data-delete-product]');if(edit)openEditor('product',state.products.find(item=>item.id===edit.dataset.editProduct));if(remove)deleteRow('products',remove.dataset.deleteProduct,'product')});
    $('#categoriesTable').addEventListener('click',event=>{const edit=event.target.closest('[data-edit-category]'),remove=event.target.closest('[data-delete-category]');if(edit)openCategoryEditor(state.categories.find(item=>item.id===edit.dataset.editCategory));if(remove)deleteCategory(remove.dataset.deleteCategory)});
    $('#articlesTable').addEventListener('click',event=>{const edit=event.target.closest('[data-edit-article]'),remove=event.target.closest('[data-delete-article]');if(edit)openEditor('article',state.articles.find(item=>item.id===edit.dataset.editArticle));if(remove)deleteRow('articles',remove.dataset.deleteArticle,'article')});
    $('#inquiriesTable').addEventListener('change',event=>{const field=event.target.closest('[data-inquiry-status]');if(field)updateInquiryStatus(field.dataset.inquiryStatus,field.value)});
    $('#recentInquiries').addEventListener('change',event=>{const field=event.target.closest('[data-inquiry-status]');if(field)updateInquiryStatus(field.dataset.inquiryStatus,field.value)});
    $('#editorForm').addEventListener('submit',event=>saveRecord(event).catch(error=>notify(error.message||'Could not save record.','error')));
    $('#editorFields').addEventListener('click',event=>{
      if(event.target.closest('[data-add-spec]')){$('.specification-list').insertAdjacentHTML('beforeend',specificationRowHTML());return}
      if(event.target.closest('[data-remove-spec]'))event.target.closest('.specification-row').remove();
    });
    $('#editorFields').addEventListener('change',event=>{
      if(event.target.matches('[data-upload-inline]'))handleInlineUpload(event.target);
      if(event.target.name==='product_type'){
        $('#editorFields [name="category"]').innerHTML=categoryOptions(event.target.value);
        $('.specification-list').innerHTML=specificationRows({},event.target.value);
      }
    });
    $('#closeDialog').addEventListener('click',()=>$('#editorDialog').close());$('#cancelDialog').addEventListener('click',()=>$('#editorDialog').close());
    $('#categoryForm').addEventListener('submit',event=>saveCategory(event).catch(error=>notify(error.message||'Could not save category.','error')));
    $('#closeCategoryDialog').addEventListener('click',()=>$('#categoryDialog').close());$('#cancelCategoryDialog').addEventListener('click',()=>$('#categoryDialog').close());
    $('#settingsForm').addEventListener('submit',event=>saveSettings(event).catch(error=>notify(error.message,'error')));
    $('#whatsappForm').addEventListener('submit',event=>saveSettings(event).catch(error=>notify(error.message,'error')));
    $('#settingsForm').addEventListener('click',event=>{
      const add=event.target.closest('[data-add-content-item]');
      if(add){
        const kind=add.dataset.addContentItem,config=contentRepeaterConfig[kind],container=$(config.container),items=$$('[data-content-item]',container);
        if(items.length>=30){notify('Each section can contain up to 30 items.','error');return}
        container.insertAdjacentHTML('beforeend',contentRepeaterItem(kind,items.length+1,false));syncContentRepeater(kind);return;
      }
      const remove=event.target.closest('[data-remove-content-item]');
      if(remove){
        const kind=remove.dataset.removeContentItem,config=contentRepeaterConfig[kind],container=$(config.container),item=remove.closest('[data-content-item]');
        if($$('[data-content-item]',container).length<=1){notify('Keep at least one item in this section.','error');return}
        item.remove();syncContentRepeater(kind);
      }
    });
    $('#seoForm').addEventListener('submit',event=>saveSettings(event).catch(error=>notify(error.message,'error')));
    $('#settingsForm').addEventListener('change',event=>{if(event.target.matches('[data-settings-upload]'))handleSettingsUpload(event.target);if(event.target.matches('[data-settings-video-upload]'))handleSettingsVideoUpload(event.target)});
    $('#seoForm').addEventListener('change',event=>{if(event.target.matches('[data-settings-upload]'))handleSettingsUpload(event.target)});
    $('#settingsForm').addEventListener('input',event=>{if(event.target.id==='homeCarouselSpeed')updateCarouselSpeedOutput();if(event.target.id==='announcementSpeed')updateAnnouncementSpeedOutput();const previews={store_logo_url:'storeLogoPreview',store_favicon_url:'storeFaviconPreview',about_image_url:'aboutImagePreview',home_heritage_image_url:'homeHeritageImagePreview'},previewId=previews[event.target.name];if(previewId){const preview=document.getElementById(previewId);preview.hidden=!event.target.value;if(event.target.value)preview.src=event.target.value;else preview.removeAttribute('src')}});
    $('#seoForm').addEventListener('input',event=>{
      updateSeoPreviews();
      if(event.target.name==='seo_og_image'){const preview=$('#seoOgImagePreview');preview.hidden=!event.target.value;if(event.target.value)preview.src=event.target.value;else preview.removeAttribute('src')}
      if(event.target.name==='seo_robots_txt'||event.target.name==='seo_site_url')updateRobotsPreview();
      if(event.target.name==='seo_adsense_id'||event.target.name==='seo_ads_txt_lines')updateAdsTxtPreview();
    });
    $$('[data-seo-tab]').forEach(button=>button.addEventListener('click',()=>setSeoTab(button.dataset.seoTab)));
    $('#generateSitemap').addEventListener('click',generateSitemap);
    $('#downloadSitemap').addEventListener('click',()=>{if(state.sitemapText)downloadText('sitemap.xml',state.sitemapText,'application/xml')});
    $('#previewRobots').addEventListener('click',updateRobotsPreview);
    $('#downloadRobots').addEventListener('click',downloadRobots);
    $('#downloadAdsTxt').addEventListener('click',downloadAdsTxt);
    $('#copyBacklinkURL').addEventListener('click',()=>navigator.clipboard?.writeText($('#seoBacklinkURL').value).then(()=>notify('Store URL copied.')).catch(()=>notify($('#seoBacklinkURL').value)));
    $('#mediaFile').addEventListener('change',event=>uploadFromLibrary(event.currentTarget));
    $('#mediaGrid').addEventListener('click',event=>{const copy=event.target.closest('[data-copy-url]'),remove=event.target.closest('[data-delete-media]');if(copy)navigator.clipboard?.writeText(copy.dataset.copyUrl).then(()=>notify('Public URL copied.')).catch(()=>notify(copy.dataset.copyUrl));if(remove)deleteMedia(remove.dataset.deleteMedia)});
  }
  async function init(){
    bindEvents();
    try{state.client=window.GEMZ_SUPABASE||await window.GEMZ_GET_SUPABASE()}catch(error){showGate('setup');$('#setupCard p').insertAdjacentHTML('beforeend',`<br><br><span class="notice">${escapeHTML(error.message)}</span>`);return}
    if(!state.client){showGate('setup');return}
    const {data,error}=await state.client.auth.getSession();
    if(error){showGate('login',error.message);return}
    if(data.session)await authorize(data.session.user);else showGate('login');
    state.client.auth.onAuthStateChange((event,session)=>{
      if(event==='SIGNED_OUT'){showGate('login');return}
      if(session&&event==='SIGNED_IN')setTimeout(()=>authorize(session.user),0);
    });
  }
  init();
})();
