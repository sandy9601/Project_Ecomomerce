const mongoose = require("mongoose")

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    description: {
        type: String,
        required: true,
        trim:true
    },
    price: {
        type: Number,
        required: true
    },
    currencyId: {
        type: String,
        required: true
    },
    currencyFormat: {
        type: String,
        required: true
        // Rupee symbol
    },
    isFreeShipping: {
        type: Boolean,
        default: false
    },
    productImage: {
        type: String,
        required: true,
        trim:true
    },  // s3 link
    style: {
        type: String
    },
    availableSizes: {
        type:[String]
    },
    installments: {
        type: Number,
    },
    deletedAt: {
        type: Date,
        default:null
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true })


module.exports= mongoose.model("Product",productSchema)