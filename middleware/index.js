var Campground = require("../models/campground")
var Comment = require("../models/comment")

var middlewareObj = {};
//Campground Middleware
middlewareObj.checkCampgroundOwnership = function(req, res, next){
    if(req.isAuthenticated()){
         Campground.findById(req.params.id, function(err, foundCampground){
            if(err){
                req.flash("error", "Campground not found")
                res.redirect("back")
            }else{
                if(foundCampground.author.id.equals(req.user._id) || req.user && req.user.isAdmin){
                    next();
                }else{
                    req.flash("error", "You don't have permission to do that")
                    res.redirect("/campgrounds");
                }
            }
        })
    }else{
        req.flash("error", "You need to be logged in to do that")
        res.redirect("back")
    }
}
// Comment middleware
middlewareObj.checkCommentOwnership = function(req, res, next){
    if(req.isAuthenticated()){
        Comment.findById(req.params.comment_id, function(err, foundComment){
            if(err){
                res.redirect("back")
            }else{
                if(foundComment.author.id.equals(req.user._id) || req.user && req.user.isAdmin){
                    next();
                }else{
                    req.flash("error", "You don't permission to do that" )
                    res.redirect("back");
                }
            }
        })
    }else{
        req.flash("error", "You need to be logged in to do that" )
        res.redirect("back")
    }
}

//isLoggedIn middleware: checking if a user is logged in or not
middlewareObj.isLoggedIn = function(req, res, next){
    if(req.isAuthenticated()){
       return next();
    }
    req.flash("error", "Please Log in first");
    res.redirect("/login")
}

module.exports = middlewareObj;


