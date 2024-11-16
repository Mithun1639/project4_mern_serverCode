const mongoose=require("mongoose");

const url=process.env.DBKEY

mongoose.connect(url).then(()=>{
    console.log("Database connected");
}).catch((err)=>{
    console.log(err);
})

module.exports=mongoose;