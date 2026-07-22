// Replace this file with custom middleware functions, including authentication and rate limiting

const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports.requireAuth = (req, res, next) => {
  const token = req.cookies.jwt //grab token
  //check if jwt exists
  if (token) {
    jwt.verify(token, 'juicey secret', function (err, decodedToken) {
      if (err) {
        console.log(err.message);
        res.redirect('/login');
      } else {
        //console.log(decodedToken);
        req.user = decodedToken;
        next(); // on to the next req route
      }
    });
  } else {
    if (process.env.NOD_ENV === "test") {
      return res.status(401).json({ error: "Unauthorized" });
    }
    return res.redirect('/login');
  }
}

// check current user has access
module.exports.checkUser = (req, res, next) => {
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, 'juicey secret',
      async function (err, decodendToken) {
        if (err) {
          console.log(err.message);
          res.locals.user = null;
          next();
        } else {
          // if true we know a valid user logged in
          //console.log(decodedToken); // in decodedToken (aka user) we have a payload attribute which holds an id
          let user = await User.findById(decodedToken.id);
          res.locals.user = user// here we are creating a property on the res (if all above passes), that allows our views to have access to the user's id
          next(); // we will get access to the requested protected route
        }
      });
  } else {
    res.locals.user = null; // if user not logged in
  }
}

//module.exports = { requireAuth, checkUser }