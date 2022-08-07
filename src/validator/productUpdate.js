const productModel = require("../models/productModel");
const mongoose = require("mongoose");
const { uploadFile } = require("../middlewares/aws");

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

const productUpdate = async function (req, res, next) {
  try {
    let data = req.body;
    final = {};
    var {
      title,
      description,
      price,
      currencyId,
      currencyFormat,
      isFreeShipping,
      style,
      availableSizes,
      installments,
      deletedAt,
      isDeleted,
    } = data;

    const productId = req.params.productId;

    if (!mongoose.isValidObjectId(productId)) {
      return res
        .status(400)
        .send({ status: false, message: `${productId} is Invalid productId` });
    }

    const userCheck = await productModel.findById({ _id: productId });
    if (!userCheck) {
      return res.status(404).send({
        status: false,
        message: `no user found with this  ${productId} productId`,
      });
    }
    if (userCheck.isDeleted == true) {
      return res
        .status(400)
        .send({ status: false, message: "we cannot update deleted product" });
    }

    var productImage = req.files;

    if (!productImage) {
      if (Object.keys(data).length == 0) {
        return res
          .status(400)
          .send({ status: false, message: "enter atleast one item to update" });
      }
    }

    // * title validation

    if (title) {
      if (!isValid(title)) {
        return res
          .status(400)
          .send({ status: false, message: "title is required" });
      }

      if (!isValidUserDetails(title)) {
        return res.status(400).send({
          status: false,
          message: `${title} is not a valid formate  for title`,
        });
      }
      const titleCheck = await productModel.findOne({ title: title });
      if (titleCheck) {
        return res.status(400).send({
          status: false,
          messsage: `title ${title} is already used try another one`,
        });
      }
      final.title = title;
    }

    // * description validation
    if (description) {
      if (!isValid(description)) {
        return res
          .status(400)
          .send({ status: false, message: "description is required" });
      }
      if (!isValidUserDetails(description)) {
        return res.status(400).send({
          status: false,
          message: `${description} is not a valid formate  for description`,
        });
      }
      final.description = description;
    }

    // * price validation
    if (price) {
      if (!price || price == "") {
        return res
          .status(400)
          .send({ status: false, message: "price is required" });
      }
      if (price) {
        if (!/^[1-9]\d{0,7}(?:\.\d{1,4})?|\.\d{1,4}$/.test(price)) {
          return res
            .status(400)
            .send({ status: false, message: "price formate is not correct" });
        }
      }
      final.price = price;
    }

    // * currencyId validation

    if (currencyId) {
      if (currencyId.toUpperCase() != "INR") {
        return res.status(400).send({
          status: false,
          message: "currencyId formate is not correct",
        });
      }
      final.currencyId;
    }

    // * currencyId validation

    if (currencyFormat) {
      if (currencyFormat != "₹") {
        return res.status(400).send({
          status: false,
          message: "currencyFormat formate is not correct",
        });
      }
      final.currencyFormat = currencyFormat;
    }

    if (isFreeShipping) {
      if (!["true", "false"].includes(isFreeShipping)) {
        return res.status(400).send({
          status: false,
          message: "isFreeShipping formate is not correct",
        });
      }
      final.isFreeShipping = isFreeShipping;
    }

    // * productImageUpdate

    if (productImage.length != 0) {
      if (
        !/\.(gif|jpe?g|tiff?|png|webp|bmp|jfif)$/i.test(productImage[0].originalname)
      ) {
        return res.status(400).send({
          status: false,
          message: "send productImage in image formate only ex; gif,jpeg,png",
        });
      }
      const awsApi = async function (req, res) {
        if (productImage && productImage.length > 0) {
          let uploadedFileURL = await uploadFile(productImage[0]);
          return uploadedFileURL;
        } else {
          return res.status(400).send({ status:false,message: "No file found" });
        }
      };
      final.productImage = await awsApi();
    }

    // * styleValidation
    if (style) {
      if (style) {
        if (!isValidUserDetails(style)) {
          return res.status(400).send({
            status: false,
            message: `${style} is not a valid formate  for style`,
          });
        }
      }
      final.style = style;
    }
    // * availableSizesValidation

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

            final.availableSizes=result

        }
    }
         
    if (installments) {
      if (!/^[0-9]+$/.test(installments))
        return res.status(400).send({
          status: false,
          message: "installments will only consist number",
        });
      final.installments = installments;
    }

    if (deletedAt) {
      if (deletedAt != "null")
        return res.status(400).send({
          status: false,
          message: "deletedAt is not required at the moment",
        });
      final.deletedAt = deletedAt;
    }

    if (isDeleted) {
      if (isDeleted != "false")
        return res
          .status(400)
          .send({ status: false, message: "isDeleted is false by defualt" });
      final.isDeleted = isDeleted;
    }

    req.final = final;

    next();
  } catch (error) {
    res.status(500).send({ status: false, message: error.message });
  }
};

module.exports = { productUpdate };
