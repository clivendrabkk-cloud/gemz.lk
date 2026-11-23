(() => {
  const $ = (selector, root=document) => root.querySelector(selector);
  const $$ = (selector, root=document) => [...root.querySelectorAll(selector)];
  const escapeHTML=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const state={client:null,user:null,products:[],articles:[],inquiries:[],settings:{},view:'overview',editing:null,toastTimer:null};
  const viewTitles={overview:'Overview',catalog:'Catalog',articles:'Insights',inquiries:'Inquiries',media:'Media library',settings:'Site settings'};

  function notify(message,type='success'){
    const toast=$('#toast');toast.textContent=message;toast.className=`toast show${type==='error'?' error':''}`;
    clearTimeout(state.toastTimer);state.toastTimer=setTimeout(()=>toast.classList.remove('show'),3600);
  }
  function showGate(mode,message=''){
    $('#gate').hidden=false;$('#adminShell').hidden=true;
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
  function fmtDate(value){return value?new Intl.DateTimeFormat(undefined,{dateStyle:'medium',timeStyle:'short'}).format(new Date(value)):'—'}
  function slugify(value){return String(value||'').normalize('NFKD').toLowerCase().trim().replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')}
  function emptyState(title,message){return `<div class="empty-state"><b>${escapeHTML(title)}</b><p>${escapeHTML(message)}</p></div>`}
  function typeName(type){return ({gem:'Gemstone',jewellery:'Jewellery',watch:'Watch'})[type]||type}
  function badge(value){return `<span class="badge ${escapeHTML(value)}">${escapeHTML(String(value||'').replace('_',' '))}</span>`}

  async function authorize(user){
    state.user=user;
    const {data,error}=await state.client.from('gemz_admins').select('user_id').eq('user_id',user.id).maybeSingle();
    if(error){showGate('login','Could not verify admin access. Check that the Supabase schema and RLS policies are installed.');return}
    if(!data){await state.client.auth.signOut();showGate('login','This account is not listed as a Gemz.lk administrator.');return}
    $('#gate').hidden=true;$('#adminShell').hidden=false;$('#userEmail').textContent=user.email||'';
    await loadAll();
  }

  async function loadAll(){
    const [products,articles,inquiries,settings]=await Promise.all([
      state.client.from('products').select('*').order('sort_order').order('created_at',{ascending:false}),
      state.client.from('articles').select('*').order('created_at',{ascending:false}),
      state.client.from('inquiries').select('*').order('created_at',{ascending:false}),
      state.client.from('site_settings').select('*').order('setting_key')
    ]);
    const errors=[products,articles,inquiries,settings].filter(result=>result.error);
    if(errors.length){notify(errors[0].error.message,'error');return}
    state.products=products.data||[];state.articles=articles.data||[];state.inquiries=inquiries.data||[];
    state.settings=Object.fromEntries((settings.data||[]).map(row=>[row.setting_key,row.setting_value]));
    renderAll();
  }
  function renderAll(){renderOverview();renderProducts();renderArticles();renderInquiries();populateSettings()}
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
  function populateSettings(){for(const [key,value] of Object.entries(state.settings)){const field=$(`[name="${CSS.escape(key)}"]`,$('#settingsForm'));if(field)field.value=typeof value==='string'?value:String(value??'')}}

  function openEditor(kind,row=null){
    state.editing={kind,id:row?.id||null};
    $('#editorEyebrow').textContent=kind==='product'?'Catalog item':'Journal article';
    $('#editorTitle').textContent=row?`Edit ${kind}`:`Add ${kind}`;
    $('#editorFields').innerHTML=kind==='product'?productFields(row):articleFields(row);
    $('#editorDialog').showModal();
  }
  function productFields(row){
    const value=(key,fallback='')=>escapeHTML(row?.[key]??fallback);
    const specs=escapeHTML(JSON.stringify(row?.specs||{},null,2));
    const visual=escapeHTML(JSON.stringify(row?.visual||{colors:['#fff3a8','#f2b705','#a86a00'],background:['#3a2a08','#8a5a12']},null,2));
    return `<label>Type<select name="product_type" required><option value="gem" ${row?.product_type==='gem'?'selected':''}>Gemstone</option><option value="jewellery" ${row?.product_type==='jewellery'?'selected':''}>Jewellery</option><option value="watch" ${row?.product_type==='watch'?'selected':''}>Watch</option></select></label>
      <label>Category<input name="category" value="${value('category')}" placeholder="Blue Sapphire, Rings…" required></label>
      <label class="full">Product name<input name="name" value="${value('name')}" required autocomplete="off"></label>
      <label class="full">URL slug<input name="slug" value="${value('slug')}" required autocomplete="off"><span class="field-help">Lowercase letters and hyphens. Generated from the name if left blank.</span></label>
      <label class="full">Description<textarea name="description" rows="3">${value('description')}</textarea></label>
      <label class="full">Image URL<input name="image_url" id="imageUrl" type="url" value="${value('image_url')}" placeholder="https://…"></label>
      <label class="full">Upload product image<div class="upload-inline"><input name="product_file" id="productFile" type="file" accept="image/jpeg,image/png,image/webp,image/gif"><button class="small-button" type="button" data-upload-inline="product">Upload</button></div></label>
      <label>Status<select name="status"><option value="draft" ${value('status','draft')==='draft'?'selected':''}>Draft</option><option value="published" ${value('status')==='published'?'selected':''}>Published</option><option value="archived" ${value('status')==='archived'?'selected':''}>Archived</option></select></label>
      <label>Display order<input name="sort_order" type="number" value="${value('sort_order','0')}"></label>
      <label class="check-row"><input name="featured" type="checkbox" ${row?.featured?'checked':''}> Feature this item</label>
      <label class="full">Specifications JSON<textarea name="specs" class="json-field" rows="6">${specs}</textarea><span class="field-help">For gemstones, keys such as origin, clarity, colour, weight and treat appear in the detail view.</span></label>
      <label class="full">Artwork palette JSON<textarea name="visual" class="json-field" rows="4">${visual}</textarea><span class="field-help">Use colors with three hex values and background with two values for the decorative gem art.</span></label>`;
  }
  function articleFields(row){
    const value=key=>escapeHTML(row?.[key]||'');
    return `<label class="full">Article title<input name="title" value="${value('title')}" required></label><label>Category<input name="category" value="${value('category')||'Insight'}"></label><label>URL slug<input name="slug" value="${value('slug')}" required><span class="field-help">Generated from the title if left blank.</span></label><label class="full">Short summary<textarea name="excerpt" rows="3">${value('excerpt')}</textarea></label><label class="full">Article content<textarea name="content" rows="8" required>${value('content')}</textarea></label><label class="full">Cover image URL<input name="cover_image" id="imageUrl" type="url" value="${value('cover_image')}" placeholder="https://…"></label><label class="full">Upload cover image<div class="upload-inline"><input name="article_file" id="articleFile" type="file" accept="image/jpeg,image/png,image/webp,image/gif"><button class="small-button" type="button" data-upload-inline="article">Upload</button></div></label><label>Status<select name="status"><option value="draft" ${row?.status!=='published'&&row?.status!=='archived'?'selected':''}>Draft</option><option value="published" ${row?.status==='published'?'selected':''}>Published</option><option value="archived" ${row?.status==='archived'?'selected':''}>Archived</option></select></label>`;
  }
  async function uploadFile(file){
    if(!file)throw new Error('Choose a file first.');
    const safeName=file.name.normalize('NFKD').replace(/[^a-zA-Z0-9._-]+/g,'-').replace(/^-|-$/g,'').slice(-90)||'upload';
    const key=`${Date.now()}-${safeName}`;
    const {error}=await state.client.storage.from('gemz-media').upload(key,file,{cacheControl:'31536000',upsert:false,contentType:file.type||undefined});
    if(error)throw error;
    return state.client.storage.from('gemz-media').getPublicUrl(key).data.publicUrl;
  }
  async function handleInlineUpload(kind){
    const input=$(`#${kind==='product'?'productFile':'articleFile'}`);
    try{const url=await uploadFile(input.files?.[0]);$('#imageUrl').value=url;notify('Upload complete. Save the record to use this file.')}catch(error){notify(error.message||'Upload failed.','error')}
  }
  function readJSON(form,name,fallback){const raw=new FormData(form).get(name);if(!raw)return fallback;try{return JSON.parse(raw)}catch{throw new Error(`${name} must be valid JSON.`)}}
  async function saveRecord(event){
    event.preventDefault();if(!state.editing)return;
    const form=event.currentTarget,fd=new FormData(form),kind=state.editing.kind;
    const record=kind==='product'?{
      product_type:fd.get('product_type'),category:fd.get('category').trim(),name:fd.get('name').trim(),slug:slugify(fd.get('slug')||fd.get('name')),
      description:fd.get('description').trim(),image_url:fd.get('image_url')||null,status:fd.get('status'),featured:fd.has('featured'),
      sort_order:Number(fd.get('sort_order')||0),specs:readJSON(form,'specs',{}),visual:readJSON(form,'visual',{}) ,updated_at:new Date().toISOString()
    }:{title:fd.get('title').trim(),slug:slugify(fd.get('slug')||fd.get('title')),category:fd.get('category').trim()||'Insight',excerpt:fd.get('excerpt').trim(),content:fd.get('content').trim(),cover_image:fd.get('cover_image')||null,status:fd.get('status'),updated_at:new Date().toISOString()};
    if(!record.slug)throw new Error('Enter a name that can be used to create a URL slug.');
    const table=kind==='product'?'products':'articles';
    const query=state.editing.id?state.client.from(table).update(record).eq('id',state.editing.id):state.client.from(table).insert(record);
    const {error}=await query;
    if(error)throw error;
    $('#editorDialog').close();await loadAll();notify(`${kind==='product'?'Product':'Article'} saved.`);
  }
  async function deleteRow(table,id,label){
    if(!confirm(`Delete this ${label}? This cannot be undone.`))return;
    const {error}=await state.client.from(table).delete().eq('id',id);
    if(error){notify(error.message,'error');return}await loadAll();notify(`${label[0].toUpperCase()+label.slice(1)} deleted.`);
  }
  async function updateInquiryStatus(id,status){
    const {error}=await state.client.from('inquiries').update({status}).eq('id',id);
    if(error){notify(error.message,'error');return}await loadAll();notify('Inquiry updated.');
  }
  async function saveSettings(event){
    event.preventDefault();const fd=new FormData(event.currentTarget);
    const rows=[...fd.entries()].map(([setting_key,setting_value])=>({setting_key,setting_value,updated_at:new Date().toISOString()}));
    const {error}=await state.client.from('site_settings').upsert(rows,{onConflict:'setting_key'});
    if(error){$('#settingsNotice').textContent=error.message;return}
    $('#settingsNotice').textContent='Settings saved. Changes are now live on the storefront.';$('#settingsNotice').classList.add('success');
    await loadAll();notify('Site settings saved.');
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
  async function uploadFromLibrary(event){
    event.preventDefault();const file=$('#mediaFile').files?.[0];
    try{await uploadFile(file);event.currentTarget.reset();await loadMedia();notify('File uploaded to Supabase Storage.')}catch(error){notify(error.message||'Upload failed.','error')}
  }
  async function deleteMedia(name){
    if(!confirm(`Delete ${name} from storage? Any page using its URL will stop showing it.`))return;
    const {error}=await state.client.storage.from('gemz-media').remove([name]);
    if(error){notify(error.message,'error');return}await loadMedia();notify('Media file deleted.');
  }

  function bindEvents(){
    $$('.side-nav button').forEach(button=>button.addEventListener('click',()=>{setView(button.dataset.view);if(button.dataset.view==='media')loadMedia()}));
    $$('[data-jump]').forEach(button=>button.addEventListener('click',()=>setView(button.dataset.jump)));
    $('#menuToggle').addEventListener('click',()=>$('#sidebar').classList.toggle('open'));
    $('#refreshButton').addEventListener('click',()=>loadAll().then(()=>state.view==='media'?loadMedia():null));
    $('#signout').addEventListener('click',async()=>{await state.client.auth.signOut();showGate('login')});
    $('#loginForm').addEventListener('submit',async event=>{event.preventDefault();const fd=new FormData(event.currentTarget);$('#loginNotice').textContent='Signing in…';$('#loginNotice').classList.remove('success');const {data,error}=await state.client.auth.signInWithPassword({email:fd.get('email'),password:fd.get('password')});if(error){$('#loginNotice').textContent=error.message;return}await authorize(data.user)});
    $('#productSearch').addEventListener('input',renderProducts);$('#productTypeFilter').addEventListener('change',renderProducts);
    $('#inquiryFilter').addEventListener('change',renderInquiries);
    $('#addProduct').addEventListener('click',()=>openEditor('product'));
    $('#addArticle').addEventListener('click',()=>openEditor('article'));
    $('#productsTable').addEventListener('click',event=>{const edit=event.target.closest('[data-edit-product]'),remove=event.target.closest('[data-delete-product]');if(edit)openEditor('product',state.products.find(item=>item.id===edit.dataset.editProduct));if(remove)deleteRow('products',remove.dataset.deleteProduct,'product')});
    $('#articlesTable').addEventListener('click',event=>{const edit=event.target.closest('[data-edit-article]'),remove=event.target.closest('[data-delete-article]');if(edit)openEditor('article',state.articles.find(item=>item.id===edit.dataset.editArticle));if(remove)deleteRow('articles',remove.dataset.deleteArticle,'article')});
    $('#inquiriesTable').addEventListener('change',event=>{const field=event.target.closest('[data-inquiry-status]');if(field)updateInquiryStatus(field.dataset.inquiryStatus,field.value)});
    $('#recentInquiries').addEventListener('change',event=>{const field=event.target.closest('[data-inquiry-status]');if(field)updateInquiryStatus(field.dataset.inquiryStatus,field.value)});
    $('#editorForm').addEventListener('submit',event=>saveRecord(event).catch(error=>notify(error.message||'Could not save record.','error')));
    $('#editorFields').addEventListener('click',event=>{const button=event.target.closest('[data-upload-inline]');if(button)handleInlineUpload(button.dataset.uploadInline)});
    $('#closeDialog').addEventListener('click',()=>$('#editorDialog').close());$('#cancelDialog').addEventListener('click',()=>$('#editorDialog').close());
    $('#settingsForm').addEventListener('submit',event=>saveSettings(event).catch(error=>notify(error.message,'error')));
    $('#mediaUploadForm').addEventListener('submit',event=>uploadFromLibrary(event));
    $('#mediaGrid').addEventListener('click',event=>{const copy=event.target.closest('[data-copy-url]'),remove=event.target.closest('[data-delete-media]');if(copy)navigator.clipboard?.writeText(copy.dataset.copyUrl).then(()=>notify('Public URL copied.')).catch(()=>notify(copy.dataset.copyUrl));if(remove)deleteMedia(remove.dataset.deleteMedia)});
  }
  async function init(){
    bindEvents();
    try{state.client=window.GEMZ_SUPABASE||await window.GEMZ_SUPABASE_READY}catch(error){showGate('setup');$('#setupCard p').insertAdjacentHTML('beforeend',`<br><br><span class="notice">${escapeHTML(error.message)}</span>`);return}
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
