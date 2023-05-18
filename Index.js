const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vhjeumo.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();


    const toysCollection = client.db("kiddieCorner").collection("toys");

    app.get("/allToys", async(req, res)=> {
      const result = await toysCollection.find().toArray();
      res.send(result)
    });

    app.get("/allToys/:id", async(req, res)=> {
      const id = req.params.id;
      // console.log(id);
      const query = {_id: new ObjectId(id)};
      const result = await toysCollection.findOne(query);
      res.send(result);
    });

    app.post("/addToys", async(req, res)=> {
      const newToys = req.body;
      const result = await toysCollection.insertOne(newToys);
      res.send(result);
    });

    app.get("/userToys", async(req, res)=> {
      let query = {};
      if(req.query?.email){
        query = {email: req.query.email}
      }
      const result = await toysCollection.find(query).toArray();
      res.send(result);
    });



    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get("/", (req, res)=> {
    res.send(" KiddieCorner server is Running");
});

app.listen(port, ()=> {
    console.log("Server running on port", port);
})