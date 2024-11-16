const express=require("express");
require("dotenv").config();
// require("./uploads");
const app=express();
const cors=require("cors");
require("./db/conn");
const router=require("./Routes/router")
const port=8005|| process.env.PORT;

app.use(cors());
app.use(express.json());
app.use("/uploads",express.static("./uploads"));
app.use(router);
app.use("/files",express.static("./public/files"))

app.listen(port,()=>{
    console.log(`server start at port ${port}`);
})