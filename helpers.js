//checks if email already exists in a given object
//if email exists, returns the user object that contains the email
const getUserByEmail = function (email, database) {
  for (let id in database) {
    if (database[id].email === email) {
      return database[id];
    }
  }
  return false;
}

module.exports = { getUserByEmail };