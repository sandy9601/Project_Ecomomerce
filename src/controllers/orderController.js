const cartModel = require("../models/cartModel");
const orderModel = require("../models/orderModel");
const mongoose = require("mongoose");

//*..................................................createOrder.............................................................//

const createOrder = async function (req, res) {
  try {
    data = req.body;
    const userId = req.params.userId;
    var{cartId,cancellable}=req.body
    const findingCart = await cartModel
      .findOne({ userId: userId ,cartId:cartId})
      .select({ _id: 0, createdAt: 0, updatedAt: 0, __v: 0 });

      if(!findingCart){
        return res
        .status(400)
        .send({ status: false, message: "cart doesnot exist" });

      }
    if (findingCart.items.length == 0) {
      return res
        .status(400)
        .send({ status: false, message: "odrer is placed already" });
    }
  
    var updateOrder = {};
    updateOrder.userId = findingCart.userId.toString();
    updateOrder.totalQuantity = 0;
    updateOrder.totalPrice = findingCart.totalPrice;
    updateOrder["items"] = findingCart.items;
    updateOrder.totalItems = findingCart.totalItems;
    if(cancellable){
      if(!(cancellable=="false")||(cancellable=="true")){
        return res
        .status(400)
        .send({ status: false, message: "cancellable is only takes true or false values" });

      }
      else{
        updateOrder.cancellable=cancellable
      }
    }



    for (let i = 0; i < updateOrder.items.length; i++) {
      updateOrder.totalQuantity += findingCart.items[i].quantity;
    }

    const orderCreate = await orderModel.create(updateOrder);

    const updateCart = await cartModel.findOneAndUpdate(
      { _id: data.cartId },
      { items: [], totalItems: 0, totalPrice: 0 }
    );
    return res
      .status(201)
      .send({ status: true, message: "Success", data: orderCreate });
  } catch (err) {
    res.status(400).send({ status: false, error: err.message });
  }
};

//*..................................................updateOrder.............................................................//

const updateOrder = async function (req, res) {
  try {
    const userId = req.params.userId;
    const status = req.body.status; 
    const orderId = req.body.orderId;
     if (!mongoose.isValidObjectId(userId)) {
      return res
        .status(400)
        .send({ status: false, message: `${userId} is Invalid UserId` });
    }
    if (!orderId)
      return res
        .status(400)
        .send({ status: false, message: "orderId is Mandatory" });

    if (!mongoose.isValidObjectId(orderId)) {
      return res
        .status(400)
        .send({ status: false, message: `${orderId} is Invalid orderId` });
    }
    const orderDetails = await orderModel
      .findOne({ _id: orderId, userId: userId })
      .populate([{ path: "items.productId" }]);

    if(!orderDetails){
      return res
        .status(400)
        .send({ status: false, message: "No order Found" });
    }
    if (orderDetails.status != "pending") {
      return res
        .status(400)
        .send({
          status: false,
          message:
            "This Order is completed/cancelled no updates needed further",
        });
    }
    if (!orderDetails) {
      return res
        .status(404)
        .send({
          status: false,
          message: `There is No Order With ${orderId} this OrderId having this ${userId} as a userId`,
        });
    }

    if (!status)
      return res
        .status(400)
        .send({ status: false, message: "status is Mandatory" });
    if (!["completed", "cancelled"].includes(status.trim())) {
      return res
        .status(400)
        .send({
          status: false,
          message: 'status only allows ["completed", "cancelled"]',
        });
    }

    if (status == "cancelled" && orderDetails.cancellable == false) {
      return res
        .status(400)
        .send({ status: false, message: "This Order is non-canceble" });
    }
    orderDetails.status = status.trim();
    await orderDetails.save();

    // const updatedOrderData = await orderModel.findByIdAndUpdate({ _id: orderId }, { status: status }, { new: true })
    return res
      .status(200)
      .send({
        status: true,
        message: "Success",
        data: orderDetails,
      });
  } catch (err) {
    res.status(500).send({ status: false, error: err });
  }
};

module.exports = { createOrder, updateOrder };
