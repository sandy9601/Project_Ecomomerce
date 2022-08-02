const cartModel = require("../models/cartModel");
const productModel = require("../models/productModel");
const mongoose = require("mongoose");
const userModel = require("../models/userModel");
const ObjectId = require("mongoose").Types.ObjectId;

let isValid = function (value) {
  if (typeof value === "undefine" || value === null) return false;
  if (typeof value === "string" && value.trim().length === 0) return false;
  return true;
};

let isValidObjectId = function (objectId) {
  if (!ObjectId.isValid(objectId)) return false;
  return true;
};

//*..................................................createCart.............................................................//

const createCart = async function (req, res) {
  try {
    let userId = req.params.userId;
    let reqbody = req.body;

    //* validation UserId

    if (!mongoose.isValidObjectId(userId)) {
      return res
        .status(400)
        .send({ status: false, message: `${userId} is Invalid UserId` });
    }

    let findUserId = await userModel.findById({ _id: userId });

    if (!findUserId) {
      return res
        .status(400)
        .send({ status: false, message: "no user exist with this user id" });
    }

    // if (req.userid != userId) {
    //   return res.status(403).send({
    //     status: false,
    //     message: "not authorized",
    //   });
    // }

    // * validation requestBody

    let { productId, quantity } = reqbody;
    let data = { userId };
    if (!quantity) {
      quantity = 1;
    }
    if (quantity) {
      if (typeof quantity != "number") {
        return res.status(400).send({
          status: false,
          message: "quantity will only consist number",
        });
      }
    }

    //* validation productid

    if (!isValid(productId)) {
      return res
        .status(400)
        .send({ status: false, message: "product is invalid" });
    }

    if (!isValidObjectId(productId)) {
      return res
        .status(400)
        .send({ status: false, message: "product is invalid" });
    }

    //* validation quantity

    data["items"] = [{ productId, quantity }]; // * 

    // * finding productBy productId

    let getProduct = await productModel.findById({ _id: productId });

    if (getProduct == null) {
      return res.status(400).send({
        status: false,
        message: "no product found with this product id",
      });
    }
    let productprice = getProduct.price;

    //* checking if cart present

    let presentCart = await cartModel.findOne({ userId: userId });

    if (presentCart !== null) {

      // * if cart present updating it

      //* caluculating total price and total items

      presentCart.totalPrice += productprice * quantity;
      data.totalPrice = presentCart.totalPrice;

      let newData = [];
      let index = 0;
      let product = 0;
      let number = 0;

      for (let i = 0; i < presentCart.items.length; i++) {
        if (presentCart.items[i].productId == productId) {
          index = i;
          product = presentCart.items[i].productId.toString();
          number = presentCart.items[i].quantity;
        } else {
          newData.push(presentCart.items[i]);
        }
      }

      if (product == 0) {
        // * if product not present in th cart
        // * updating cart

        presentCart.totalItems += 1;
        data.totalItems = presentCart.totalItems;
        let updateCart = await cartModel.findOneAndUpdate(
          { _id: presentCart._id },
          {
            userId: data.userId,
            $addToSet: { items: data.items },
            totalPrice: data.totalPrice,
            totalItems: data.totalItems,
          },
          { new: true }
        );

        // * sending updated cart

        return res
          .status(200)
          .send({ status: true, message: "Success", data: updateCart });

      } else if (product !== 0) {

        // * if product present in cart

        data.totalItems = presentCart.totalItems;
        presentCart.items[index].quantity = number + quantity;
        newData.push(presentCart.items[index]);
        data.items = newData;

        // * updating cart

        let updateCart = await cartModel.findOneAndUpdate(
          { _id: presentCart._id },
          {
            userId: data.userId,
            $set: { items: data.items },
            totalPrice: data.totalPrice,
            totalItems: data.totalItems,
          },
          { new: true }
        );

        // * sending updated cart

        return res
          .status(200)
          .send({ status: true, message: "Success", data: updateCart });
      }
    } else {
        
      // * if cart not present creating it

      // * calculating price and quantity

      let totalPrice = quantity * productprice;
      data.totalprice = totalPrice;

      let totalItems = quantity;
      data.totalItems = totalItems;
    }

    // * creating new cart

    let cartCreated = await cartModel.create({
      userId: data.userId,
      items: data.items,
      totalPrice: data.totalprice,
      totalItems: data.totalItems,
    });

    // * sending new cart in response

    return res
      .status(201)
      .send({ status: true, message: "Success", data: cartCreated });
  } catch (err) {
    res.status(500).send({ status: false, error: err });
  }
};

//*..................................................updateCart.............................................................//

const updateCart = async function (req, res) {
    const data = req.body
    const userId = req.params.userId
    if (!mongoose.isValidObjectId(userId)) {
        return res.status(400).send({ status: false, message: `${userId} is Invalid userId` });
    }
    const { cartId, productId, removeProduct } = data
    if (cartId) {
        if (!mongoose.isValidObjectId(cartId)) {
            return res.status(400).send({ status: false, message: `${cartId} is Invalid cartId` });
        }
    }
    if (!productId)
        return res.status(400).send({ status: false, message: "productId is Mandatory" });
    if (!mongoose.isValidObjectId(productId)) {
        return res.status(400).send({ status: false, message: `${productId} is Invalid productId` });
    }
    const final = {}
    let array = []
    let arr = []
    var quantity = []
    var totalPrice = 0
    console.log(productId);
    const cartData = await cartModel.findById({ _id: cartId })
    console.log(cartData);
    if ((!cartData) || (cartData.totalItems === 0)) {
        return res.status(400).send({ status: false, message: "Cart Not Exist or Empty Cart" })
    }
    console.log(cartData.items.includes({ productId: productId }));
    
    for (let i = 0; i < cartData.items.length; i++) {
        if (removeProduct == 0) {
            if (cartData.items[i].productId.valueOf() === productId) {
                continue;
            }
            else {
                array.push(cartData.items[i])
                arr.push(cartData.items[i].productId)
                quantity.push(cartData.items[i].quantity)
            }
        }
        else {
            if (cartData.items[i].productId.valueOf() === productId) {
                cartData.items[i].quantity--
                if (cartData.items[i].quantity == 0) {
                    continue;
                }
                else {
                    array.push(cartData.items[i])
                    arr.push(cartData.items[i].productId)
                    quantity.push(cartData.items[i].quantity)
                }
            }
            else {
                array.push(cartData.items[i])
                arr.push(cartData.items[i].productId)
                quantity.push(cartData.items[i].quantity)
            }
        }
    }
    const productData = await productModel.find({ _id: { $in: arr } })
    for (let i = 0; i < productData.length; i++) {
        totalPrice += productData[i].price * quantity[i]
    }
    final.totalItems = array.length
    final.totalPrice = totalPrice
    final.items = array
    const updateCart = await cartModel.findByIdAndUpdate({ _id: cartId }, final, { new: true })
    return res.status(200).send({ status: true, message: "Success", data: updateCart })
}

//*..................................................getcart.............................................................//

const getCart = async function (req, res) {
    try {
      let userId = req.params.userId;
  
      if (req.userid != userId) {
        return res.status(403).send({
          status: false,
          message: "not authorized",
        });
      }
  
      let cartdata = await cartModel
        .findOne({ userId: userId })
        .populate([{ path: "items.productId" }]);
  
      if (cartdata.items.length == 0) {
        return res
          .status(404)
          .send({
            status: false,
            message: "the cart does not exists for the given userId",
          });
      } else {
        return res
          .status(200)
          .send({ status: true, message: "Success", data: cartdata });
      }
    } catch (error) {
      res.status(500).send({ status: false, message: error.message });
    }
  };
  


//*..................................................cartDelet.............................................................//

const deletCart = async function (req, res) {
  const userId = req.params.userId;

  if (req.userid != userId) {
    return res.status(403).send({
      status: false,
      message: "not authorized",
    });
  }

  const cartCheck = await cartModel.findOne({ userId: userId });
  if (cartCheck.items.length == 0) {
    return res
      .status(404)
      .send({ status: false, message: "cart is deleted already" });
  }
  const cartFind = await cartModel.findOneAndUpdate(
    { userId: userId },
    { totalPrice: 0, totalItems: 0, items: [] },
    { new: true }
  );
  return res.status(204).send({ status: true, message: "Success" });
};



module.exports = {createCart,updateCart,getCart,deletCart};
