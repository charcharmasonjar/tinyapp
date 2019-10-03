const { assert } = require('chai');

const { getUserByEmail, urlsForUser } = require('../helpers.js');

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

const testDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "userRandomID" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "user2RandomID" },
  sm5xKQ: { longURL: "https://www.youtube.com", userID: "userRandomID" }
};

describe('getUserByEmail', function() {

  it('should return a user with valid email', function() {
    const userObj = getUserByEmail("user@example.com", testUsers);
    const expectedOutput = testUsers["userRandomID"];
    assert.deepEqual(userObj, expectedOutput);
  });

  it('should return undefined if email does not exist', function() {
    assert.equal(getUserByEmail("yeet@yahoo.ca", testUsers), undefined);
  });
});

describe('urlsForUser', function() {

  it('should return a list of URLs when given a user ID', function() {
    const actual = urlsForUser("userRandomID", testDatabase);
    const expected = {
      b6UTxQ: "https://www.tsn.ca",
      sm5xKQ: "https://www.youtube.com",
    };
    assert.deepEqual(actual, expected);
  });

  it('should return an empty object if userID does not exist in user database', function() {
    const actual = urlsForUser("succulent", testDatabase);
    assert.deepEqual(actual, {});
  });
});