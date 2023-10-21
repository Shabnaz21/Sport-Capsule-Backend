const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5001;

// middleWare 
app.use(cors());
app.use(express.json());

// Connect database
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.0s8hpk2.mongodb.net/?retryWrites=true&w=majority`;

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

        const database = client.db("SportDB");
        const productCollection = database.collection("products");
        const brandCollection = database.collection("brand");
        const cartsCollection = database.collection("carts");

        // product related
        app.post('/products', async (req, res) => {
            const products = req.body;
            const result = await productCollection.insertOne(products);
            res.send(result);
        })

        app.get('/products', async (req, res) => {
            const cursor = productCollection.find();
            const result = await cursor.toArray();
            res.send(result)
        })

        app.get("/products/:id", async (req, res) => {
            const id = req.params.id;
            const query = {
                _id: new ObjectId(id),
            };
            const result = await productCollection.findOne(query);
            res.send(result);
        });

        app.put("/products/:id", async (req, res) => {
            const id = req.params.id;
            const data = req.body;
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const updatedProduct = {
                $set: {
                    name: data.name,
                    brand: data.brand,
                    price: data.price,
                    rating: data.rating,
                    type: data.type,
                    photo: data.photo,
                },
            };
            const result = await productCollection.updateOne(
                filter,
                updatedProduct,
                options
            );
            res.send(result);
        });

     // Brands load
        app.get("/brands", async (req, res) => {
            const result = await brandCollection.find().toArray();
            res.send(result);
        });

        app.get("/brands/:name", async (req, res) => {
            const name = req.params.name;
            const query = {
                name: name,
            };
            const result = await brandCollection.findOne(query);
            res.send(result);
        });

        // cart related 
        app.post('/carts', async (req, res) => {
            const users = req.body;
            const result = await cartsCollection.insertOne(users);
            res.send(result);
        })

        app.get('/carts', async (req, res) => {
            const cursor = cartsCollection.find();
            const result = await cursor.toArray();
            res.send(result)
        })

        // per cart Find
        app.get("/carts/:id", async (req, res) => {
            const result = await cartsCollection.find().toArray();
            res.send(result);
        });

        // delete
        app.delete('/carts/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await cartsCollection.deleteOne(query);
            res.send(result);
        });

        
        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


// checking server
app.get('/', (req, res) => {
    res.send('Sport Capsule Server is running');
})

app.listen(port, () => {
    console.log(`Sport Capsule Server is running on port: ${port}`);
})