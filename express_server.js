const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const brcypt = require('bcrypt');
const cookieSession = require('cookie-session');
const { getUserByEmail, generateRandomString, urlsForUser } = require('./helpers.js');

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
app.use(cookieSession({
  name: 'session',
  keys: ['YEET']
}));

//root
app.get("/", (req, res) => {
  if (!req.session.user_id) {
    return res.redirect("/login");
  }
  res.redirect('/urls');
});

//shows all urls
app.get("/urls", (req, res) => {
  if (!req.session.user_id) {
    return res.redirect("/login");
  }
  let templateVars = {
    urls: urlsForUser(req.session.user_id, urlDatabase),
    user: users[req.session.user_id],
  };
  res.render("urls_index", templateVars);
});

//page to create new urls
//if not logged in, redirect to login page
app.get("/urls/new", (req, res) => {
  if (!req.session.user_id) {
    return res.redirect("/login");
  }
  let templateVars = {
    user: users[req.session.user_id]
  };
  res.render("urls_new", templateVars);
});

//create page for new url
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const id = req.session.user_id;
  if (!id) {
    return res.redirect("/login");
  }
  if (!urlDatabase[shortURL]) {
    return res.status(404).send("tiny url does not exist");
  }
  if (urlDatabase[shortURL].userID !== id) {
    return res.status(403).send("you can't view someone else's urls boo");
  }
  let templateVars = {
    shortURL: shortURL,
    longURL: urlDatabase[shortURL].longURL,
    user: users[id],
  };
  res.render("urls_show", templateVars);
});

//short url on individual url page links to long url
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

//generate random string and add new short url/long url pair to database
app.post("/urls", (req, res) => {
  let string = generateRandomString();
  urlDatabase[string] = {
    longURL: req.body.longURL,
    userID: req.session.user_id,
  };
  res.redirect(`/urls/${string}`);
});

//edit a url
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const id = req.session.user_id;
  if (!id) {
    return res.redirect("/login");
  }
  if (!urlDatabase[shortURL]) {
    return res.status(404).send("tiny url does not exist");
  }
  if (urlDatabase[shortURL].userID !== id) {
    return res.status(403).send("you can't view someone else's urls boo");
  }
  urlDatabase[shortURL].longURL = req.body.longURL;
  res.redirect("/urls");
});

//delete a url
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  const id = req.session.user_id;
  if (!id) {
    return res.redirect("/login");
  }
  if (!urlDatabase[shortURL]) {
    return res.status(404).send("tiny url does not exist");
  }
  if (urlDatabase[shortURL].userID !== id) {
    return res.status(403).send("you can't view someone else's urls boo");
  }
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

//login page
app.get("/login", (req, res) => {
  let templateVars = {
    user: users[req.session.user_id]
  };
  res.render("login", templateVars);
});

//registration page
app.get("/register", (req, res) => {
  //what is the point of this?
  let templateVars = {
    user: users[req.session.user_id]
  };
  res.render("register", templateVars);
});

//check if login info is correct
app.post("/login", (req, res) => {
  if (!req.body.email || !req.body.password) {
    return res.status(400).send("Please fill out both email and password");
  }
  if (!getUserByEmail(req.body.email, users)) {
    return res.status(403).send("Incorrect email address");
  }
  let userID = getUserByEmail(req.body.email, users)["id"];
  if (!brcypt.compareSync(req.body.password, users[userID].password)) {
    return res.status(403).send("Incorrect password");
  }
  req.session.user_id = userID;
  res.redirect("/urls");
});

//create user
app.post("/register", (req, res) => {
  if (!req.body.email || !req.body.password) {
    return res.status(400).send("Please fill out both email and password");
  }
  if (getUserByEmail(req.body.email, users)) {
    return res.status(400).send("Email address is already taken");
  }
  const userID = generateRandomString();
  const password = req.body.password;
  const hashedPassword = brcypt.hashSync(password, 10);
  users[userID] = {
    id: userID,
    email: req.body.email,
    password: hashedPassword,
  };
  req.session.user_id = userID;
  res.redirect("/urls");
});

//logout
app.post("/logout", (req, res) => {
  //idk if this is right
  req.session = null;
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
