const socketio =  require('socket.io')
const {pushMember,roomIsExists, deleteMember, getMembers, getMember, setType, members, deleteRoom, setAgain, rooms, getRooms} = require('../rooms/roomHandler');
module.exports  = (httpserver)=>{
   const io = socketio(httpserver);

   io.on("connection",(socket)=>{
   
  
         io.emit('get-rooms',getRooms())

         socket.on('created-room',()=>{
         io.emit('get-rooms',getRooms());
         })

      socket.on('join-room',({roomId})=>{
         if(!roomIsExists(roomId)){
            socket.emit("error","room not found")
            // return;
         }
         if(pushMember({socketId:socket.id,roomId})){
            socket.join(roomId);
            io.in(roomId).emit('join-room',getMembers(roomId))
            

       
         }else{
            socket.emit("error","This Room are Full Members")
            return
         }


    })


    socket.on('play',({type})=>{
      const member = getMember(socket.id);
      if(!member)return socket.emit('error','Error Happend')

      socket.to(member.roomId).emit('another-play',type);
      setType(socket.id,type);
    })
    

    socket.on('request-again',({again})=>{
      const member = getMember(socket.id);
if(!member)return;
const members = getMembers(member.roomId);

setAgain(socket.id,again);
   
      socket.to(member.roomId).emit('again-match',{again});

      if(members[0]?.again&&members[1]?.again){
         io.to(member.roomId).emit("again-process");
        members.forEach(m=>setAgain(m.socketId,false))
      }  

    })


    socket.on('left',()=>{
      let member = getMember(socket.id);
      if(!member)return
      io.to(member.roomId).emit('another-left');
      deleteRoom(member.roomId);
      io.emit("get-rooms",getRooms())
    });



    socket.on('disconnect',()=>{
      
      const member = getMember(socket.id);
if(!member)return;
      
      // getMembers(member.roomId).forEach((member)=>{
      // deleteMember(member.socketId);
      // })
      deleteRoom(member.roomId);



      io.to(member.roomId).emit('another-left')

      io.emit('get-rooms',getRooms())

    })


   })
}  