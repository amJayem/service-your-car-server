const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();
const port = 5000;

// middle wares
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.42e2srw.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

const verifyJWT = (req, res, next) => {
  // console.log(req.headers.authorization);
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: "unauthorized access" });
  }
  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
    if (err) {
      return res.status(401).send({ message: "unauthorized access" });
    }
    req.decoded = decoded;
    next();
  });
};

async function run() {
  try {
    const serviceCollection = client
      .db("geniusCarService")
      .collection("services");
    const orderCollection = client.db("geniusCarService").collection("orders");

    // ################ Read Operation ################
    app.get("/services", async (req, res) => {
      const query = {};
      const cursor = serviceCollection.find(query);
      const service = await cursor.toArray();

      res.send(service);
    });

    app.get("/services/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const service = await serviceCollection.findOne(query);

      res.send(service);
    });
    // ################ Read Operation ################

    // ################ Create Operation ################
    // creating order and store it to db

    app.post("/orders", async (req, res) => {
      const order = req.body;
      const result = await orderCollection.insertOne(order);

      res.send(result);
    });
    // ################ Create Operation ################

    // ################ Read Operation ################

    app.get("/orders", verifyJWT, async (req, res) => {
      // console.log(req.headers.authorization);
      const decoded = req.decoded;
      // console.log(decoded);
      const getEmail = req.query.email;
      if(decoded.email !== getEmail){
        res.status(401).send({message: 'ja beta vag'})
      }
      let query = {};
      if (getEmail) {
        query = { email: getEmail };
      }

      const cursor = orderCollection.find(query);
      const orders = await cursor.toArray();

      res.send(orders);
    });
    // ################ Read Operation ################
    // ################ DELETE Operation ################
    app.delete("/orders/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await orderCollection.deleteOne(query);

      res.send(result);
    });
    // ################ DELETE Operation ################
    // ################ UPDATE Operation ################

    app.patch("/orders/:id", async (req, res) => {
      const id = req.params.id;
      const status = req.body.status;
      const query = { _id: ObjectId(id) };
      const updatedDoc = {
        $set: {
          status: status,
        },
      };
      const result = await orderCollection.updateOne(query, updatedDoc);
      res.send(result);
    });
    // ################ UPDATE Operation ################
    // ################ JWT Operation ################
    app.post("/jwt", (req, res) => {
      const user = req.body;
      // console.log(user);
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1h",
      }); // const jwt = require('jsonwebtoken');
      res.send({ token }); // send as object
    });
    // ################ JWT Operation ################
  } finally {
  }
}

run().catch((e) => console.error(e));

app.get("/", (req, res) => {
  res.send("running server...");
});

app.listen(port, () => {
  console.log("running: ", port);
});
