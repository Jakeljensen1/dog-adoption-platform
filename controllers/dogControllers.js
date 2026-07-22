const Dog = require('../models/Dog');
const User = require('../models/User')

module.exports.dogSignup_get = async (req, res) => {
  try {
    const page = Number(req.query.page || 1)
    const limit = 6; // Works best with my CSS styles
    const skip = (page - 1) * limit;

    const totalDogs = await Dog.countDocuments();
    const totalPages = Math.ceil(totalDogs / limit);

    //console.log('dog controller ran');
    const dogs = await Dog.find()
      .populate('owner') // used populate because owner-> dog auth and original schema/dog creation submission did not have 'owner' included
      .skip(skip)
      .limit(limit)

    res.render('dogs', {
      dogs,
      currentUser: req.user,
      page,
      totalPages
    });
    //console.log("req.user:", req.user);
    //console.log("dogs:", dogs);

  } catch (err) {
    console.log(err);
    res.status(500).send('Server error');
  }
}

module.exports.dogSignup_post = async (req, res) => {
  try {
    const dog = await Dog.create({
      ...req.body,
      owner: req.user.id
    });
    res.status(201).json({ dog });
    //console.log("req.user in POST:", req.user);
  } catch (err) {
    console.log(err);
    res.status(400).json({ errors: err });
  }
}

module.exports.login_post = async (req, res) => {
  const { username, password } = req.body;

  try { // If login is success, we return 'user' here
    const user = await User.login(username, password);
    const token = createToken({ id: user._id, username: user.username }) // pass in user id
    res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
    res.status(200).json({ user: user._id });
  } catch (err) { // if not a success
    const errors = handleErrors(err);
    res.status(400).json({ errors });
  };
};

module.exports.dog_delete = async (req, res) => {
  try {
    await Dog.findByIdAndDelete(req.params.id); // Included the logic for only the owner being able to remove their pups in dogs.ejs
    res.redirect('/dogs');
  } catch (err) {
    console.log(err.message);
    res.status(500).send('Server Error');
  }
}

module.exports.adoptDog_post = async (req, res) => {
  try {
    const dog = await Dog.findById(req.params.id)//.populate('owner');
    const user = await User.findById(req.user.id); // Was having difficulty thinking of more efficient ways to get 'username' to display in adoption modal and in profile w/o doing fetch. Better way to do this?

    if (!dog) return res.json({ error: 'Dog not found' });

    // If dog has no owner yet, set one. Made earlier dogs w/o setting a property for 'owner' in schema
    if (!dog.owner) {
      dog.owner = req.user.id;
    }

    if (dog.owner.toString() === req.user.id) {
      return res.json({ error: 'You cannot adopt your own dog' });
    }

    if (dog.status === 'adopted') {
      return res.json({ error: 'Dog already adopted' });
    }

    dog.status = 'adopted';
    dog.adoptedBy = req.user.id;
    await dog.save();

    res.json({
      success: true,
      message: `Congrats on adopting ${dog.name}, ${user.username}! Thanks for giving the pup a home!`
    });

  } catch (err) {
    console.log(err);
    res.json({ error: 'Server error' });
  }
};

module.exports.profile_get = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = 6; // dogs per page
    const skip = (page - 1) * limit;

    const userId = req.user.id;

    // Count total adopted dogs
    const totalAdopted = await Dog.countDocuments({ adoptedBy: userId });
    const totalPages = Math.ceil(totalAdopted / limit);

    const dogs = await Dog.find({ adoptedBy: req.user.id })
      .populate('owner')
      .populate('adoptedBy')
      .skip(skip)
      .limit(limit)
    //const user = await User.findById(req.user.id); // Was having difficulty thinking of more efficient ways to get 'username' to display in adoption modal and in profile w/o doing fetch. Better way to do this?
    //console.log(req.user);
    res.render('profile', {
      user: req.user,
      dogs,
      currentUser: req.user,
      page,
      totalPages
    });
  } catch (err) {
    console.log(err);
    res.status(500).send('Server error');
  }
};


// module.exports.deletDog = async (req, res) => {
//   try {
//     const dogId = req.param.id
//   }
// }