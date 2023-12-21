const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require("dotenv").config()
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion } = require('mongodb');

// middleware
app.use(express.json());
app.use(cors())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.7bvfsss.mongodb.net/?retryWrites=true&w=majority`;

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
        // await client.connect();
        // Send a ping to confirm a successful connection

        const usersCollections = client.db('OrganizeSwift').collection("user");
        const taskCollections = client.db('OrganizeSwift').collection("task");

        // middleware
        const verifyToken = (req, res, next) => {
            if (!req.headers.authorization) {
                return res.status(401).send({ message: "unauthorized access" })
            }
            const token = req.headers.authorization.split(' ')[1];
            jwt.verify(token, process.env.Access_Token, (err, decoded) => {
                if (err) {
                    return res.status(401).send({ message: "unauthorized access" })
                }
                req.decoded = decoded;
                next();
            })

        }

        // jwt related Api
        app.post('/jwt', async (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.Access_Token, { expiresIn: '1h' });
            res.send({ token })
        })


        app.post('/user', async (req, res) => {
            const newUser = req.body;
            const query = { email: newUser.email };
            const existingUser = await usersCollections.findOne(query);
            if (existingUser) {
                return res.send({ message: " user already exists", insertedId: null })
            }
            const result = await usersCollections.insertOne(newUser);
            res.send(result);
        })

        app.post('/addTask', async(req, res)=>{
            const task = req.body;
            const result = await taskCollections.insertOne(task);
            res.send(result);
        })


        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', async (req, res) => {
    res.send("server is ready")
})

app.listen(port, () => {
    console.log(`server is running on port:${port}`)
})
