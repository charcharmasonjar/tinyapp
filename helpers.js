//checks if email already exists in a given object
//if email exists, returns the user object that contains the email
const getUserByEmail = function(email, database) {
  for (let id in database) {
    if (database[id].email === email) {
      return database[id];
    }
  }
  return undefined;
};

//generates string of six random characters
const generateRandomString = function() {
  let result = "";
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

//returns an object of urls belonging to the logged in user
const urlsForUser = function(id, database) {
  let result = {};
  for (let shortURL in database) {
    if (database[shortURL].userID === id) {
      result[shortURL] = database[shortURL].longURL;
    }
  }
  return result;
};

module.exports = {
  getUserByEmail,
  generateRandomString,
  urlsForUser
};