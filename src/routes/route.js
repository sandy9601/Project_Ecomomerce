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
const{productCreate,getProduct,UpdateProduct, getByid,deleteProduct}=require("../controllers/productController");
const {productValidator}=require("../validator/productValidator")
const {productUpdate}=require("../validator/productUpdate")

// *---------------------------userApis-------------------------------------------------------------------------------------------------------------
router.post("/register", awsApi,userValidation,userCreate);
router.get("/user/:userId/profile", auth,getapi);
router.post("/login", logInUser);
router.put("/user/:userId/profile",auth, updateValidatior, updateUser);

// *---------------------------ProductApis-------------------------------------------------------------------------------------------------------------

router.post("/products",productValidator,awsApi,productCreate)
router.get("/products",getProduct)
router.get("/products/:productId",getByid)
router.put("/products/:productId",productUpdate,UpdateProduct)
router.delete("/products/:productId",deleteProduct)

module.exports = router;
