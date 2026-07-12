const { createClient } = require("@supabase/supabase-js");


const supabaseUrl = "https://joxgkjjmmvjpfttifdnq.supabase.co";

const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpveGdramptbXZqcGZ0dGlmZG5xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI3NjUwNzIsImV4cCI6MjA5ODM0MTA3Mn0.5NatT0qnx1v260yBpiIQClSkBXg4fyh8Hs0hBToPFuc";


const supabase = createClient(
    supabaseUrl,
    supabaseKey
);



console.log(
    "Realtime listener aktif..."
);



supabase

.channel("attendance-channel")


.on(

    "postgres_changes",

    {
        event: "*",
        schema: "public",
        table: "attendance"
    },


    (payload)=>{


        console.log(
            "PERUBAHAN ATTENDANCE:"
        );


        console.log(payload);


    }

)


.subscribe(
(status)=>{


    console.log(
        "STATUS REALTIME:",
        status
    );


});