const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    trim: true,
    enum: ["MALE", "FEMALE", "OTHERS"]
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: String

  },
  photo: {
    type: String,
    default: 'default.jpg',
  },
  address: {
    country: { type: String },
    state: { type: String },
    city: { type: String },
    pincode: { type: Number },
    },
  password: {
    type: String,
  },
  confirmPassword: {
    type: String,
    }
  }, { timestamps: true })

module.exports = mongoose.model("User", userSchema)