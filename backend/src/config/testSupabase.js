require("dotenv").config();

const supabase = require("./supabase");


async function test(){

    const {data,error} = await supabase
        .from("profiles")
        .select("*");


    console.log(data);
    console.log(error);

}


test();