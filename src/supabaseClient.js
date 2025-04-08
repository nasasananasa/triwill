
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://zqqtzonxednxapyrydev.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpxcXR6b254ZWRueGFweXJ5ZGV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM5NzQ4MzAsImV4cCI6MjA1OTU1MDgzMH0.A1ldPj-JKigvgaF5Sunk8lCRrexPHktJ5mqXdI1qURE";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
