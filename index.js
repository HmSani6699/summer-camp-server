const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
        const userCollaction = client.db("sadiqWebDB").collection("users");


        // Users Collection

        app.get('/users', async (req, res) => {
            const result = await userCollaction.find().toArray();
            res.send(result)
        })

        app.post('/users', async (req, res) => {
            const user = req.body;
            const query = { email: user.email };
            const existingUser = await userCollaction.findOne(query);
            if (existingUser) {
                return {}
            }
            const result = await userCollaction.insertOne(user);
            res.send(result)
        })

        // Set the admin role
        app.patch('/users/admin/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const updateDoc = { $set: { rol: `admin` }, };
            const result = await userCollaction.updateOne(filter, updateDoc);
            res.send(result);
        })

        // Set the Instructor role
        app.patch('/users/instructor/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const updateDoc = { $set: { rol: `instructor` }, };
            const result = await userCollaction.updateOne(filter, updateDoc);
            res.send(result);
        })


        app.get('/users/admin/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email }
            const user = await userCollaction.findOne(query);
            const result = { admin: user?.rol === 'admin' };
            res.send(result)
        })

        app.get('/users/instructor/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email }
            const user = await userCollaction.findOne(query);
            const result = { instructor: user?.rol === 'instructor' };
            res.send(result)
        })



        app.delete('/users/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            console.log(122, query);
            const result = await userCollaction.deleteOne(query);
            res.send(result)
        })


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
            if (!email) {
                res.send([]);
                return
            }
            const query = { email: email }
            const result = await classCollection.find(query).toArray();
            res.send(result);
        })

        app.delete('/class/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await classCollection.deleteOne(query);
            res.send(result)
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
