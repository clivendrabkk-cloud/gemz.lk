/* Public browser configuration only. Add your Supabase project URL and anon/public key.
   Never put a service_role key or other secret in this file. */
window.GEMZ_SUPABASE_CONFIG = {
  url: 'https://yjpdoyrhaguaprtshigl.supabase.co',
  anonKey: 'sb_publishable_k5hMwUvNIFo8CQccKZBXNw_J_y0zcHu'
};

window.GEMZ_SUPABASE_READY = null;
window.GEMZ_GET_SUPABASE = () => {
  const config = window.GEMZ_SUPABASE_CONFIG;
  if (!config?.url || !config?.anonKey) return Promise.resolve(null);
  if (!window.GEMZ_SUPABASE_READY) {
    window.GEMZ_SUPABASE_READY = import('https://esm.sh/@supabase/supabase-js@2')
      .then(({ createClient }) => {
        window.GEMZ_SUPABASE = createClient(config.url, config.anonKey, {
          auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
        });
        return window.GEMZ_SUPABASE;
      })
      .catch(error => {
        console.warn('Gemz Supabase authentication is unavailable.', error);
        return null;
      });
  }
  return window.GEMZ_SUPABASE_READY;
};
