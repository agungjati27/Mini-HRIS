const path = require("path");
const { createClient } = require("@supabase/supabase-js");

require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const supabaseUrl = process.env.SUPABASE_URL?.trim();
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY?.trim();
const supabaseServiceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
  process.env.SUPABASE_SERVICE_KEY?.trim();

const commonOptions = {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
};

const supabase = supabaseUrl
  ? createClient(supabaseUrl, supabaseAnonKey || supabaseServiceRoleKey || "", commonOptions)
  : null;

const supabaseAdmin = supabaseUrl && supabaseServiceRoleKey
  ? createClient(supabaseUrl, supabaseServiceRoleKey, commonOptions)
  : supabase;

const createSupabaseClient = (accessToken = null) => {
  if (!supabaseUrl) return supabaseAdmin || supabase;

  const clientOptions = {
    ...commonOptions,
    global: {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    },
  };

  return createClient(supabaseUrl, supabaseAnonKey || supabaseServiceRoleKey || "", clientOptions);
};

module.exports = supabaseAdmin || supabase;
module.exports.supabase = supabase;
module.exports.supabaseAdmin = supabaseAdmin || supabase;
module.exports.createSupabaseClient = createSupabaseClient;
