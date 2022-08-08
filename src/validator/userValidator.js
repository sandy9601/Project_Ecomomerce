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


let parseJSONSafely= function(str){
  try {
      return JSON.parse(str);
  } catch (e) {
      return null
  }
}

const isValidName = (name) => {
  if (/^[a-zA-Z]+(([',. -][a-zA-Z ])?[a-zA-Z]*)*$/.test(name)) return true;
};

const userValidation = async function (req, res, next) {
  try {
    let data = req.body;
    var { fname, lname, email, phone, password, address } = data;

    
    if (Object.keys(data).length == 0) {
      return res
        .status(400)
        .send({ status: false, message: "Body couldnot be empty" });
    }

    // * fnameValidation

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
    ///data.phone="+91"+phone
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
   
    address = parseJSONSafely(address)
        //console.log(address)

        if (!isNaN(address) || !address) return res.status(400).send({ status: false, message: "Address should be in Object Format look like this. {'key':'value'} and value cannot start with 0-Zero" })
        if (!Object.keys(address).length) return res.status(400).send({ status: false, message: "Shipping and Billing Address are Required" })
        let { shipping, billing, ...remaining } = address
        if (!address.hasOwnProperty("shipping")) return res.status(400).send({ status: false, message: "Shipping Address is required " })
        if (!address.hasOwnProperty("billing")) return res.status(400).send({ status: false, message: "billing Address is required " })

        if (Object.keys(remaining).length > 0) return res.status(400).send({ status: false, message: "Invalid attribute in address body" })

        if (typeof shipping !== "object") return res.status(400).send({ status: false, message: "shipping is invalid type" })
        if (!shipping.hasOwnProperty("street")) return res.status(400).send({ status: false, message: "Shipping street is required " })
        if (!shipping.hasOwnProperty("city")) return res.status(400).send({ status: false, message: "Shipping city is required " })
        if (!shipping.hasOwnProperty("pincode")) return res.status(400).send({ status: false, message: "Shipping pincode is required " })

        if (!isValid(shipping.street)) return res.status(400).send({ status: false, message: " shipping street is invalid " })
        if (!isValid(shipping.city)) return res.status(400).send({ status: false, message: " shipping city is invalid" })
        if (!isValidUserDetails(shipping.city)) return res.status(400).send({ status: false, message: "Shipping city is invalid" })
        if (!/^[1-9]{1}[0-9]{2}[0-9]{3}$/.test(shipping.pincode)) return res.status(400).send({ status: false, message: " shipping pincode is invalid" })



        if (typeof billing !== "object") return res.status(400).send({ status: false, message: "billing is invalid type" })
        if (!billing.hasOwnProperty("street")) return res.status(400).send({ status: false, message: "billing street is required " })
        if (!billing.hasOwnProperty("city")) return res.status(400).send({ status: false, message: "billing city is required " })
        if (!billing.hasOwnProperty("pincode")) return res.status(400).send({ status: false, message: "billing pincode is required " })

        if (!isValid(billing.street)) return res.status(400).send({ status: false, message: " billing street is invalid " })
        if (!isValid(billing.city)) return res.status(400).send({ status: false, message: "billing city is invalid" })
        if (!isValidUserDetails(billing.city)) return res.status(400).send({ status: false, message: "billing city is invalid" })
        if (!/^[1-9]{1}[0-9]{2}[0-9]{3}$/.test(billing.pincode)) return res.status(400).send({ status: false, message: " billing pincode is invalid" })

        data.address = address

    next();

  } catch (error) {
    res.status(500).send({ status: false, error: error.message });
  }
};

module.exports = { userValidation };
