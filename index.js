const express = require('express');
const cors = require('cors');
const app = express();
const jwt = require("jsonwebtoken");
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;

const stripe = require("stripe")(process.env.PAYMENT_SECRET_KEY)

// Middelware
app.use(cors())
app.use(express.json())

// jwt token

const verifyJWT = (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization) {
    return res.status(401).send({ error: true, message: 'unauthorized access' })
  }
  // bearer token
  const token = authorization.split(' ')[1];

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(4010).send({ error: true, message: 'unauthorized access' })
    }
    req.decoded = decoded;
    next();
  })

}


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
    // await client.connect();

    const instructoresCollection = client.db("sadiqWebDB").collection("instructors");
    const classesCollection = client.db("sadiqWebDB").collection("classes");
    const classCollection = client.db("sadiqWebDB").collection("class");
    const paymentCollection = client.db("sadiqWebDB").collection("paymnet");
    const reviewCollection = client.db("sadiqWebDB").collection("review");
    const userCollaction = client.db("sadiqWebDB").collection("users");

    // JWT post
    app.post('/jwt', (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '5h' })
      res.send({ token })
    })


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


    app.get('/users/admin/:email', verifyJWT, async (req, res) => {
      const email = req.params.email;

      if (!req.decoded.email) {
        res.send({ admin: false })
      }

      const query = { email: email };
      const user = await userCollaction.findOne(query);
      const result = { admin: user?.rol === 'admin' }
      res.send(result)

    })

    app.get('/users/instructor/:email', verifyJWT, async (req, res) => {
      const email = req.params.email;


      if (!req.decoded.email) {
        res.send({ instructor: false })
      }

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
    // My classes api route data***

    app.post('/addClass', async (req, res) => {
      const LoadClass = req.body;
      const result = await classesCollection.insertOne(LoadClass);
      res.send(result)
    })

    // admin approved classes apis:
    app.patch('/classes/:id', async (req, res) => {
      const id = req.params.id;
      const status = req.query.status;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          status: status,
        }
      };
      const result = await classesCollection.updateOne(filter, updateDoc);
      res.send(result);
    })

    // Delete my class
    app.delete('/myClass/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await classesCollection.deleteOne(query);
      res.send(result)
    })



    // only my All Class get api
    app.get('/myAllClass', verifyJWT, async (req, res) => {
      const email = req.query.email;
      if (!email) {
        return res.send([]);
      }
      const decodedEmail = req.decoded.email;
      if (email !== decodedEmail) {
        return res.status(403).send({ error: true, message: 'forbidden access' });
      }
      const query = { email: email }
      const result = await classesCollection.find(query).toArray();
      res.send(result);
    })

    // Instructors Collection
    app.get('/instructors', async (req, res) => {
      const instructors = await instructoresCollection.find().toArray();
      res.send(instructors)
    })

    // Select button clicking to add mongodb collection
    app.post('/selectClass', async (req, res) => {
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


    // payment er jonno kaj start
    app.get("/selectClass/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await classCollection.findOne(query);
      res.send(result);
    });

    //   create payment intent
    app.post("/create-payment-intent", verifyJWT, async (req, res) => {
      const { price } = req.body;
      const amount = parseInt(price * 100);
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: "usd",
        payment_method_types: ["card"],
      });

      res.send({
        clientSecret: paymentIntent.client_secret,
      });
    });

    app.post("/payments", verifyJWT, async (req, res) => {
      const payment = req.body;

      const id = payment.id;
      console.log(id);
      const filter = { id: id };
      const query = {
        _id: new ObjectId(id),
      };
      const existingPayment = await paymentCollection.findOne(filter);
      if (existingPayment) {
        return res.send({ message: "Already Enrolled This Class" })
      }
      const insertResult = await paymentCollection.insertOne(payment);
      const deleteResult = await classCollection.deleteOne(query);

      return res.send({ insertResult, deleteResult });
    });


    app.patch("/all-classes/seats/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const filter = { _id: new ObjectId(id) };
      const updateClass = await classesCollection.findOne(filter);
      if (!updateClass) {
        // Handle case when the seat is not found
        console.log("Seat not found");
        return;
      }
      const updateEnrollStudent = updateClass.student + 1;
      const updatedAvailableSeats = updateClass.seats - 1;
      const update = {
        $set: {
          seats: updatedAvailableSeats,
          student: updateEnrollStudent,
        },
      };
      const result = await classesCollection.updateOne(filter, update);
      res.send(result);
    });



    app.get('/payments', verifyJWT, async (req, res) => {
      const email = req.query.email;
      console.log(email, 353)
      if (!email) {
        return res.send([]);
      }
      const decodedEmail = req.decoded.email;
      if (email !== decodedEmail) {
        return res.status(403).send({ error: true, message: 'forbidden access' });
      }
      const query = { email: email }
      const result = await paymentCollection.find(query).sort({ date: -1 }).toArray()
      res.send(result);
    })

    // Review Collection
    app.get('/review', async (req, res) => {
      const instructors = await reviewCollection.find().toArray();
      res.send(instructors)
    })

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
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
