var mongoose = require("mongoose");
var Campground = require("./models/campground");
var Comment = require("./models/comment")

var data = [
        {
            name: "Houston Park",
            image: "https://images.pexels.com/photos/699558/pexels-photo-699558.jpeg?auto=compress&cs=tinysrgb&h=350",
            description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic "
        },
        {
            name: "Autin Park",
            image: "https://images.pexels.com/photos/1061640/pexels-photo-1061640.jpeg?auto=compress&cs=tinysrgb&h=350",
            description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic "
        },
        {
            name: "San Anthonio Park",
            image: "https://images.pexels.com/photos/6714/light-forest-trees-morning.jpg?auto=compress&cs=tinysrgb&h=350",
            description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic "
        }
    
    ]

function seedDB(){
    //remove campgrounds
    // Campground.remove({}, function(err){
    //     if(err){
    //         console.log(err)
    //         }
    //         console.log("All Removed!!")
    // //add campground
    //         data.forEach(function(seed){
    //             Campground.create(seed, function(err, campground){
    //                 if(err){
    //                     console.log(err)
    //                 }else{
    //                     console.log("campground CREATED")
                        
    //                     Comment.create(
    //                         {
    //                             text: "I have been to this campground before", 
    //                             author: "Collins Odiachi"
    //                         }, 
    //                         function(err, comment){
    //                             if(err){
    //                                 console.log(err)
    //                             }else{
    //                                 campground.comments.push(comment)
    //                                 campground.save();
    //                                 console.log("Comment have been created")
    //                             }
    //                     })
    //                 }
    //             })
    //         })
    // })
        
    // //add comments
}
module.exports = seedDB;