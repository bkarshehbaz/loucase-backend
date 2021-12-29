const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const auth = require("../../middleware/auth");

const Connections = require("../../models/Connections");
const User = require("../../models/User");
const checkObjectId = require("../../middleware/checkObjectId");

// @route    POST api/posts
// @desc     Create a post
// @access   Private
router.post(
  "/add",
  check("name", "Name is required").notEmpty(),
  check("email", "Email is required").notEmpty(),
  check("phone", "Phone is required").notEmpty(),
  check("serialnumber", "Serial number is required").notEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // Check if user is existed with this serial number or not
      let user = await User.findOne({ serialnumber: req.body.serialnumber });

      if (user) {
        try {
          // Using upsert option (creates new doc if no match is found):
          let Connection = await Connections.findOneAndUpdate(
            { serialnumber: req.body.serialnumber },
            {
              $push: {
                allconnections: {
                  name: req.body.name,
                  email: req.body.email,
                  phone: req.body.phone,
                },
              },
            },
            { new: true, upsert: true, setDefaultsOnInsert: true }
          );
          return res.json(Connection);
        } catch (err) {
          console.error(err.message);
          return res.status(500).send("Server Error");
        }
      } else {
        res.status(400).send("User does't Exist");
      }
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

// @route    POST api/posts
// @desc     Create a post
// @access   Private
router.post(
  "/delete",
  auth,
  check("id", "Connection id is missing").notEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // Check if user is existed with this serial number or not
      // let user = await User.findOne({ serialnumber: req.body.serialnumber });

      if (true) {
        try {
          // Using upsert option (creates new doc if no match is found):
          let Connection = await Connections.findOneAndUpdate(
            { serialnumber: req.body.serialnumber },
            { $pull: { allconnections: { _id: req.body.id } } },
            { new: true }
          );
          return res.json(Connection);
        } catch (err) {
          console.error(err.message);
          return res.status(500).send("Server Error");
        }
      } else {
        res.status(400).send("User does't Exist");
      }
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

// @route    GET api/posts
// @desc     Get all posts
// @access   Private
router.post("/all", auth, async (req, res) => {
  try {
    let Connection = await Connections.find({
      serialnumber: req.body.serialnumber,
    }).sort({ date: -1 });
    res.json(Connection);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route    GET api/posts/:id
// @desc     Get post by ID
// @access   Private
router.get("/:id", auth, checkObjectId("id"), async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }

    res.json(post);
  } catch (err) {
    console.error(err.message);

    res.status(500).send("Server Error");
  }
});

// @route    DELETE api/posts/:id
// @desc     Delete a post
// @access   Private
router.delete("/:id", [auth, checkObjectId("id")], async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }

    // Check user
    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "User not authorized" });
    }

    await post.remove();

    res.json({ msg: "Post removed" });
  } catch (err) {
    console.error(err.message);

    res.status(500).send("Server Error");
  }
});

// @route    PUT api/posts/like/:id
// @desc     Like a post
// @access   Private
router.put("/like/:id", auth, checkObjectId("id"), async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    // Check if the post has already been liked
    if (post.likes.some((like) => like.user.toString() === req.user.id)) {
      return res.status(400).json({ msg: "Post already liked" });
    }

    post.likes.unshift({ user: req.user.id });

    await post.save();

    return res.json(post.likes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route    PUT api/posts/unlike/:id
// @desc     Unlike a post
// @access   Private
router.put("/unlike/:id", auth, checkObjectId("id"), async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    // Check if the post has not yet been liked
    if (!post.likes.some((like) => like.user.toString() === req.user.id)) {
      return res.status(400).json({ msg: "Post has not yet been liked" });
    }

    // remove the like
    post.likes = post.likes.filter(
      ({ user }) => user.toString() !== req.user.id
    );

    await post.save();

    return res.json(post.likes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route    POST api/posts/comment/:id
// @desc     Comment on a post
// @access   Private
router.post(
  "/comment/:id",
  auth,
  checkObjectId("id"),
  check("text", "Text is required").notEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user.id).select("-password");
      const post = await Post.findById(req.params.id);

      const newComment = {
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      };

      post.comments.unshift(newComment);

      await post.save();

      res.json(post.comments);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

// @route    DELETE api/posts/comment/:id/:comment_id
// @desc     Delete comment
// @access   Private
router.delete("/comment/:id/:comment_id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    // Pull out comment
    const comment = post.comments.find(
      (comment) => comment.id === req.params.comment_id
    );
    // Make sure comment exists
    if (!comment) {
      return res.status(404).json({ msg: "Comment does not exist" });
    }
    // Check user
    if (comment.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "User not authorized" });
    }

    post.comments = post.comments.filter(
      ({ id }) => id !== req.params.comment_id
    );

    await post.save();

    return res.json(post.comments);
  } catch (err) {
    console.error(err.message);
    return res.status(500).send("Server Error");
  }
});

module.exports = router;
