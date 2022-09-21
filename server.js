const express = require('express');
const app =  express();
const httpServer = require('http').createServer(app);
const socketControll = require('./socket/socketControll')
const {rooms,getRoom, addRoom} = require('./rooms/roomHandler')
const path = require('path')
app.use(require('cors')())


app.get('/',(req,res)=>{
    res.sendFile(path.join(__dirname,'client','index.html'))
})
app.get('/group',(req,res)=>{
    res.sendFile(path.join(__dirname,'client','index.html'))
})

app.get('/room',(req,res)=>{
    const id = require('uuid').v4();

    addRoom(id);
    res.json({roomId:id})

})
 



app.get('/room/:id',(req,res)=>{
    let id = req.params.id
    if(!id){
        res.status(403).json({error:'invalid request'})
        return;
    }
    let specficRoom =getRoom(id);
 
    if(specficRoom){
        res.json(specficRoom);

    }else{
        res.status(404).json({error:'Not Found Room'})

    }

})



app.use('/',express.static(__dirname+'/client'))

socketControll(httpServer);



httpServer.listen(process.env.PORT || 3000)