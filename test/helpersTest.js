const { assert } = require('chai');

const { getUserByEmail } = require('../helpers.js');

const testUsers = {
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

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const userObj = getUserByEmail("user@example.com", testUsers)
    const expectedOutput = testUsers["userRandomID"];
    console.log(userObj);
    console.log(expectedOutput);
    assert.deepEqual(userObj, expectedOutput);
  });
  it('should return undefined if email does not exist', function() {
    assert.equal(getUserByEmail("yeet@yahoo.ca", testUsers), undefined);
  });
});