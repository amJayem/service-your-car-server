const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
require('dotenv').config();

const app = express();
const port = 5000;

// middle wares
app.use(cors());
app.use(express.json());

const uri =
  `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.42e2srw.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    const serviceCollection = client.db("geniusCarService").collection("services");
    
    app.get('/services', async(req,res)=>{
        const query = {};
        const cursor = serviceCollection.find(query);
        const service = await cursor.toArray();

        res.send(service);
    })
  }
  
  finally { }
}

run().catch((e) => console.error(e));

app.get("/", (req, res) => {
  res.send("running server...");
});

app.listen(port, () => {
  console.log("running: ", port);
});
