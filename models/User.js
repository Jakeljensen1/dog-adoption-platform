const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Please enter a username'], // Second param is a custom error message if this fails
    unique: [true, 'Please enter a unique username'],
    lowercase: true,
  },
  password: {
    type: String,
    required: [true, 'Please enter a password'],
    minlength: [6, 'Minimum password length is 6 chars']
  }
});

// fire a func after doc save to db
// post() in this context is something 'after' an event ('save' for example)
userSchema.post('save', function (doc) { //Don't need next in modern mongoose post/pre
  console.log('new user was created & saved', doc);
  //next(); // similar use to middleware here, code will get hung otherwise
});

//fire a func before doc saved to db
userSchema.pre('save', async function () {
  const salt = await bcrypt.genSalt(); // This is async
  this.password = await bcrypt.hash(this.password, salt) // the password our user is trying to sign up with. Since we are doing this before the save to the db, the saved password will be the hashed pw
});

// static method to login user

userSchema.statics.login = async function (username, password) {
  const user = await this.findOne({ username }); // this refers to User model
  // check if we have the user
  if (user) {
    const auth = await bcrypt.compare(password, user.password); //comparing pw user signs in with the hashed password, bcrypt will handle the hashing for us
    if (auth) { // truthy if password and hashed pw match
      return user;
    };
    throw Error('incorrect password');
  };
  throw Error('incorrect username');
};

const User = mongoose.model('user', userSchema) // must be singlecase user here for Mongodb. userSchema matches defined schmema above

module.exports = User;