const mongoose = require('mongoose');

const dogSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please enter a name'],
  },
  img: {
    type: String,
    required: [true, 'Please include an image'],
    trim: true
  },
  age: {
    type: Number,
    required: [true, 'Age is Unknown']
  },
  breed: {
    type: String,
    required: [true, 'Please include a breed'],
  },
  description: {
    type: String,
    required: [true, 'Please include a description'],
    maxlength: [250, 'Max description length is 250 chars']
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  adoptedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    default: null
  },
  status: {
    type: String,
    enum: ['available', 'adopted'],
    default: 'available'
  }
});

dogSchema.post('save', function (doc) {
  console.log('new dog registered for adoption', doc);
  //next()?
});

const Dog = mongoose.model('dog', dogSchema);

module.exports = Dog;

