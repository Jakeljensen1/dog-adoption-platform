// Replace this file with the logic for handling incoming requests and returning responses to the client
const { errorMonitor } = require('supertest/lib/test');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// handle errors
const handleErrors = (err) => {
  console.log(err.message, err.code);
  let errors = { username: '', password: '' }
  //console.log(err.message);

  //incorrect email
  if (err.message === 'incorrect username') {
    errors.username = 'that username is not registered';
  }

  //incorrect password, remember we return the error at the bottom of the handleErrors function
  if (err.message === 'incorrect password') {
    errors.password = 'that password is incorrect';
  }

  //duplicate error code
  if (err.code === 11000) {
    errors.username = 'that username is already registered';
    return errors;
  }

  //validation errors
  if (err.message.includes('User validation failed')) {
    //console.log(err); // Inside this error object, we will have a property called errors: if both email/password are bad, that object will contain a property for both email and password
    (Object.values(err.errors)).forEach(({ properties }) => {
      errors[properties.path] = properties.message;
    }); // This Object.values gets us the values of this err.errors object
  }
  return errors; // This will then be fed into the catch function if there is an error and the 
}

//create max age, not ms, but seconds here = 1 day
const maxAge = 24 * 60 * 60;

//creating reusable func for signup and logon functions
const createToken = (id) => { // using id in the payload of jwt
  return jwt.sign({ id }, 'juicey secret', { // pass in the payload and secret (should be longer in prodction)
    expiresIn: maxAge
  });
}

module.exports.signup_get = (req, res) => {
  res.render('signup');
}

module.exports.login_get = (req, res) => {
  res.render('login');
}

module.exports.signup_post = async (req, res) => {
  const { username, password } = req.body;
  //We want to try and create a new user here
  try {
    const user = await User.create({ username, password }); // creates instance of a user locally and then saves to db. This is an async process
    const token = createToken(user._id) // pass in user id
    res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 }); // * 1000 to go sec -> ms
    res.status(201).json({ user: user._id });
  } catch (err) {
    const errors = handleErrors(err);
    res.status(400).json({ errors }); // Now we can send back some json instead of a generic error message
  }
};

module.exports.login_post = async (req, res) => {
  const { username, password } = req.body;

  try { // If login is success, we return 'user' here
    const user = await User.login(username, password);
    const token = createToken(user._id) // pass in user id
    res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
    res.status(200).json({ user: user._id });
  } catch (err) { // if not a success
    const errors = handleErrors(err);
    res.status(400).json({ errors });
  };
};

module.exports.logout_get = (req, res) => {
  res.cookie('jwt', '', { maxAge: 1 }) // This will replace the token value with empty string, thus nullifying the tokens value. Good practice to add an extremely short maxAge, so it expires
  res.redirect('/');
}