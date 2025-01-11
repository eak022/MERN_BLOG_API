const bcrypt = require("bcrypt");
const UserModel = require("../models/User");
const salt = bcrypt.genSaltSync(10);
const jwt = require("jsonwebtoken");
require("dotenv").config();
const secret = process.env.SECRET;

//Register
exports.register = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400).send({
      message: "Please provide all requried fields",
    });
    return;
  }
  try {
    const hashedPassword = bcrypt.hashSync(password, salt);
    const user = await UserModel.create({ username, password: hashedPassword });
    res.send({
      message: "User registered successfully",
      user,
    });
  } catch (error) {
    res.status(500).send({
      message:
        error.message ||
        "Something error occurred while registering a new user",
    });
  }
};

//Login
exports.login = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400).send({
      message: "Please provide your username and password.",
    });
    return;
  }

  try {
    const userDoc = await UserModel.findOne({ username });
    if (!userDoc) {
      res.status(404).send({
        message: "User not found",
      });
      return;
    }

    const isPasswordMatched = await bcrypt.compare(password, userDoc.password);
    if (!isPasswordMatched) {
      res.status(401).send({
        message: "Invalid credentials",
      });
      return;
    }

    //loginsuccessfully
    jwt.sign({ username, id: userDoc._id }, secret, {}, (err, token) => {
      if (err)
        return res.status(500).send({
          message: "Internal server error:Authentication Failed",
        });

      //token generated
      res.send({
        message: "User logged in successfully",
        id: userDoc._id,
        username,
        accessToken: token,
      });
    });
  } catch (error) {
    return res.status(500).send({
      message: error.message || "Something error occurred while logging in use",
    });
  }
};
