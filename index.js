require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;

const app = express();
const port = process.env.PORT || 5000;

//MiddleWare
app.use(cors());
app.use(express.json());

// MongoDB
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.${process.env.DB_C}.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function mongodbCURD() {
  try {
    /* ------------------------------------- 
     checking connection with DB
    ------------------------------------- */
    await client.connect();
    console.log('db connected');
    /* ------------------------------------- 
    database name and collection init
    ------------------------------------- */
    const database = client.db('logOutage');
    const logCollection = database.collection('logs');
    /* ------------------------------------- 
    GET ALL LOGS
    ------------------------------------- */
    app.get('/logs', async (req, res) => {
      const cursor = logCollection.find({});
      const logs = await cursor.toArray();
      res.send(logs);
    });
    /* ------------------------------------- 
    Insert Login Data
    ------------------------------------- */
    app.post('/login', async (req, res) => {
      const login = req.body;
      const result = await logCollection.insertOne(login);
      res.json(result);
    });
    /* ------------------------------------- 
    Update Logout Time
    ------------------------------------- */
    app.put('/logout/:id', async (req, res) => {
      const id = req.params.id;
      const logoutTime = req.body.logoutTime;
      const filter = { _id: ObjectId(id) };

      const result = await logCollection.updateOne(filter, {
        $set: { logoutTime: logoutTime },
      });
      res.json(result);
    });
  } finally {
    // await client.close();
  }
}

mongodbCURD().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Running Server');
});

app.listen(port, () => console.log(`Server running on port ${port}`));
