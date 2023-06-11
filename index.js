const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config()
const { MongoClient, ServerApiVersion } = require('mongodb');
const port = process.env.PORT || 5000;

// Middelware
app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fnxcgsn.mongodb.net/?retryWrites=true&w=majority`;

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

        const instructoresCollection = client.db("sadiqWebDB").collection("instructors");
        const classesCollection = client.db("sadiqWebDB").collection("classes");
        const classCollection = client.db("sadiqWebDB").collection("class");
        const reviewCollection = client.db("sadiqWebDB").collection("review");

        // Classes collection
        app.get('/classes', async (req, res) => {
            const instructors = await classesCollection.find().toArray();
            res.send(instructors)
        })

        // Instructors Collection
        app.get('/instructors', async (req, res) => {
            const instructors = await instructoresCollection.find().toArray();
            res.send(instructors)
        })

        // Classs collection
        app.post('/class', async (req, res) => {
            const LoadClass = req.body;
            const result = await classCollection.insertOne(LoadClass);
            res.send(result)
        })

        app.get('/class', async (req, res) => {
            const email = req.query.email;
            console.log(60,email);
            if(!email){
                res.send([])
            }
            const query ={email:email}
            const result = await classCollection.find(query).toArray();
            res.send(result);
        })

        // Review Collection
        app.get('/review', async (req, res) => {
            const instructors = await reviewCollection.find().toArray();
            res.send(instructors)
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



app.get('/', (req, res) => {
    res.send('Hallo assignment')
})

app.listen(port, () => {
    console.log('Assignment Server is runing on the port', port);
})





// [
//     {
//       "name": "John Doe",
//       "_id": "1",
//       "email": "johndoe@example.com",
//       "image":"https://i.ibb.co/m8xg4RD/instructores4-removebg-preview.png"
//     },
//     {
//       "name": "Jane Smith",
//       "_id": "2",
//       "email": "janesmith@example.com",
//       "image":"https://i.ibb.co/8YCBQL8/instructores8-removebg-preview.png"
//     },
//     {
//       "name": "Michael Johnson",
//       "_id": "3",
//       "email": "michaeljohnson@example.com",
//       "image":"https://i.ibb.co/NLbPwT8/instructores6-removebg-preview.png"
//     },
//     {
//       "name": "Emily Davis",
//       "_id": "4",
//       "email": "emilydavis@example.com",
//       "image":"https://i.ibb.co/LZwcJfx/instructores7-removebg-preview.png"
//     },
//     {
//       "name": "David Brown",
//       "_id": "5",
//       "email": "davidbrown@example.com",
//       "image":"https://i.ibb.co/7j9w0cY/instructores2-removebg-preview.png"
//     },
//     {
//       "name": "Sarah Wilson",
//       "_id": "6",
//       "email": "sarahwilson@example.com",
//       "image":"https://i.ibb.co/RbKBVy5/instructores3-removebg-preview.png"
//     }
//   ]
