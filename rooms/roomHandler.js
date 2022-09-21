let rooms = [];
let members = [];

function pushMember({socketId,roomId}){
        if(roomIsLarge(roomId)){
           return false
        }

    members.push({
        socketId,
        roomId
    });

    return true
}


function roomIsLarge(roomId){
    return members.filter(member => member.roomId==roomId).length >=2;
}

function roomIsExists(roomId){
    if(getRoom(roomId)){
        return true
    }else{
        return false;
    }
}


function deleteMember(socketId){
    members = members.filter(member => member.socketId !== socketId);

}

function getMembers(roomId){

    return members.filter(member => member.roomId === roomId);
}

function getMember(socketId){
    return members.find(member => member.socketId === socketId);

}

function getRoom(roomId){
    return rooms.find(room => room.roomId == roomId);
}
function getRooms(){
    let data = [];

    rooms.forEach((item)=>{
       let membersCount = getMembers(item.roomId).length;
      data.push({
          roomId:item.roomId,
          count:membersCount
       });
    })
    return data;
}
function addRoom(id){
    rooms.push({
        roomId:id
    })
}

function deleteRoom(roomId){
   rooms = rooms.filter(room=>room.roomId !== roomId);
   members = members.filter(member => member.roomId !== roomId);
}

function setType(socketId,type){
    let memberIdx =  members.findIndex(member => member.socketId === socketId);
    members[memberIdx].type = type;
}



function setAgain(socketId,again){
    let memberIdx =  members.findIndex(member => member.socketId === socketId);
    members[memberIdx].again = again;
}



module.exports ={rooms,deleteRoom,members,pushMember,roomIsExists,deleteMember,getMembers,getMember,setType,setAgain,getRoom,getRooms,addRoom}