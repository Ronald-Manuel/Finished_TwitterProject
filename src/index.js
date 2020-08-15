'use strict'

require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./app');
const port = process.env.PORT;
const mongoURL = process.env.MONGO_URL;


mongoose.connect('mongoURL', {useNewUrlParser:true, useUnifiedTopology: true, useFindAndModify: false})
.then(()=>{
    console.log('Conexión a la base de datos establecida');
    app.listen(port, ()=>{
        console.log('Servidor de express corriendo');
    });
})
.catch((err)=>{
    console.log('Error al establecer la conexión', err);
})