const express = require('express');
const cors = require('cors');
const app = express ();
const port = process.env.PORT||5000;

// Middelware
app.use(cors())
app.use(express.json())

app.get('/',(req,res)=>{
    res.send('Hallo assignment')
})

app.listen(port,()=>{
    console.log('Assignment Server is runing on the port',port);
})