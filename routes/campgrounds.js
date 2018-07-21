var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var middleware = require("../middleware")
// var request    = require("request")
var multer     = require ("multer");
var storage    = multer.diskStorage({
    filename: function (req, file, callback){
        callback(null, Date.now() + file.originalname);
    }
});

var imageFilter = function (req, file, cb){
    //accept image files only
    if(!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)){
        return cb(new Error("Only image files are allowed"), false)
    }
    cb(null, true)
};
var upload = multer({storage: storage, fileFilter: imageFilter})

var cloudinary = require("cloudinary");
cloudinary.config({
    cloud_name: "dy5b1ciyq",
    api_key: "894168973594651",
    api_secret: "SlqvYZzNhSTyrwWLcWEv2QgeW9w"
})

// //INDEX ROUTE: Show all campgroundj
// router.get("/", function(req, res){
//      if(req.query.search) {
//         const regex = new RegExp(escapeRegex(req.query.search), 'gi');
//         Campground.find({ name: regex}, function(err, allCampgrounds){
//             if(err){
//                 console.log(err);
//             }else{
//                 res.render("campgrounds/index", {campgrounds: allCampgrounds, page: "campgrounds"})
//             }
//         })
//     }
// })

//INDEX - show all campgrounds
router.get("/", function(req, res){
    var noMatch = null;
    if(req.query.search) {
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        // Get all campgrounds from DB
        Campground.find({name: regex}, function(err, allCampgrounds){
           if(err){
               console.log(err);
           } else {
              if(allCampgrounds.length < 1) {
                  noMatch = "No campgrounds match that query, please try again.";
              }
              res.render("campgrounds/index",{campgrounds:allCampgrounds, noMatch: noMatch});
           }
        });
    } else {
        // Get all campgrounds from DB
        Campground.find({}, function(err, allCampgrounds){
           if(err){
               console.log(err);
           } else {
              res.render("campgrounds/index",{campgrounds:allCampgrounds, noMatch: noMatch});
           }
        });
    }
});

//CREATE - add new campground to DB
router.post("/", middleware.isLoggedIn, upload.single('image'), function(req, res) {
    cloudinary.v2.uploader.upload(req.file.path, function(err, result) {
      if(err) {
        req.flash('error', err.message);
        return res.redirect('back');
      }
      // add cloudinary url for the image to the campground object under image property
      req.body.campground.image = result.secure_url;
      // add image's public_id to campground object
      req.body.campground.imageId = result.public_id;
      // add author to campground
      req.body.campground.author = {
        id: req.user._id,
        username: req.user.username
      }
      req.body.campground.cost = req.body.cost;
      console.log(req.body)
      Campground.create(req.body.campground, function(err, campground) {
        if (err) {
          req.flash('error', err.message);
          return res.redirect('back');
        }
        res.redirect('/campgrounds/' + campground.id);
      });
    });
});






//CREATE:Add new campground to DB 
// router.post("/", middleware.isLoggedIn, function(req, res){
//     var name=req.body.name;
//     var image=req.body.image;
//     var desc=req.body.description;
//     var cost = req.body.cost;
//     var author={
//         id: req.user._id,
//         username: req.user.username
//         };
//     var newCampground={name:name, image:image, description:desc, cost:cost, author: author}
//     Campground.create( newCampground, function(err, newlyCreated){
//         if(err){
//             console.log(err)
//         }else{
           
//             res.redirect("/campgrounds")
//         }
//     })
// })

//NEW ROUTE: Shows form to create a new campground
router.get("/new", middleware.isLoggedIn, function(req, res){
    res.render("campgrounds/new");
})


//SHOW ROUTE: Show more info about one campground
router.get("/:id", function(req, res){
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
        if(err){
            console.log(err)
        }else{
            res.render("campgrounds/show", {campground:foundCampground})
        }
    })
})

//  EDIT CAMPGROUND ROUTE
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res){
    Campground.findById(req.params.id, function(err, foundCampground){
        if(err){
            req.flash("error", "Oops! Something went wrong" )
            res.redirect("campgrounds" + req.params.id)
        }else{
            res.render("campgrounds/edit", {campground: foundCampground})
        }
    })
})


router.put("/:id", middleware.checkCampgroundOwnership, upload.single('image'),  function(req, res){
    Campground.findById(req.params.id, async function(err, campground){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            if (req.file) {
              try {
                  await cloudinary.v2.uploader.destroy(campground.imageId);
                  var result = await cloudinary.v2.uploader.upload(req.file.path);
                  campground.imageId = result.public_id;
                  campground.image = result.secure_url;
              } catch(err) {
                  req.flash("error", err.message);
                  return res.redirect("back");
              }
            }
            campground.name = req.body.name;
            campground.description = req.body.description;
            campground.save();
            req.flash("success","Successfully Updated!");
            res.redirect("/campgrounds/" + campground._id);
        }
    });
});



// // UPDATE CAMPGROUND ROUTE
// router.put("/:id", upload.single("image"), middleware.checkCampgroundOwnership, function(req, res){
//     //find and update campground
//     Campground.findById(req.params.id, async, function(err, campground){
//         if(err){
//             req.flash("error", err.message)
//             res.redirect("/campgrounds")
//         }else{
//             if(req.file){
//                 try {
//                     await cloudinary.v2.uploader.destroy(campground.imageId);
//                     var result = await cloudinary.v2.uploader.upload(req.file.path);
//                     campground.imageId = result.public_id
//                     campground.image = result.secure_url
//                 } catch(err){
//                     req.flash("error", err.message)
//                     return res.redirect("back")
//                 }
//             }
//             campground.name = req.body.name;
//             campground.decription = req.body.description;
//             campground.save();
//             req.flash("success", "Successfully updated")
//             res.redirect("/campgrounds/"+ campground._id)
//         }
//     })
// })


router.delete('/:id', function(req, res) {
  Campground.findById(req.params.id, async function(err, campground) {
    if(err) {
      req.flash("error", err.message);
      return res.redirect("back");
    }
    try {
        await cloudinary.v2.uploader.destroy(campground.imageId);
        campground.remove();
        req.flash('success', 'Campground deleted successfully!');
        res.redirect('/campgrounds');
    } catch(err) {
        if(err) {
          req.flash("error", err.message);
          return res.redirect("back");
        }
    }
  });
});
//DESTROY CAMPGROUND ROUTE
// router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res){
//     Campground.findByIdAndRemove(req.params.id, function(err){
//         if(err){
//             res.redirect("/campgrounds")
//         }else{
//             res.redirect("/campgrounds")
//         }
//     })
// })

function escapeRegex(text){
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

module.exports = router;
