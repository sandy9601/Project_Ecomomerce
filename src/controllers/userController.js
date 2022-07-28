const userModel = require("../models/userModel");
const bcrypt = require("bcrypt");
const JWT = require("jsonwebtoken");
const secretkey = "Products Management";


//*..................................................userCreation.............................................................//

const userCreate = async function (req, res) {
  try {
    let data = req.body;
    data.profileImage = req.uploadedFileURL;
    const createUser = await userModel.create(data);
    return res.status(201).send({
      status: true,
      message: "User created successfully",
      data: createUser,
    });
  } catch (error) {
    res.status(500).send({ status: false, error: error.message });
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
        .status(401)
        .send({ status: false, msg: "password is incorrect" });

    let token = JWT.sign(
      {
        userId: check._id.toString(),
      },
      secretkey,
      { expiresIn: "365d" },
      { iat: Date.now }
    );
    return res.status(200).send({
      status: true,
      message: "User login successfull",
      data: { userId: check._id, token: token },
    });
  } catch (err) {
    res.status(500).send({ status: false, msg: err.message });
  }
};

//*...................................................getapi.............................................................//

const getapi = async function (req, res) {
  try {
    const userId = req.params.userId;

    const resuser = await userModel.findById({ _id: userId });
    if (resuser) {
      return res
        .status(200)
        .send({ status: true, message: "User profile details", data: resuser });
    }
  } catch (error) {
    return res.status(500).send({ status: false, error: error.message });
  }
};


//*...................................................updatenApi.............................................................//

const updateUser = async function (req, res) {
  try {
    let userId = req.params.userId;
    let final = req.final;
    const updateResult = await userModel.findOneAndUpdate(
      { _id: userId },
      final,
      { new: true }
    );
    return res.status(200).send({
      status: true,
      message: "User profile updated",
      Data: updateResult,
    });
  } catch (err) {
    res.status(500).send({ status: false, error: err.message });
  }
};

module.exports = { userCreate, getapi, logInUser, updateUser };
