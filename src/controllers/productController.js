const productModel = require("../models/productModel");
const mongoose = require("mongoose");
const isValid = function (value) {
  if (typeof value !== "string" || value === null) return false;
  if (typeof value === "string" && value.trim().length === 0) return false;
  return true;
};
const isValidUserDetails = (UserDetails) => {
  if (/^(?=.*?[a-zA-Z])[. %?a-zA-Z\d ]+$/.test(UserDetails)) return true;
};

const isValidName = (name) => {
  if (/^[ a-zA-Z]+(([',. -][a-zA-Z ])?[a-zA-Z]*)*$/.test(name)) return true;
};

//*..................................................productCreation.............................................................//

const productCreate = async function (req, res) {
  try {
    let data = req.body;
 
    var {
      title,
      description,
      price,
      currencyId,
      currencyFormat,
      isFreeShipping,
      productImage,
      style,
      availableSizes,
      installments,
      deletedAt,
      isDeleted,
    } = data;

    // checking the body is Empty Or not

      // * title validation

    if (!isValid(title)) {
      return res
        .status(400)
        .send({ status: false, message: "title is required" });
    }

    //* Validation For Title
    if (!isValidUserDetails(title)) {
      return res.status(400).send({
        status: false,
        message: `${title} is not a valid formate  for title`,
      });
    }

    //* Checking Duplicate Title
    const titleCheck = await productModel.findOne({ title: title })
    if (titleCheck) {
      return res.status(400).send({ status: false, messsage: `title ${title} is already used try another one` })
    }


    // * description validation

    if (!isValid(description)) { return res.status(400).send({ status: false, message: "description is required" }) }

    if (!/^(?=.*?[a-zA-Z])[. ,%?a-zA-Z\d ]+$/.test(description)) { return res.status(400).send({ status: false, message: "description is formate is not correct" }) }
    if (!price) { return res.status(400).send({ status: false, message: "price is required" }) }
    if (price) {
      if (!/^[1-9]\d{0,7}(?:\.\d{1,4})?|\.\d{1,4}$/.test(price)) {
        return res
          .status(400)
          .send({ status: false, message: "price formate is not correct" })
      }
    }

    // * currencyId validation

    if (currencyId) {
      if (currencyId != "INR") {
        return res
          .status(400)
          .send({ status: false, message: "currencyId consist only INR" });
      }
    }
    else {
      data.currencyId = "INR"
    }

    // * currencyId validation

    if (currencyFormat) {
      if (currencyFormat != "₹") {
        return res
          .status(400)
          .send({ status: false, message: "currencyFormat consist only ₹ " });
      }
    }
    else {
      data.currencyFormat = "₹"
    }

    if (isFreeShipping)
      if (!["false"].includes(isFreeShipping)) {
        return res
          .status(400)
          .send({ status: false, message: "isFreeShipping formate is not correct" });
      }


    // * styleValidation
    if (style) {
      if (!isValidUserDetails(style)) {
        return res.status(400).send({
          status: false,
          message: `${style} is not a valid formate  for style`,
        });
      }
    }

    // * availableSizesValidation

    if (!availableSizes || availableSizes == "") {
      return res.status(400).send({ status: false, message: "availableSizes is required" })
    }

    if (availableSizes) {
      let array = availableSizes.split(",").map(x => x.toUpperCase().trim())
      for (let i = 0; i < array.length; i++) {
        if (!(["S", "XS", "M", "X", "L", "XXL", "XL"].includes(array[i].trim()))) {
          return res.status(400).send({ status: false, message: 'Sizes only available from ["S", "XS", "M", "X", "L", "XXL", "XL"]' })
        }

      }
      if (Array.isArray(array)) {
        let uniqeSize = new Set(array)
        let result = [...uniqeSize]

        data.availableSizes = result

      }
    }

    if (installments) {
      if (!/^[0-9]+$/.test(installments))
        return res.status(400).send({ status: false, message: "installments will only consist number" })
    }


    if (deletedAt) {
      if (deletedAt != 'null')
        return res.status(400).send({ status: false, message: "deletedAt is not required at the moment" })

    }

    if (isDeleted) {
      if (isDeleted != 'false')
        return res.status(400).send({ status: false, message: "isDeleted is false by defualt" })

    }
    data.productImage=  req.uploadedFileURL
  
    //* creating product
    const createProduct = await productModel.create(data);
    if (createProduct)
      return res.status(201).send({
        status: true,
        message: "Success",
        data: createProduct,
      });
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
      filter.availableSizes = { $in: size.split(",").map((x) => x.toUpperCase().trim()) }
    }
    if (name) {
      filter.title = { $regex: ".*" + name.toLowerCase().trim() + ".*" }
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
      .sort({ price: 1 }); 
      //.sort({price:-1})
    if (filterData.length > 0) {
      return res
        .status(200)
        .send({ status: true, message: "Success", data: filterData });
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
        .send({ status: true, message: "Success", data: getByid });
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
        message: "Update product details is successful",
        data: updateResult,
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
      { isDeleted: true, deletedAt: Date.now() },
      { new: true }
    );
    if (getByid) {
      return res
        .status(200)
        .send({ status: true, message: "successfully deleted the product" });
    } else {
      return res
        .status(404)
        .send({ status: false, message: "No product found or product deleted already" });
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
