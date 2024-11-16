const express=require("express");
const router=new express.Router();
const controllers=require("../Controllers/usersControllers");
const upload=require("../multerconfig/storageConfig");

//routes                                    this is the name given in fronted
router.post("/user/register",upload.single("user_profile"),controllers.userpost)

router.get("/users/details",controllers.userget);

router.get("/user/:id",controllers.singleuserget);

router.put("/user/edit/:id",upload.single("user_profile"),controllers.useredit);

router.delete("/user/delete/:id",controllers.userdelete);

router.put("/user/status/:id",controllers.userstatus);

router.get("/userexport",controllers.userExport);


module.exports=router;
