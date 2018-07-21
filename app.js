var express    = require("express"),
    dotenv     =require('dotenv').config(),
    app        = express(),
    bodyParser = require("body-parser"),
    mongoose   = require("mongoose"),
    flash      = require("connect-flash"),
    passport   = require("passport"),
    LocalStrategy = require("passport-local"),
    methodOverride = require("method-override"),
    Campground = require("./models/campground"),
    Comment    = require("./models/comment"),
    User       = require("./models/user"),
    session    =require("express-session"),
    seedDB     = require("./seed");

//Requiring Routes    
var commentRoutes       = require("./routes/comments"),
    campgroundRoutes    = require("./routes/campgrounds"),
    indexRoutes         = require("./routes/index");
   
// seedDB();   seed the database
mongoose.connect("mongodb://localhost/yelp_camp_v12");
app.use(bodyParser.urlencoded({extended:true}))
app.use(express.static(__dirname + "/public"))
app.set("view engine", "ejs");
app.use(methodOverride("_method"))
app.use(flash());

//PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "Good Boy",
    resave:false,
    saveUninitialized: false
}))
app.locals.moment = require("moment");
app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

//Middleware to export currentUser variable on every template
app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    res.locals.error       = req.flash("error");
    res.locals.success     = req.flash("success");
    next();
})

app.use("/", indexRoutes)
app.use("/campgrounds", campgroundRoutes)
app.use("/campgrounds/:id/comments", commentRoutes)

//server listening...
app.listen(process.env.PORT, process.env.IP, function(){
    console.log("YelpCamp Server is Listen");
})






