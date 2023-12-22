require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const {Schema, model, connect, disconnect} = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate');



const app = express();
const port = process.env.SNEHIL_BLOG_PORT || 4000;
const host = process.env.SNEHIL_BLOG_LIVE_URL || "http://localhost:4000"



////////////////////////// APP . USES //////////////////////////////////////////
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded( { extended: true } ));
app.use(express.static("public"));

app.use(session({
  secret: "Our little secret",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());




////////////////////////// Connect DB Server ///////////////////////////////////
const run = async () => {
  // Example URL:
  // `mongodb://127.0.0.1:27017/DBname`
  // `mongodb+zzz://user:passd@xxx.yyy.mongodb.net/DBname`
  const url = process.env.SNEHIL_BLOG_MONGODB_URL || "mongodb://127.0.0.1:27017";
  const dbName = "techBlogDB";
  await connect(`${url}/${dbName}`);
  console.log(`Connected to ${dbName}`);
}

run()
.catch((err) => console.error(err))




////////////////////////// Create Schema ///////////////////////////////////////
const userSchema = new Schema({
  username: String,
  password: String,
  googleId: String
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const articleSchema = new Schema({
  username: String,
  dateAuthored: String,
  title: String,
  content: String
})





//////////////////////////// Create Model //////////////////////////////////////
// 1st model - user
const User = model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${host}/auth/google/articles` // Example: "http://localhost:4000/auth/google/articles"
  },
  function(accessToken, refreshToken, profile, cb) {

    User.findOrCreate(
      {
        googleId: profile.id,
        username: profile.emails[0].value
      },
      function (err, user) {
        return cb(err, user);
      }
    );
  }
));

// 2nd model - article
const Article = model("Article", articleSchema)





/////////////////////////// Get Routes /////////////////////////////////////////
app.get("/", (req, res) => {
  let username = null;
  if(req.isAuthenticated()){
    username = req.user.username;
  }
  res.render("home", {username: username});
});



//////////////////////// Google Authentication /////////////////////////////////
app.get("/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get("/auth/google/articles",
  passport.authenticate("google", { failureRedirect: "/login" }),
  function(req, res) {
    // Successful authentication, redirect to any privileged route.
    res.redirect("/articles");
  }
);


//////////////////////////// Get Routes continues //////////////////////////////
app.get("/login", (req, res) => {
  if(!req.isAuthenticated()){
    res.render("login", {username: null});
  }else{
    res.redirect("/");
  }
});


app.get("/register", (req, res) => {
  if(!req.isAuthenticated()){
    res.render("register", {username: null});
  }else{
    res.redirect("/");
  }
});



// Show all articles
app.get("/articles", async (req, res) => {
  let username = null;
  if(req.isAuthenticated()){
    username = req.user.username;
  }

  try {
    const allArticles = await Article.find();
    res.render("articles", {
      username: username,
      allArticles: allArticles,
      showAllArticles: true
    })
  }
  catch(err){
    console.log(err);
  }
});



// USER ROUTES


// READ USER ARTICLES
app.get("/articles/myarticles", async (req, res) => {
  if (req.isAuthenticated()) {
    let username = req.user.username
    const userArticles = await Article.find({username})
    res.render("articles", {username, allArticles: userArticles, showAllArticles: false})
  }
  else {
    res.redirect("/login")
  }
})


// FORM TO CREATE AN ARTICLE
app.get("/articles/new", (req, res) => {
  if(req.isAuthenticated()){
    res.render("createArticle", {username: req.user.username});
  }
  else {
    res.redirect("/login");
  }
});



// VIEW USER ARTICLE
app.get("/articles/view/:id", async (req, res) => {
  try {
    const reqArticle = await Article.findById({_id: req.params.id}) // "65800f36v0f9b4d0895ffbe7"
    let username = req.user?.username
    res.render("viewArticle", {
      username,
      reqArticle,
      canEditOrDelete: (username == reqArticle.username)
    })
  }
  catch(err) {
    console.log(err)
    res.send("Error Retrieving Article")
  }
})



// FORM TO UPDATE USER ARTICLE
app.get("/articles/edit/:id", async (req, res) => {
  if (req.isAuthenticated()) {
    const reqArticle = await Article.findById({_id: req.params.id }) // "65800f36v0f9b4d0895ffbe7"
    const username = req.user.username
    if (reqArticle.username == username) {
      res.render("editArticle", {
        username,
        reqArticle
      })
    } else {
      res.send("Access Denied")
    }
  }
  else {
    res.redirect("/login")
  }
})




// LOGOUT
app.get("/logout", (req, res) => {
  req.logout((err) => {
    if(err){
      console.log(err);
    }else{
      res.redirect("/");
    }
  });
});





////////////////////////////// POST ROUTES /////////////////////////////////////
app.post("/register", (req, res) => {
  User.register(
    {username: req.body.username}, req.body.password,
    function(err, user){
      if(err){
        console.log(err);
        res.redirect("/register");
      }
      else{
        passport.authenticate("local")(req, res, function(){
          res.redirect("/articles");
        });
      }
    }
  );
});



app.post("/login", (req, res) => {
  const user = new User({
    username: req.body.username,
    password: req.body.password
  });

  req.login(user, function(err){
    if(err){
      console.log(err);
    }
    else{
      passport.authenticate("local", {failureRedirect: "/login"})(req, res, function(){
        res.redirect("/articles");
      });
    }
  });
});



// CREATE AN ARTICLE
app.post("/articles/new", async (req, res) => {
  if(req.isAuthenticated()){
    try {
      const currentArticle = new Article({
        username: req.user.username,
        dateAuthored: (new Date()).toISOString(),
        title: req.body.title,
        content: req.body.content
      })

      const savedDoc = await currentArticle.save()
      
      res.redirect(`/articles/view/${savedDoc.id}`);
    }
    catch(err){
      console.log(err);
    }
  }
  else{
    res.redirect("/login");
  }
});



// Edit User Article
app.post("/articles/edit/:id", async (req, res) => {
  if(req.isAuthenticated()){
    try {
      const filter = { _id: req.params.id }
      const found = await Article.findById(filter)
      if (found) {
        const username = req.user.username
        if (found.username == username) {
          await Article.updateOne(filter, {$set: req.body})
          res.redirect(`/articles/view/${req.params.id}`)
        } else {
          res.send("You are not authorized to edit this article")
        }
      } else {
        res.send("Document unavailable")
      }
    } catch(err) {
      console.log(err)
      res.send("Server error editing Article")
    }
  } else {
    res.redirect("/login")
  }
})



////////////////////////////// DELETE ROUTES ////////////////////////////////////////
app.post("/articles/delete/:id", async (req, res) => {
  if (req.isAuthenticated()) {
    try {
      const username = req.user.username
      const filter = {_id: req.params.id}
      const found = await Article.findById(filter)
      if (found) {
        if (found.username == username) {
          await Article.deleteOne(filter)
          res.redirect("/articles/myarticles")
        } else {
          res.send("You are not authorized to delete this article")
        }
      } else {
        res.send("Document unavailable")
      }
    }
    catch (err) {
      console.log(err)
      res.send("Server error deleting Article")
    }
  }
  else {
    res.redirect("/login")
  }
})




/////////////////////////// Start App Server ///////////////////////////////////
app.listen(port, () => {
  if (process.env.SNEHIL_BLOG_PORT) {
    console.log(`Server started at ${port}`);
  } else {
    console.log(`Server started at http://localhost:${port}`);
  }
});
