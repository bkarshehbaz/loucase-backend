const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ConnectionsSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  serialnumber: {
    type: String,
    requird: true,
  },
  allconnections: [
    {
      name: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
      phone: {
        type: String,
      },
      date: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

module.exports = mongoose.model("connections", ConnectionsSchema);
