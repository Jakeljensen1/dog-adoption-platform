const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');
const cookieParser = require('cookie-parser');
const { requireAuth, checkUser } = require('./middlewares/authMiddleware');
const dogRoutes = require('./routes/dogRoutes');
const cors = require("cors");

const app = express();

//middleware
app.use(cors({
  origin: "http://localhost:3000",   // frontend
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.use(express.static('public'))
app.use(express.json());
app.use(cookieParser()); // Express doesn't parse cookies by default and new to chekc a JWT stored in a cookie
app.use(express.urlencoded({ extended: true })); //handle form submissions


//view engine, using ejs
app.set('view engine', 'ejs');

//check user for all get req
//app.get('*', checkUser)

//db connection, using mongoose for access to schemas, models, validation..
//const dbURI = 'mongodb+srv://jakeljensen1_db_user:<password>@cluster0.7brcdar.mongodb.net/?appName=Cluster0'

mongoose.connect(process.env.MONGODB_URI)
  .then(() => app.listen(3000))
  .catch(err => console.log(err));

//routes

app.get('/', (req, res) => res.render('home'));
//app.get('/dogs', requireAuth, (req, res) => res.render('dogs')); //will need to specify what needs auth
app.use(authRoutes); //will need for auth
app.use(dogRoutes);