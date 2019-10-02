const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

// const urlDatabase = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com"
// };

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "userRandomID" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "user2RandomID" },
  sm5xKQ: { longURL: "https://www.youtube.com", userID: "userRandomID" }
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

//generates string of six random characters
function generateRandomString() {
  let result = "";
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  };
  return result;
};

//checks if email already exists in a given object
const checkEmailTaken = function (email, object) {
  for (let id in object) {
    if (object[id].email === email) {
      return object[id];
    }
  }
  return false;
}

//returns an object of urls belonging to the logged in user
const urlsForUser = function(id) {
  let result = {};
  for (let shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      result[shortURL] = urlDatabase[shortURL].longURL;
    }
  }
  return result;
}

//root
app.get("/", (req, res) => {
  res.send("Hello!");
});

//shows all urls
app.get("/urls", (req, res) => {
  if (!req.cookies["user_id"]) {
    res.redirect("/login");
  }
  let templateVars = {
    urls: urlsForUser(req.cookies["user_id"]),
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_index", templateVars);
});

//page to create new urls
//if not logged in, redirect to login page
app.get("/urls/new", (req, res) => {
  if (!req.cookies["user_id"]) {
    res.redirect("/login");
  }
  let templateVars = {
    user: users[req.cookies["user_id"]]
  }
  res.render("urls_new", templateVars);
});

//create page for new url 
app.get("/urls/:shortURL", (req, res) => {
  if (!req.cookies["user_id"]) {
    res.redirect("/login");
  }
  if (urlDatabase[req.params.shortURL].userID !== req.cookies["user_id"]) {
    return res.status(403).send("you can't view someone else's urls boo");
  }
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_show", templateVars);
});

//short url on individual url page links to long url 
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
})

//generate random string and add new short url/long url pair to database
app.post("/urls", (req, res) => {
  let string = generateRandomString();
  urlDatabase[string] = {
    longURL: req.body.longURL,
    userID: req.cookies["user_id"],
  }
  res.redirect(`/urls/${string}`);
});

//edit a url
app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect("/urls");
})

//delete a url 
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

//login page
app.get("/login", (req, res) => {
  let templateVars = {
    user: users[req.cookies["user_id"]]
  }
  res.render("login", templateVars);
})

//registration page
app.get("/register", (req, res) => {
  let templateVars = {
    user: users[req.cookies["user_id"]]
  }
  res.render("register", templateVars);
})

//check if login info is correct
app.post("/login", (req, res) => {
  if (!req.body.email || !req.body.password) {
    return res.status(400).send("Please fill out both email and password");
  }
  if (!checkEmailTaken(req.body.email, users)) {
    return res.status(403).send("Incorrect email address")
  }
  let userID = checkEmailTaken(req.body.email, users)["id"];
  if (users[userID].password !== req.body.password) {
    return res.status(403).send("Incorrect password");
  }
  res.cookie('user_id', userID);
  res.redirect("/urls");
});

//create user 
app.post("/register", (req, res) => {
  if (!req.body.email || !req.body.password) {
    return res.status(400).send("Please fill out both email and password");
  }
  if (checkEmailTaken(req.body.email, users)) {
    return res.status(400).send("Email address is already taken");
  }
  let userID = generateRandomString();
  users[userID] = {
    id: userID,
    email: req.body.email,
    password: req.body.password
  }
  res.cookie('user_id', userID);
  res.redirect("/urls");
});

//logout
app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect("/urls")
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
