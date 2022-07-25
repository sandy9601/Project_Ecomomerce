const mongoose = require("mongoose");
const userModel = require("../models/userModel");
const bcrypt = require("bcrypt");
const JWT = require("jsonwebtoken");
const secretkey = "Products Management";

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

const userCreate = async function (req, res) {
  try {
    let data = req.body;
    const { fname, lname, email, phone, password, address } = data;

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

    if (!isValid(address)) {
      return res
        .status(400)
        .send({ status: false, message: "address is required" });
    }
    data.profileImage = req.uploadedFileURL;
    data.address = JSON.parse(data.address);

    const { street, city, pincode } = data.address.shipping;

    //* streetValidation

    if (!isValid(street)) {
      return res
        .status(400)
        .send({ status: false, message: "street is required in address" });
    }
    if (!isValidUserDetails(street)) {
      return res.status(400).send({
        status: false,
        message: `${street} is inavlid formate for street`,
      });
    }

    //* cityValidation

    if (!isValid(city)) {
      return res
        .status(400)
        .send({ status: false, message: "city is required" });
    }
    if (!isValidName(city)) {
      return res.status(400).send({
        status: false,
        message: `${city} is not a valid formate  for city`,
      });
    }

    // * pincodeValidation

    if (!isValid(pincode)) {
      return res
        .status(400)
        .send({ status: false, message: "pincode is required" });
    }
    if (!isValidName(city)) {
      return res.status(400).send({
        status: false,
        message: `${pincode} is not a valid formate  for city`,
      });
    }

    const createUser = await userModel.create(data);
    res.status(201).send({
      status: true,
      message: "User created successfully",
      data: createUser,
    });
  } catch (error) {
    res.status(500).send({ status: false, error: error.message });
  }
};

//*...................................................getapi.............................................................//

const getapi = async function (req, res) {
  try {
    let userId = req.params.userId;
    token = req.headers.authorization.split(" ")[1];
    let decoded = JWT.verify(token, secretkey);
    const validUserId = decoded.userId;
    console.log(userId, validUserId);
    if (validUserId != userId) {
      return res
        .status(401)
        .send({
          status: false,
          message: "user don't have permission to get details",
        });
    }
    let user = await userModel.findOne({ _id: userId });
    res
      .status(200)
      .send({ status: true, message: "User profile details", data: user });
  } catch (err) {
    res.status(500).send({ status: false, error: err.message });
  }
};

//*...................................................loginApi.............................................................//

const logInUser = async function (req, res) {
  try {
    const { email, password } = req.body;
    if (!email)
      return res
        .status(400)
        .send({ status: false, msg: "user Name is required" });
    if (!password)
      return res
        .status(400)
        .send({ status: false, msg: "password is required" });

    const check = await userModel.findOne({ email: email });
    if (!check)
      return res.status(400).send({ status: false, msg: "incorrect email" });
    const passwordcheck = bcrypt.compareSync(password, check.password); // true
    if (!passwordcheck)
      return res
        .status(400)
        .send({ status: false, msg: "password is incorrect" });

    let token = JWT.sign(
      {
        userId: check._id.toString(),
      },
      secretkey
    );
    res.setHeader("x-api-key", token);
    res
      .status(200)
      .send({
        status: true,
        message: "User login successfull",
        data: { userId: check._id, token: token },
      });
  } catch (err) {
    res.status(500).send({ status: false, msg: err.message });
  }
};



//*...................................................updatenApi.............................................................//


let validName = /^[a-zA-Z ]{3,30}$/
let validPass = /^[a-zA-Z0-9@*&]{8,15}$/

const updateUser = async function (req, res) {
    let userId = req.params.userId
    let updateData = req.body
    const { fname, lname, email, phone, password, address, profileImage } = updateData
    let final = {}

    if (Object.keys(updateData).length == 0) {
        return res.status(400).send({ status: false, message: "Body Should Not Empty" })
    }

    if (fname) {
        if (!isValid(fname) || !validName.test(fname)) {
            return res.status(400).send({ status: false, message: "first Name is not given or invalid firstName" })
        }
        final.fname = fname
    }

    if (lname) {
        if (!isValid(lname) || !validName.test(lname)) {
            return res.status(400).send({ status: false, message: "last Name is not given or invalid lastName" })
        }
        final.lname = lname
    }

    if (email) {
        if (!isValid(email)) {
            return res.status(400).send({ status: false, message: "Email is required" });

        }
        if (!validator.isEmail(email)) {
            return res.status(400).send({ status: false, message: "Enter a valid email" })
        }
        let uniqueEmail = await userModel.findOne({ email: userDetails.email });
        if (uniqueEmail) {
            return res.status(400).send({ status: false, message: "Email  already Used" })
        }
        final.email = email
    }

    if (profileImage) {
        final.profileImage = profileImage
    }

    if (phone) {
        if (!isValid(phone)) {
            res.status(400).send({ status: false, message: "Phone number is required" });
            return
        }
        if (!/^[6-9]{1}[0-9]{9}$/.test(phone)) {
            res.status(400).send({ status: false, message: "Please provide valid phone number" });
            return;
        }
        let uniquePhone = await userModel.findOne({ phone: userDetails.phone });
        if (uniquePhone) {
            return res.status(400).send({ status: false, message: "Phone no. already Used" })
        }
        final.phone = phone
    }

    if (password) {
        if (!isValid(password)) {
            return res.status(400).send({ status: false, message: "Password is required " })
        }
        if (!validPass.test(password)) {
            return res.status(400).send({ status: false, message: "Password should be min 8 and max length 15" })
        }
        const saltRounds = 10;
        const hash = bcrypt.hashSync(password, saltRounds);
        final.password = hash

    }

    if (address) {

        const newAddress = JSON.parse(address)
        final.address = newAddress

        if (newAddress.shipping) {
            if (!isValid(newAddress.shipping.street)) {
                return res.status(400).send({ status: false, message: "please provide the street" })
            }

            if (!isValid(newAddress.shipping.city)) {
                return res.status(400).send({ status: false, message: "please provide the city" })
            }

            if (!newAddress.shipping.pincode || typeof (newAddress.shipping.pincode) != "number") {
                return res.status(400).send({ status: false, message: "pincode is not given OR it is not is proper format" })
            }

        }

        if (newAddress.billing) {
            if (!isValid(newAddress.billing.street)) {
                return res.status(400).send({ status: false, message: "please provide the street" })
            }

            if (!isValid(newAddress.billing.city)) {
                return res.status(400).send({ status: false, message: "please provide the city" })
            }

            if (!newAddress.billing.pincode || typeof (newAddress.billing.pincode) != "number") {
                return res.status(400).send({ status: false, message: "pincode is not given OR it is not is proper format" })
            }
        }
    }

    const updateResult = await userModel.findOneAndUpdate({ _id: userId }, final, { new: true })
    return res.status(200).send({ status: true, message: "succesfully Updated", Data: updateResult })
}







module.exports = { userCreate, getapi, logInUser,updateUser};
