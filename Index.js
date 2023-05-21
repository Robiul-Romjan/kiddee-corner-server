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

    // collection name
    const toysCollection = client.db("kiddieCorner").collection("toys");

    const indexKeys = { name: 1 };
    const indexOptions = { title: "nameCategory" };

    const result = await toysCollection.createIndex(indexKeys, indexOptions);
    
    // search toy by name
    app.get("/toySearchByName/:text", async (req, res) => {
      try {
        const searchText = req.params.text;
        const result = await toysCollection.find({
          $or: [
            { name: { $regex: searchText, $options: "i" } }
          ],
        }).toArray();

        res.send(result)
      } catch (error) {
        res.send(error)
      }
    })

    // get All toys data
    app.get("/allToys", async (req, res) => {
      try {
        const result = (await toysCollection.find().limit(20).toArray());
        res.send(result)
      } catch (error) {
        res.send(error)
      }
    });

    // get single toy data
    app.get("/allToys/:id", async (req, res) => {
      try {
        const id = req.params.id;
        // console.log(id);
        const query = { _id: new ObjectId(id) };
        const result = await toysCollection.findOne(query);
        res.send(result);
      } catch (error) {
        res.send(error)
      }
    });

    // post toy data
    app.post("/addToys", async (req, res) => {
      try {
        const newToys = req.body;
        const result = await toysCollection.insertOne(newToys);
        res.send(result);
      } catch (error) {
        res.send(error)
      }
    });

    // get users all toy data
    app.get("/userToys", async (req, res) => {
      try {
        let query = {};
        if (req.query?.email) {
          query = { email: req.query.email }
        }
        const result = await toysCollection.find(query).toArray();
        res.send(result);
      } catch (error) {
        res.send(error)
      }
    });

    // ascending users data
    app.get("/userToyByAscending", async (req, res) => {
      try {
        let query = {};
        if (req.query?.email) {
          query = { email: req.query.email }
        }
        const result = await toysCollection.find(query).sort({ price: 1 }).toArray();
        res.send(result);
      } catch (error) {
        res.send(error)
      }
    });

    // descending users data
    app.get("/userToyByDescending", async (req, res) => {
      try {
        let query = {};
        if (req.query?.email) {
          query = { email: req.query.email }
        }
        const result = await toysCollection.find(query).sort({ price: -1 }).toArray();
        res.send(result);
      } catch (error) {
        res.send(error)
      }
    });

    // update user data
    app.patch("/userToys/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const updateToy = req.body;
        const filter = { _id: new ObjectId(id) };
        const updatedToyStatus = {
          $set: {
            price: updateToy.price,
            quantity: updateToy.quantity,
            detail: updateToy.detail
          }
        }
        const result = await toysCollection.updateOne(filter, updatedToyStatus);
        res.send(result)
      } catch (error) {
        res.send(error)
      }
    });

    // delete user data
    app.delete("/userToys/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await toysCollection.deleteOne(query);
        res.send(result)
      } catch (error) {
        res.send(error)
      }
    })


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get("/", (req, res) => {
  res.send(" KiddieCorner server is Running");
});

app.listen(port, () => {
  console.log("Server running on port", port);
})