const express = require("express");
const router = express.Router();
const {awsApi}=require("../middlewares/aws")
const{userCreate}=require("../controllers/userController")

module.exports = router;

router.post("/register",awsApi,userCreate);



