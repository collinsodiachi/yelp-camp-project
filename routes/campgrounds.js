var express         = require("express"),
    router          = express.Router(),
    Campground      = require("../models/campground"),
    middleware      = require("../middleware"),
    multer          = require ("multer"),
    storage         = multer.diskStorage({
                    filename: function (req, file, callback){
                    callback(null, Date.now() + file.originalname);
                    }
    });

//Defined imageFilter function for accept image files only
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

//INDEX - show all campgrounds
router.get("/", function(req, res){
    var noCampground = null;
    if(req.query.search) {
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        // Get all campgrounds from DB
        Campground.find({name: regex}, function(err, allCampgrounds){
           if(err){
               console.log(err);
           }else {
                if(allCampgrounds.length < 1) {
                  noCampground = "No campgrounds match that query, please try again.";
                }
              res.render("campgrounds/index",{campgrounds:allCampgrounds, noCampground: noCampground});
           }
        });
    }else {
        // Get all campgrounds from DB
        Campground.find({}, function(err, allCampgrounds){
           if(err){
               console.log(err);
           }else {
              res.render("campgrounds/index",{campgrounds:allCampgrounds, noCampground: noCampground});
           }
        });
    }
});

//CREATE ROUTE - uploading campground image to cloud
router.post("/", middleware.isLoggedIn, upload.single('image'), function(req, res) {
    cloudinary.v2.uploader.upload(req.file.path, function(err, result) {
     if(err) {
        req.flash('error', err.message);
        return res.redirect('back');
      }
      req.body.campground.image = result.secure_url; //add cloudinary url for the image to the campground object under image property
      req.body.campground.imageId = result.public_id //add image public_id
      req.body.campground.author = {  //add author to campground
        id: req.user._id,
        username: req.user.username
      }
      req.body.campground.cost = req.body.cost;
      Campground.create(req.body.campground, function(err, campground) {
        if (err) {
          req.flash('error', err.message);
          return res.redirect('back');
        }
        res.redirect('/campgrounds/' + campground.id);
      });
    });
});

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

//EDIT ROUTE
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

//UPDATE ROUTE: Note: async works with version 8.4.0 and up
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

//DELETE ROUTE
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


// Defined escapeRegex function for search feature
function escapeRegex(text){
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

module.exports = router;
