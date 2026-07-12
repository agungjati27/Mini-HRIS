import {createClient}
from "@supabase/supabase-js";


const supabaseUrl =
"https://joxgkjjmmvjpfttifdnq.supabase.co";


const supabaseAnonKey =
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpveGdramptbXZqcGZ0dGlmZG5xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI3NjUwNzIsImV4cCI6MjA5ODM0MTA3Mn0.5NatT0qnx1v260yBpiIQClSkBXg4fyh8Hs0hBToPFuc";



export const supabase =
createClient(

supabaseUrl,

supabaseAnonKey

);