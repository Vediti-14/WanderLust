const mongoose = require("mongoose");
const review = require("./review");
const Schema = mongoose.Schema;

const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,

  image: {
    type: {
      filename: {
        type: String,
        default: "default",
      },
      url: {
        type: String,
        default:
          "https://www.shutterstock.com/image-photo/wooden-cottage-sea-view-tropical-resort-394081615",
        set: (v) =>
          v === ""
            ? "https://www.shutterstock.com/image-photo/wooden-cottage-sea-view-tropical-resort-394081615"
            : v,
      },
    },
    default: () => ({
      filename: "default",
      url: "https://www.shutterstock.com/image-photo/wooden-cottage-sea-view-tropical-resort-394081615",
    }),
  },

  price: {
    type: Number,
    
    min: 0,
  },

  location: {
    type: String,
    
  },

  country: {
    type: String,
  
  },


  reviews: [
    {
    type: Schema.Types.ObjectId,
    ref: "Review",

 } ]
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
