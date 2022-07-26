const userModel = require("../models/userModel");
const bcrypt = require("bcrypt");

const isValid = function (value) {
  if (typeof value !== "string" || value === null) return false;
  if (typeof value === "string" && value.trim().length === 0) return false;
  return true;
};
const isValidUserDetails = (UserDetails) => {
  if (/^(?=.*?[a-zA-Z])[. %?a-zA-Z\d ]+$/.test(UserDetails)) return true;
};

const isValidName = (name) => {
  if (/^[a-zA-Z]+(([',. -][a-zA-Z ])?[a-zA-Z]*)*$/.test(name)) return true;
};

const userValidation = async function (req, res, next) {
  try {
    let data = req.body;
    var { fname, lname, email, phone, password, address } = data;

    // * fnameValidation
    if (Object.keys(data).length == 0) {
      return res
        .status(400)
        .send({ status: false, message: "Body couldnot be empty" });
    }

    if (!isValid(fname)) {
      return res
        .status(400)
        .send({ status: false, message: "fname is required" });
    }
    if (!isValidName(fname)) {
      return res.status(400).send({
        status: false,
        message: `${fname} is not a valid formate  for fname`,
      });
    }

    // * lnameValidation

    if (!isValid(lname)) {
      return res
        .status(400)
        .send({ status: false, message: "lname is required" });
    }
    if (!isValidName(lname)) {
      return res.status(400).send({
        status: false,
        message: `${lname} is not a valid formate  for lname`,
      });
    }

    // * emailValidation

    if (!isValid(email)) {
      return res
        .status(400)
        .send({ status: false, message: "email is required" });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).send({
        status: false,
        message: `${email} is not a valid formate  for email`,
      });
    }

    const checkEmail = await userModel.findOne({ email: email });
    if (checkEmail) {
      return res.status(400).send({
        status: false,
        message: `${email} is already used please use another email`,
      });
    }
    // * phoneValidation
    if (!isValid(phone)) {
      return res
        .status(400)
        .send({ status: false, message: "phoneNumber is required" });
    }

    if (!/^(?:(?:\+|0{0,2})91(\s*[\-]\s*)?|[0]?)?[6789]\d{9}$/.test(phone)) {
      return res.status(400).send({
        status: false,
        message: `${phone} is invalid please enter a valid phone number`,
      });
    }
    const checkPhone = await userModel.findOne({ phone: phone });
    if (checkPhone) {
      return res.status(400).send({
        status: false,
        message: `${phone} is already used please use another phoneNumber`,
      });
    }

    // * passwordValidation

    if (!isValid(password)) {
      return res
        .status(400)
        .send({ status: false, message: "password is required" });
    }
    if (password.length < 8 || password.length > 15) {
      return res.status(400).send({
        status: false,
        message: "password must contains atleast 8 charcaters upto 15",
      });
    }
    //* password decrypt
    var saltRounds = 10;
    const hash = bcrypt.hashSync(password, saltRounds);
    data.password = hash; // * assigning dcrypted password

    // *addressValidation

    data.address = JSON.parse(data.address);
    var { street, city, pincode } = data.address.shipping;

    //* streetValidation In shipping

    if (!isValid(street)) {
      return res
        .status(400)
        .send({
          status: false,
          message: "street is required in shipping address",
        });
    }
    if (!isValidUserDetails(street)) {
      return res.status(400).send({
        status: false,
        message: `${street} is inavlid formate for street in shipping address`,
      });
    }

    //* cityValidation in shipping

    if (!isValid(city)) {
      return res
        .status(400)
        .send({
          status: false,
          message: "city is required in shipping address",
        });
    }
    if (!isValidName(city)) {
      return res.status(400).send({
        status: false,
        message: `${city} is not a valid formate  for city in shipping address`,
      });
    }

    // * pincodeValidation

    if (!/^[1-9]{1}[0-9]{2}[0-9]{3}$/.test(pincode)) {
      return res.status(400).send({
        status: false,
        message: " enter valid pincode in number only in shipping address",
      });
    }

    // * billingAddressValidation

    var { street, city, pincode } = data.address.billing;
    //* streetValidation in billing address

    if (!isValid(street)) {
      return res
        .status(400)
        .send({
          status: false,
          message: "street is required in  billing address",
        });
    }
    if (!isValidUserDetails(street)) {
      return res.status(400).send({
        status: false,
        message: `${street} is inavlid formate for street in billing address`,
      });
    }

    //* cityValidation in billing address

    if (!isValid(city)) {
      return res
        .status(400)
        .send({
          status: false,
          message: "city is required in billing address",
        });
    }
    if (!isValidName(city)) {
      return res.status(400).send({
        status: false,
        message: `${city} is not a valid formate  for city in billing address`,
      });
    }

    // * pincodeValidation in billing address

    if (!/^[1-9]{1}[0-9]{2}[0-9]{3}$/.test(pincode)) {
      return res.status(400).send({
        status: false,
        message: " enter valid pincode in number only in billing address",
      });
    }

    next();
  } catch (error) {
    res.status(500).send({ status: false, error: error.message });
  }
};

module.exports = { userValidation };
