//console.log("adoptDog.test.js: file loaded");

console.log("adoptDog.test.js: starting");

console.log("loading chai");
const chai = require("chai");

console.log("loading chai-http");
const chaiHttp = require("chai-http");

console.log("loading expect");
const expect = chai.expect;

console.log("loading app.test");
const app = require("../app.test");

console.log("loading Dog model");
const Dog = require("../../models/Dog");

console.log("loading User model");
const User = require("../../models/User");

console.log("loading mongoose");
const mongoose = require("mongoose");

console.log("loading MongoMemoryServer");
const { MongoMemoryServer } = require("mongodb-memory-server");

console.log("loading jwt");
const jwt = require("jsonwebtoken");

console.log("all requires loaded");


chai.use(chaiHttp);

let mongo;

describe("Adopt Dog Controller", () => {
  let user, dog, token;

  before(async () => {
    mongo = await MongoMemoryServer.create();
    await mongoose.connect(mongo.getUri());

    user = await User.create({ username: "porey", password: "123456" });
    dog = await Dog.create({ name: "Smug", img: 'nothing', breed: "Pug", age: 2, description: "blah", owner: user._id });

    token = jwt.sign({ id: user._id }, //secret 
    );
  });

  after(async () => {
    await mongoose.disconnect();
    await mongo.stop();
  });

  it("should adopt a dog", async () => {
    //console.log("Loaded adoptDog.test.js");
    const res = await chai
      .request(app)
      .post(`/dogs/${dog._id}/adopt`)
      .set("Cookie", `jwt=${token}`);

    expect(res.body.dog.status).to.equal("adopted");
    expect(res.body.dog.adoptedBy).to.equal(String(user._id));
  });
});
