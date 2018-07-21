var mongoose = require("mongoose");


var campSchema=mongoose.Schema({
    name: String,
    image: String,
    imageId: String,
    description: String,
    cost: Number,
    createdAt: {type: Date,   default: Date.now},
    author: {
                id:{
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User"
                    },
                username: String
            },
    comments: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Comment"
                }
            ]
});

module.exports = mongoose.model("Campground", campSchema);