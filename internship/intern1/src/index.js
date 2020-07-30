const express = require("express")
const mongoose = require("mongoose")
const path = require("path")
const bcrypt = require("bcrypt")
const session = require("express-session")
const alert = require("alert-node")
const bodyParser = require('body-parser');
const UserSignUp = require("./models/signup")
const db = require("../mysetup/myurl").myurl

const app = express()

app.use(express.json())
app.set('view engine','hbs')

app.use(express.static(path.join(__dirname,'..','/public')))
app.set('views',path.join(__dirname,'..','/src/templates'))

app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({secret: 'mySecret', resave: true, saveUninitialized: false}));

const saltRounds = 10;
mongoose
  .connect(db)
  .then(() => {
    console.log("Database is connected");
  })
  .catch(err => {
    console.log("Error is ", err.message);
  });

app.get("/",async (req,res)=> {

  var context = await req.session.context;
  req.session.context = ""
  if(context) {
    alert("Username already exists..!! Try to Login")
    req.session.context = ""
    
  }
  context = ""

    res.render("index")
})

app.get("/home",(req,res)=> {

  var val = req.session.context

  if(val=='typeA') {
    res.render("home",{
      val: val
    })
  }
  else if(val=='typeB') {
    res.render("home1",{
      val: val
    })
  }
  else {
    res.render("home2",{
      val: val
    })
  }
  
})

app.post("/signup",(req,res)=> {

  var salt = bcrypt.genSaltSync(10);
  var hash = bcrypt.hashSync(req.body.password, salt);

    var user = new UserSignUp({
      username: req.body.username,
      password: hash,
      type: req.body.type
    })

    UserSignUp.find({
      username: req.body.username
    }).countDocuments((err,count)=> {
      if(count>0) {
        req.session.context ='your context here' ;
        res.redirect("/")
      }
      else {
        
        user.save().then((user) => {
          req.session.context = req.body.type
          res.status(200).redirect("/home")
        }).catch((err)=> {
          req.session.context ='your context here' ;
          res.redirect("/")
        })
      }
    })
  

})

app.get("/login",(req,res)=> {
    var context = req.session.context

    if(context) {
      alert("Wrong username or password")
      req.session.context = ""
    }

    res.render("login")
})

app.post("/login",(req,res)=> {

  var salt = bcrypt.genSaltSync(10);
  var hash = bcrypt.hashSync(req.body.password, salt);

  UserSignUp.findOne({username: req.body.username})
  .then((user)=> {
    if(!user) {
      req.session.context = "your context here"
      res.redirect("/login")
    }
    else {
      if(bcrypt.compareSync(req.body.password, user.password)) {

        req.session.context = user.type
        res.redirect("/home")
      }
      else {
        req.session.context = "your context here"
            res.redirect("/login")
      }
    }
  })
})



app.listen(3000,(req,res)=> {
    console.log("Listening on 8080")
})


