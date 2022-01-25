const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Defining a Model and Creating a Database Schema
// define user schema
const userSchema = mongoose.Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    firstName: {
      type: String,
      required: [true, 'Please provide first name'],
      maxLength: 10,
      minlength: 3,
    },
    lastName: {
      type: String,
      required: [true, 'Please provide last name'],
      maxLength: 10,
      minlength: 3,
    },
    email: {
      type: String,
      required: [true, 'Please provide email'],
      // a regular expression to validate an email address(stackoverflow)
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        'Please provide a valid email',
      ],
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Please provide password'],
      minlength: 6,
      maxLength: 40,
    },
    confirmPassword: {
      type: String,
      required: [true, 'Please provide confirmed Password'],
      minlength: 6,
      maxLength: 40,
    },
    dateOfBirth: {
      type: String,
      maxLength: 15,
    },
    gender: { type: String },
    joinedDate: {
      type: Date,
      default: new Date(),
    },
    cart: {
      items: [
        {
          productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product', // add relationship
            required: [true, 'Please provide Product'],
          },
          quantity: {
            type: Number,
            required: [true, 'Please provide quantity'],
          },
        },
      ],
    },
    role: {
      type: String,
      enum: ['user', 'guide', 'admin'],
      default: 'user',
    },
  },
  {
    timestamps: true,
  }
);

//  Mongoose Schema Instance Methods

// Pre Save Hook. Generate hashed password
userSchema.pre('save', async function (next) {
  // Check if this is new account or password is modfied
  if (!this.isModified('password')) {
    // if the password is not modfied then continue
  } else {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
  }
});

// Create JWT token for the user
userSchema.methods.createJWT = function () {
  const payload = {
    userId: this._id,
    email: this.email,
  };

  return jwt.sign(payload, process.env.TOKEN_SECRET, {
    expiresIn: process.env.JWT_EXPIRE_TIME,
  });
};

// Compare passwords
userSchema.methods.comparePassword = async function (canditatePassword) {
  const isMatch = await bcrypt.compare(canditatePassword, this.password);
  return isMatch;
};

// add to cart
userSchema.methods.addToCart = function (product) {
  const cartProductIndex = this.cart.items.findIndex((cp) => {
    return cp.productId.toString() === product._id.toString();
  });
  let newQuantity = 1;
  const updatedCartItems = [...this.cart.items];

  if (cartProductIndex >= 0) {
    newQuantity = this.cart.items[cartProductIndex].quantity + 1;
    updatedCartItems[cartProductIndex].quantity = newQuantity;
  } else {
    updatedCartItems.push({
      productId: product._id,
      quantity: newQuantity,
    });
  }
  const updatedCart = {
    items: updatedCartItems,
  };
  this.cart = updatedCart;
  return this.save();
};

// Compile model from schema and Exported
module.exports = mongoose.models.User || mongoose.model('User', userSchema);