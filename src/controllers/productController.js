const productModel = require("../models/productModel");
const mongoose = require("mongoose");

//*..................................................productCreation.............................................................//

const productCreate = async function (req, res) {
  try {
    let data = req.body;
    data.productImage = req.uploadedFileURL;
    const createProduct = await productModel.create(data);
    if(createProduct)
    return res.status(201).send({
      status: true,
      message: "product created successfully",
      data: createProduct,
    });
    console.log(installments)
  } catch (error) {
    res.status(500).send({ status: false, error: error.message });
  }
};

//*..................................................Getfilter product.............................................................//

const getProduct = async function (req, res) {
  try {
    var filter = {};
    let query = req.query;
    let { size, name, priceGreaterThan, priceLessThan } = query;
    if (size) {
      filter.availableSizes ={$in:size.split(",").map((x)=>x.toUpperCase().trim())}
    }
    if (name) {
      filter.title = {$in:name}
    }
    if (priceGreaterThan) {
      filter.price = { $gt: priceGreaterThan };
    }
    if (priceLessThan) {
      filter.price = { $lt: priceLessThan };
    }

    if (priceGreaterThan && priceLessThan) {
      filter.price = { $gt: priceGreaterThan, $lt: priceLessThan };
    }

    const filterData = await productModel
      .find({
        $and: [{ isDeleted: false }, filter],
      })
      .sort({ price: 1 }); //.sort({price:-1})
    if (filterData.length > 0) {
      return res
        .status(200)
        .send({ status: true, message: "filtered data", data: filterData });
    } else {
      return res
        .status(404)
        .send({ ststus: false, message: "no product found" });
    }
  } catch (err) {
    res.status(500).send({ status: false, error: err.message });
  }
};

//*..................................................getBYid.............................................................//

const getByid = async function (req, res) {
  try {
    const productid = req.params.productId;
    if (!mongoose.isValidObjectId(productid)) {
      return res
        .status(400)
        .send({ status: false, message: `${productid} is Invalid productId` });
    }
    const getByid = await productModel.findOne({
      $and: [{ isDeleted: false }, { _id: productid }],
    });
    if (getByid) {
      return res
        .status(200)
        .send({ status: true, message: "success", data: getByid });
    } else {
      return res
        .status(404)
        .send({ status: false, message: "No product found" });
    }
  } catch (err) {
    res.status(500).send({ status: false, error: err.message });
  }
};

//*..................................................productUpdate.............................................................//

const UpdateProduct = async function (req, res) {
  try {
    let productId = req.params.productId;
    let final = req.final;
    const updateResult = await productModel.findOneAndUpdate(
      { _id: productId },
      final,
      { new: true }
    );
    if (updateResult) {
      return res.status(200).send({
        status: true,
        message: "User profile updated",
        Data: updateResult,
      });
    }
  } catch (err) {
    res.status(500).send({ status: false, error: err.message });
  }
};

//*..................................................productDeleted.............................................................//

const deleteProduct = async function (req, res) {
  try {
    const productid = req.params.productId;
    if (!mongoose.isValidObjectId(productid)) {
      return res
        .status(400)
        .send({ status: false, message: `${productid} is Invalid productId` });
    }
    const getByid = await productModel.findOneAndUpdate(
      { $and: [{ isDeleted: false }, { _id: productid }] },
      { isDeleted: true,deletedAt:Date.now()},
      { new: true }
    );
    if (getByid) {
      return res
        .status(200)
        .send({ status: true, message: "successfully deleted the product", data: getByid });
    } else {
      return res
        .status(404)
        .send({ status: false, message: "No product found" });
    }
  } catch (err) {
    res.status(500).send({ status: false, error: err.message });
  }
};

module.exports = {
  productCreate,
  getProduct,
  UpdateProduct,
  getByid,
  deleteProduct,
};
