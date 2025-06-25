if (process.env.NODE_ENV !== 'production'){
require("dotenv").config();
// console.log(process.env.SECRET);
}


const express = require("express");
const app = express();
const port = 8080;
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressErrors.js");

const passport = require("passport");
const LocalStragetgy = require("passport-local");
const User = require("./models/user.js");

const listingRouter = require("./routes/listing.js"); 
const reviewRouter = require("./routes/review.js"); 
const userRouter = require("./routes/user.js");


const dbUrl = process.env.ATLASDB_URL;

main().then(()=>{
    console.log("connected successfully");
}).catch((err)=>{
    console.log(err , "connection failed");
})

async function main (){
    await mongoose.connect(dbUrl);
}

app.set("view engine" , "ejs");

app.set("views", path.join(__dirname , "/views"));
app.use(express.static(path.join(__dirname, "/public")));

app.use(express.urlencoded({extended : true}));

app.use(methodOverride("_method"));

app.engine("ejs",ejsMate);



const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");

const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto : {
        secret : process.env.SECRET
    },
    touchAfter: 24 * 3600, 
});

store.on("error", ()=>{
    console.log("ERROR in MONGO SESSION STORE",err);
});

const sessionOptions = {
    store,
    secret : process.env.SECRET,
    resave : false,
    saveUninitialized : true,
    cookie : {
        expires : Date.now() + 7 *24*60*60*1000,
        maxAge :7 * 24 * 60 * 60 * 1000,
        httpOnly : true,
    },
}






// app.get("/",(req,res) => {
//     res.send("root working !!");
// });



app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session()); 
passport.use(new LocalStragetgy(User.authenticate()));

passport.serializeUser(User.serializeUser()); 
passport.deserializeUser(User.deserializeUser());



// Rest api's :

app.use((req,res,next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    // console.log(res.locals.error); give in array 
    next();
});


// app.get("/demouser", async (req,res)=>{
//     let fakeUser = new User({
//         email: "student@gmail.com",
//         username: "delta-student" // we can add this user as b/c by default username in schema is created by plugin
//     });

//     let registeredUser = await User.register(fakeUser,"helloworld",/*callback*/); // pass user and pass :  using static method
//     // this method also check that username is unique or not
//     res.send(registeredUser);

// }) 


app.use("/listings",listingRouter);

app.use("/listings/:id/reviews",reviewRouter);
// here this is parent route and in this parameter don't passes to child routes so we use mergerparams : when require router

app.use("/",userRouter);


// for route where page not exist :
app.all('/{*any}', (req,res,next)=>{
    next( new ExpressError(404 , "Page Not Found"));
    // OR
    // throw new ExpressError(404 , "Page Not Found");

});

// middleware : error handling
app.use((err,req ,res ,next)=>{
    console.log(err);
    
    let { status=500 , message="some thing went wrong"} = err;
    
    // res.status(status).send(message);

    res.status(status).render("error.ejs", {message});
});




app.listen(port , ()=> {
    console.log(`server is running on port ${port}`);
});

