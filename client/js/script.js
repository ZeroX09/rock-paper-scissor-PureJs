const onlineButton = document.getElementById('start-online');
const switchRoom = document.getElementById('switch-room');
const sectionBattle = document.querySelector('.game-battle')
const sectionRoom = document.querySelector('.rooms-group')
const playAgain = document.querySelector('#btn-again')
const loading = document.getElementById('loading')
const link = document.getElementById('link')
const sectionMenu= document.querySelector('.menu')
const url = new URL(window.location.href);
const messageError=  document.querySelector('.message-error');
const btnsGame = document.querySelectorAll('.btn-choose')
const my =  document.querySelector('.my .btn-game');
const opp =  document.querySelector('.opp .btn-game');
const paperSVG = document.querySelector('.paper svg').cloneNode(true);
const rockSVG = document.querySelector('.rock svg').cloneNode(true);
const scissorsSVG = document.querySelector('.scissors svg').cloneNode(true);
const againCircleUr = document.querySelector('#btn-again .ur');
const againCircleOpp = document.querySelector('#btn-again .opp')
const containerButton = document.querySelector('.container-button');
const statusBattle =  document.querySelector('.status-win');
const roomsGroup = document.querySelector('#rooms');
const btnReady = document.querySelector('.btn-ready')
const statusOpp = document.getElementById('status-opp')
const statusUr = document.getElementById('status-ur')
const prevButton = document.querySelectorAll('.prev');
const socket = io(url.origin,{ transports : ['websocket'] });

let membersArray = [];
let roomsArray = [];
let results= {my:{} ,another:{}};


 
socket.on('error',error=>{
setMessagError(error)

    switchSection(sectionMenu,sectionBattle);
    pushState('','','/')

})




socket.on('join-room',(members)=>{
   membersArray = members;
   if(members.length===2){
    let opp =members.find(member=> member.socketId !== socket.id);
    setInformation(opp.type ? 'Ready' : 'The opponent makes a choice..');
    results.another = {type:opp.type}
   }

});


socket.on("get-rooms",rooms=>{
    if(rooms.length===0){
        roomsGroup.innerHTML = "<h1>No Rooms</h1>";
    }

    roomsArray = rooms;
    roomsGroup.innerHTML = '';
    roomsArray.forEach((room,idx)=>{
        let anchor= document.createElement('a');
        anchor.href = url.origin+'?roomId='+room.roomId;
        anchor.innerHTML=`
       room-${idx+1}
       <span class='${room.count === 2?'full':''}'>${room.count}/2</span>
        `
        roomsGroup.appendChild(anchor)
    })
})



socket.on('another-play',(type)=>{
    results.another = {type};
    setInformation("Ready");
    checkResults();
})

socket.on('again-match',({again})=>{

    if(again){
        againCircleOpp.classList.add('checked')
    }else{
        againCircleOpp.classList.remove('checked')
    }
})



socket.on('again-process',()=>{
    againProccess()
})

socket.on('another-left',()=>{
    pushState('/')
})

onlineButton.addEventListener('click',startGameOnline);
switchRoom.addEventListener('click',()=>{
    toggleElement(sectionMenu);
    toggleElement(sectionRoom);

    pushState('/group');
});

prevButton.forEach(item=>item.addEventListener("click",()=>{
    let url = new URL(window.location.href);
    if(url.searchParams.get('roomId')){
        socket.emit('left');
    }
  pushState('/');
}));




playAgain.addEventListener('click',againMatch);
link.addEventListener('click',(e)=>copy(e.target.innerText));

function pushState(to){
    window.history.pushState('','',to);
}



(async()=>{
    if(url.pathname === '/group'){
        switchSectionAndLoading(sectionRoom)
return;
    }
if(url.searchParams.get('roomId')){
try{

    let {roomId} =await getRoomById(url.searchParams.get('roomId'))

    switchSectionAndLoading(sectionBattle)
socket.emit('join-room',{roomId})
    link.innerText =  url.origin+'?roomId='+roomId;

}catch(e){
    switchSectionAndLoading(sectionMenu);
    pushState('/')
}

}else{
    switchSectionAndLoading(sectionMenu)

}
}
)()

btnReady.addEventListener('click',startBattle)


btnsGame.forEach(item=>{
    item.addEventListener('click',chooseBtn);
})

function switchSection(sect1,sect2){
    toggleElement(sect1);
    toggleElement(sect2);
}

function switchSectionAndLoading(section){
    toggleElement(section);
    toggleElement(loading)
}


function toggleElement(element,showOrhide){
    if(typeof showOrhide === 'boolean'){
        if(showOrhide){
            element.classList.remove("hidden")
        }else{
        element.classList.add('hidden');
        }
        return
    };
    if(element.classList.contains('hidden')){
        element.classList.remove('hidden');
    }else{
        element.classList.add('hidden');
    }
}


async function startGameOnline(){
    toggleElement(loading)
    toggleElement(sectionMenu);
    let roomId = await getRoom();
    const linkRoom = url.origin+'?roomId='+roomId;
    link.href = url.origin+'?roomId='+roomId;
    link.innerText = linkRoom;
    switchSectionAndLoading(sectionBattle)


}


async function getRoom(){
    const room = await fetch(`${url.origin}/room`)
    const {roomId} = await room.json()
    socket.emit('join-room',{roomId:roomId})
    socket.emit('created-room',{roomId:roomId})
    // window.history.pushState('','',
    pushState('/?roomId='+roomId)
    return roomId

}


async function getRoomById(id){
    try{
    const response = await fetch(`${url.origin}/room/`+id);
    const room= await response.json();
    if(!response.ok){
        
        throw room;
    }

    return room
    }catch(e){
       setMessagError(e.error);
        throw e
    }
}


function chooseBtn(e){
    btnsGame.forEach(item=>item.classList.remove('checked'))
    e.currentTarget.classList.add('checked');
  setGameBtn(my,e.currentTarget.dataset.type.toLocaleUpperCase())


}



function setInformation(statusopp,statusur){
        statusOpp.innerText =statusopp;
        statusUr.innerText = statusur||'';
        opp.appendChild(statusOpp)
        my.appendChild(statusUr)
}


function startBattle(){

   let isChecked= document.querySelector('.btn-choose.checked')

    if(isChecked){
        const type = isChecked.dataset.type.toLocaleUpperCase();
        socket.emit('play',{type});

        toggleElement(containerButton)
        toggleElement(btnReady)
        results.my = {type:type};
        checkResults();
    }
}

let statusWin ={
    rock:"ROCK",
    scissors:"SCISSORS",
    paper:"PAPER"
}

function setGameBtn(item,type){
    item.innerHTML = '';
    item.classList.remove('paper','sscissors','rock')
    item.classList.add(type.toLocaleLowerCase());

    if(type === 'PAPER'){
    item.append(paperSVG);

    }
    if(type === 'ROCK'){
    item.append(rockSVG);

    }
    if(type === 'SCISSORS'){
    item.append(scissorsSVG);

    }
}

function checkResults(){
    let me = results.my.type;
    let oppoent = results.another.type;

    if(!me || !oppoent)return;

    let state = null;
   setGameBtn(opp,oppoent);
    
    if(me === statusWin.rock &&oppoent === statusWin.scissors){
        //win
        state = "You Win";
        
      
    }else if (me === statusWin.rock &&oppoent === statusWin.rock){
        //draw
        state = "draw";


    }else if(me === statusWin.rock &&oppoent === statusWin.paper){
        //defeat
        state = "defeat";

    }

    if(me === statusWin.scissors &&oppoent === statusWin.paper){
        //win
        state = "You Win";

    }else if (me === statusWin.scissors && oppoent=== statusWin.scissors){
        //draw
        state = "draw";

    }else if(me === statusWin.scissors && oppoent=== statusWin.rock){
        //defeat from scissors
        state = "defeat";

    }


    if(me === statusWin.paper && oppoent=== statusWin.rock){
        //win
        state = "You Win";

    }else if (me === statusWin.paper &&oppoent === statusWin.paper){
        //draw
        state = "draw";

    }else if(me === statusWin.paper &&oppoent === statusWin.scissors){
        //defeat
        state = "defeat";
    }


    statusBattle.querySelector('.state').innerText = state;
    toggleElement(statusBattle);


}

function resetting(){
    results = {another:{},my:{}};
    my.innerHTML ="";
    opp.innerHTML = "";
    setInformation('The opponent makes a choice..',"Choose");
    btnsGame.forEach(btn=>btn.classList.remove('checked'));
    toggleElement(statusBattle)
    toggleElement(containerButton);
    toggleElement(btnReady)
    againCircleUr.classList.remove('checked');
    againCircleOpp.classList.remove('checked');

    my.className = 'btn-game-lg btn-game';
    opp.className = 'btn-game-lg btn-game';

}

function againMatch(){
    if(againCircleUr.classList.contains('checked')){
        againCircleUr.classList.remove('checked');
        socket.emit('request-again',{again:false});

    }else{
        socket.emit('request-again',{again:true});
        againCircleUr.classList.add('checked');
    }

}


function againProccess(){
        resetting();
    
}

function setMessagError(error){
    messageError.innerText=error
    toggleElement(messageError)
}



function copy(text){
    navigator.clipboard.writeText(text);

    let h3 = document.createElement('h3');
    h3.innerText = 'copied'
    link.after(h3)
    setTimeout(()=>h3.remove(),1000)
}