const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const secretKey = "Products Management";
const userModel = require("../models/userModel");

const auth = async function (req, res, next) {
  try {
    const userId = req.params.userId;

    if (!mongoose.isValidObjectId(userId)) {
      return res
        .status(400)
        .send({ status: false, message: `${userId} is Invalid UserId` });
    }

    const uId = await userModel.findById({ _id: userId });
    if (!uId) {
      return res.status(404).send({
        status: false,
        message: `no user found with this  ${userId} UserId`,
      });
    }

    if(!req.headers.authorization){
        return res.status(401).send({status:false,message:"token must be present"})
    }

    token = req.headers.authorization.split(" ")[1];
    if (!token) {
      return res
        .status(401)
        .send({ status: false, message: "token must be present" });
    }

    jwt.verify(
      token,
      secretKey,
      { ignoreExpiration: true },
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
        req.userid= decoded.userId;
        const uersId=req.params.userId

     if (req.userid != uersId) {
        return res.status(403).send({
          status: false,
          message: "not authorized",
        });
      }
     
        next();
      }
    );
  } catch (error) {
    return res.status(500).send({ status: false, error: error.message });
  }
};




// const authorization=async function(req,res,next){
//   try{
// const uersId=req.params.userId

//      if (req.userid != uersId) {
//         return res.status(403).send({
//           status: false,
//           message: "not authorized",
//         });
//       }
//       next()
// }
// catch(err){
//   res.status(500).send({status:false,error:err.message})
// }
// }




module.exports = { auth};
