const express = require("express");
const router = express.Router();
const { awsApi } = require("../middlewares/aws");
const {
  userCreate,
  getapi,
  logInUser,
  updateUser,
} = require("../controllers/userController");
const { updateValidatior } = require("../validator/updateValidator");
const { userValidation } = require("../validator/userValidator");
const {auth}=require("../authorization/auth")

// *---------------------------userApis-------------------------------------------------------------------------------------------------------------
router.post("/register", awsApi,userValidation,userCreate);
router.get("/user/:userId/profile", auth,getapi);
router.post("/login", logInUser);
router.put("/user/:userId/profile",auth, updateValidatior, updateUser);



module.exports = router;