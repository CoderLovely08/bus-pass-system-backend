import { createClient } from "@supabase/supabase-js";
import { config } from "./app.config.js";

const supabaseUrl = config.SUPABASE.URL;
const supabaseKey = config.SUPABASE.PUBLIC_KEY;
export const supabaseClient = createClient(supabaseUrl, supabaseKey);
