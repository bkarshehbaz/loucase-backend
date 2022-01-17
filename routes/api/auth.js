const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const auth = require("../../middleware/auth");
const jwt = require("jsonwebtoken");
const config = require("config");
const { check, validationResult } = require("express-validator");
var generator = require("generate-password");

const nodemailer = require("nodemailer");

const Profile = require("../../models/Profile");
const User = require("../../models/User");

// @route    GET api/auth
// @desc     Get user by token
// @access   Private
router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route    GET api/auth
// @desc     Re-Send User Password
// @access   Public
router.get(
  "/resendpassword",
  check("email", "Please enter email address").exists(),
  check("email", "Please include a valid email").isEmail(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      let user = await User.findOne({ email: req.body.email });

      if (!user) {
        return res.status(400).json({ errors: [{ msg: "User does't exist" }] });
      } else {
        //  create new password
        var password = await generator.generate({
          length: 10,
          numbers: true,
        });
        console.log("new password is ", password);
        const salt = await bcrypt.genSalt(10);

        password = await bcrypt.hash(password, salt);
        // store that password in that user's database

        let UpdatedUser = await User.findOneAndUpdate(
          { email: req.body.email },
          { password: password }
        );

        // Now send newly created password to user
        var transporter = await nodemailer.createTransport({
          service: "Gmail",
          auth: {
            user: "bkarshehbaz@gmail.com",
            pass: "jagmagjagmagtaraay",
          },
        });
        var mailOptions = {
          from: "bkarshehbaz@gmail.com",
          to: "egmwxzzcjikfwwhvmo@kvhrr.com",
          subject: "Sending Email using Node.js",
          text: "That was easy!",
        };
        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log("This is error", error);
          } else {
            console.log("Email sent: " + info.response);
            return res.json(UpdatedUser);
          }
        });
      }
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

// @route    POST api/auth
// @desc     Authenticate user & get token
// @access   Public
router.post(
  "/",
  check("email", "Please include a valid email").isEmail(),
  check("password", "Password is required").exists(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      let user = await User.findOne({ email });

      if (!user) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Invalid Credentials" }] });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Invalid Credentials" }] });
      }

      const payload = {
        user: {
          id: user.id,
        },
      };

      jwt.sign(
        payload,
        config.get("jwtSecret"),
        { expiresIn: "5 days" },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  }
);

module.exports = router;
