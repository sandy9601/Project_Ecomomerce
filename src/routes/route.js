const express = require("express");
const router = express.Router();
const {awsApi}=require("../middlewares/aws")
const{userCreate, getapi,logInUser}=require("../controllers/userController")

module.exports = router;

router.post("/register",awsApi,userCreate);
router.get("/user/:userId/profile",getapi);
router.post("/login",logInUser)


