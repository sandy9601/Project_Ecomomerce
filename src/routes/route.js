const express = require("express");
const router = express.Router();
const{bodyValidation}=require("../middlewares/bodyValidation")
const { awsApi } = require("../middlewares/aws");
const {
  userCreate,
  getapi,
  logInUser,
  updateUser,
} = require("../controllers/userController");
const { updateValidation } = require("../validator/updateValidator");
const { userValidation } = require("../validator/userValidator");
const {auth}=require("../middlewares/auth")
const{productCreate,getProduct,UpdateProduct, getByid,deleteProduct}=require("../controllers/productController");
const {productUpdate}=require("../validator/productUpdate")
const {deletCart,getCart,createCart,updateCart}=require("../controllers/cartController")
const{createOrder,updateOrder}=require("../controllers/orderController")


// *---------------------------userApis-------------------------------------------------------------------------------------------------------------

router.post("/register", userValidation,awsApi,userCreate);
router.post("/login",bodyValidation, logInUser);
router.get("/user/:userId/profile", auth,getapi);
router.put("/user/:userId/profile",auth,updateValidation, updateUser);

// *---------------------------ProductApis-------------------------------------------------------------------------------------------------------------

router.post("/products",bodyValidation,awsApi,productCreate)
router.get("/products",getProduct) // * filter
router.get("/products/:productId",getByid)
router.put("/products/:productId",productUpdate,UpdateProduct)
router.delete("/products/:productId",deleteProduct)

// *---------------------------cartApis-------------------------------------------------------------------------------------------------------------

router.post("/users/:userId/cart",createCart)
router.put("/users/:userId/cart", auth,updateCart)
router.get("/users/:userId/cart", auth,getCart)
router.delete("/users/:userId/cart", auth,deletCart)

// *---------------------------orderApis-------------------------------------------------------------------------------------------------------------

router.post("/users/:userId/orders", createOrder)
router.put("/users/:userId/orders", auth,updateOrder)

module.exports = router;
