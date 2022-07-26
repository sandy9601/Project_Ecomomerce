const userModel = require("../models/userModel");
const bcrypt = require("bcrypt");
const JWT = require("jsonwebtoken");
const secretkey = "Products Management";
const mongoose=require("mongoose")

//*..................................................userCreation.............................................................//

const userCreate = async function (req, res) {
  try {
    let data = req.body;
        data.profileImage = req.uploadedFileURL;
    const createUser = await userModel.create(data);
    res.status(201).send({
      status: true,
      message: "User created successfully",
      data: createUser,
    });
  } catch (error) {
    res.status(500).send({ status: false, error: error.message });
  }
};

//*...................................................getapi.............................................................//

const getapi = async function (req, res) {
  try {
    let userId = req.params.userId;
    if (!mongoose.isValidObjectId(userId)) {
        return res
          .status(400)
          .send({ status: false, message: `${userId} is Invalid UserId` });
      }
      const uId = await userModel.findById({ _id:userId });
      if (!uId) {
        return res
          .status(404)
          .send({ status: false, message: `no user found with this UserId ${userId}` });
      }
    token = req.headers.authorization.split(" ")[1]
    console.log(token)
    if(!token){
        return res.send({status:false,message:"token must be present"})
    }
    JWT.verify(token,secretkey,{ ignoreExpiration: true },
        function (error, decoded) {
          if (error) {
            return res
              .status(401)
              .send({ status: false, message: "invalid token" });
          }
          if (Date.now() > decoded.exp * 1000) {
            return res
              .status(401)
              .send({ status: false, message: "token expired" });
          }
          const validUserId = decoded.userId;
        
          if (validUserId != userId) {
            return res
              .status(401)
              .send({
                status: false,
                message: "user don't have permission to get details",
              });
          }})

  
    let user = await userModel.findOne({ _id: userId });
    return res
    .status(200)
    .send({ status: true, message: "User profile details", data: user });
    
  } catch (err) {
    res.status(500).send({ status: false, error: err.message });
  }
};

//*...................................................loginApi.............................................................//

const logInUser = async function (req, res) {
  try {
    const { email, password } = req.body;
    if (!email)
      return res
        .status(400)
        .send({ status: false, msg: "user Name is required" });
    if (!password)
      return res
        .status(400)
        .send({ status: false, msg: "password is required" });

    const check = await userModel.findOne({ email: email });
    if (!check)
      return res.status(400).send({ status: false, msg: "incorrect email" });
    const passwordcheck = bcrypt.compareSync(password, check.password); // true
    if (!passwordcheck)
      return res
        .status(401)
        .send({ status: false, msg: "password is incorrect" });

    let token = JWT.sign(
      {
        userId: check._id.toString(),
        
      },
      secretkey,
      { expiresIn: "365d"},
      {iat:Date.now}
    );
    return res
      .status(200)
      .send({
        status: true,
        message: "User login successfull",
        data: { userId: check._id, token: token },
      });
    
  } catch (err) {
    res.status(500).send({ status: false, msg: err.message });
  }
};



//*...................................................updatenApi.............................................................//

const updateUser = async function (req, res) {
    let userId = req.params.userId
    let final = req.final
   // console.log(final)
    const updateResult = await userModel.findOneAndUpdate({ _id: userId }, final, { new: true })
    return res.status(200).send({ status: true, message: "User profile updated", Data: updateResult })
}

module.exports = { userCreate, getapi, logInUser,updateUser};
