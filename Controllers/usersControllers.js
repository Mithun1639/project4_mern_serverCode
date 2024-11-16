const users = require("../models/usersSchema");
const moment = require("moment");
const csv = require("fast-csv");
const fs = require("fs");
const BASE_URL=process.env.BASE_URL

//register user
exports.userpost = async (req, res) => {
  const file = req.file.filename;
  const { fname, lname, email, mobile, gender, location, status } = req.body;

  if (
    !fname ||
    !lname ||
    !email ||
    !mobile ||
    !status ||
    !location ||
    !gender
  ) {
    return res.status(400).json({ message: "Please fill all the fields" });
  }

  try {
    const preuser = await users.findOne({ email });
    if (preuser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const datacreated = moment(new Date()).format("YYYY-MM-DD, hh:mm:ss");
    // const dateUpdated=moment(new Date()).format("DD-MM-YYYY");

    const user = new users({
      fname,
      lname,
      email,
      mobile,
      gender,
      location,
      status,
      profile: file,
      datacreated,
    });
    const saveddata = await user.save();
    res.status(201).json({ message: "User created successfully", saveddata });
  } catch (error) {
    res.status(401).json({ error });
    console.log("Catch Block Error");
  }
};

//usersget

exports.userget = async (req, res) => {
  const search = req.query.search || "";
  const gender = req.query.gender || "";
  const status = req.query.status || "";
  const sort = req.query.sort || "";
  const page=req.query.page || 1
  const ITEM_PER_PAGE=5;
  // console.log(req.query)
  const query = {
    fname: { $regex: search, $options: "i" },
  };

  if (gender !== "All") {
    query.gender = gender;
  }

  if (status !== "All") {
    query.status = status;
  }

  try {

    const skip=(page - 1)*ITEM_PER_PAGE

    const count=await users.countDocuments(query);
    console.log(count);

    const usersdata = await users
      .find(query)
      .sort({ datacreated: sort == "new" ? -1 : 1 })
      .limit(ITEM_PER_PAGE)
      .skip(skip)

    const pageCount=Math.ceil(count/ITEM_PER_PAGE);


    res.status(200).json({ 
      Pagination:{
        count,pageCount
      },
      usersdata });
  } catch (error) {
    // console.log(error)
    res.status(401).json(error);
  }
};

//get single user
exports.singleuserget = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await users.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ user });
  } catch (error) {
    res.status(401).json(error);
  }
};

//user edit
exports.useredit = async (req, res) => {
  const id = req.params.id;
  // console.log(id)
  const {
    fname,
    lname,
    email,
    mobile,
    gender,
    location,
    status,
    user_profile,
  } = req.body;
  const file = req.file ? req.file.filename : user_profile;

  const dateUpdated = moment(new Date()).format("YYYY-MM-DD, hh:mm:ss");

  try {
    const updateuser = await users.findByIdAndUpdate(
      { _id: id },
      {
        fname,
        lname,
        email,
        mobile,
        gender,
        location,
        status,
        profile: file,
        dateUpdated,
      },
      {
        new: true,
      }
    );
    await updateuser.save();
    res.status(200).json(updateuser);
  } catch (error) {
    res.status(400).json(error);
  }
};

//delete user

exports.userdelete = async (req, res) => {
  const id = req.params.id;

  try {
    const deleteUser = await users.findByIdAndDelete({ _id: id });
    if (!deleteUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(deleteUser);
  } catch (error) {
    res.status(400).json(error);
  }
};

//change status
exports.userstatus = async (req, res) => {
  const id = req.params.id;
  const { status } = req.body;

  const dateUpdated = moment(new Date()).format("YYYY-MM-DD, hh:mm:ss");

  try {
    const userstatusupdate = await users.findByIdAndUpdate(
      { _id: id },
      { status: status, dateUpdated },
      { new: true }
    );
    res.status(200).json(userstatusupdate);
  } catch (error) {
    res.status(400).json(error);
  }
};

// export user (csv)

exports.userExport = async (req, res) => {

  try {
    const usersdata = await users.find();

    const csvStream = csv.format({ headers: true });

    if (!fs.existsSync("public/files/export")) {
      if (!fs.existsSync("public/files")) {
        fs.mkdirSync("public/files/");
      }

      if (!fs.existsSync("public/files/export")) {
        fs.mkdirSync("./public/files/export");
      }
    }

    const writablestream = fs.createWriteStream(
      "public/files/export/users.csv"
    );

    csvStream.pipe(writablestream);

    writablestream.on("finish", function () {
      res.json({
        downloadUrl: `${BASE_URL}/files/export/users.csv`,
      });
    });

    if(usersdata.length>0){
      usersdata.map((user)=>{
        csvStream.write({
          FirstName:user.fname?user.fname:"-",
          LastName:user.lname?user.lname:"-",
          Email:user.email?user.email:"-",
          Phone:user.mobile?user.mobile:"-",
          Status:user.status?user.status:"-",
          Profile:user.profile?user.profile:"-",
          Location:user.location?user.location:"-",
          DateCreated:user.datacreated?user.datacreated:"-",
          DateUpdated:user.dateUpdated?user.dateUpdated:"-",
        })
      })
    } 

    csvStream.end();
    writablestream.end();

  } catch (error) {
    console.log(error);
    res.status(400).json(error);
  }
};
