import {io} from "socket.io-client";

// declear all variable
const joinRoomButton = document.querySelector("#room-button");
const messageInput = document.querySelector("#message-input");
const roomInput = document.querySelector("#room-input");
const formMessage = document.querySelector("#form-message");
const loginButton = document.querySelector("#login-btn");


let displayMessage = function(
    message, 
    background ="#CCC" ,
    color="black",
    margin = "10px" ,
    maxWidth = "100%",
    marginLeft = "10px",
    marginRight = "10px",
    align = "flex-start",
    ){
    let div = document.createElement("div");
    div.innerText = message;
    div.style.backgroundColor = background;
    div.style.color = color;
    div.style.marginTop = margin;
    div.style.marginLeft = marginLeft;
    div.style.marginRight = marginRight;
    div.style.maxWidth = maxWidth;
    div.style.alignSelf = align;
    div.style.padding = "5px";
    div.style.borderRadius = "10px";
    document.getElementById("message-container").append(div);
}

// make socket.io functions
const socket = io("http://localhost:3000");

// socket.on("connect" , function(){
//      displayMessage(`you connected with id: ${socket.id}`,"800" , "19" , "rgb(45, 74, 238)")
// })
socket.on("receive-message" , function(message){
    displayMessage(message , "#ddd" , "black" ,"5px" ,"80%");
});
socket.on("render-users" ,async function(AllUsers){
       await AllUsers.forEach((user)=>{
        let div = document.createElement("div");
        div.innerHTML = `${user.name}<br/>${user.email}`;
        div.id = user.email;
        div.setAttribute("name" , user.name);
        div.addEventListener("click" , function(){
            document.querySelector(".active")?.classList.remove("active");
            div.classList.add("active");
            socket.emit(
                "search-chat" ,
                user.email ,
                window.localStorage.getItem("email"))
        })
        document.querySelector(".chat-users").appendChild(div)
    })
})

    socket.on("find-chat" , function(chat){
        let message;
        if(chat.length > 0){
             message = `<div 
             style="
             background-color: blue;
             align-self:center;
             max-width: 100%;
             margin-bottom:10px;
             color:white;
             text-align:center;">
             chat with ${chat[0].users[0]} and ${chat[0].users[1]}
             </div>`
             document.getElementById("message-container").innerHTML = message;
             for(let i = 0 ;i < chat[0].messages.length ; i++){
                let name = window.localStorage.getItem("name");
                 if(chat[0].messages[i].slice(0,name.length) == name){
                     displayMessage(
                        chat[0].messages[i].slice(name.length+1 , chat[0].messages[i].length),
                        "blue",
                        "white",
                        "10px" ,
                        "80%" ,
                        "0" ,
                        "3px" ,
                        "flex-end");
                 }
                 else{
                    let active = document.querySelector(".active")
                    console.log(active.getAttribute("name"));
                    displayMessage(
                        chat[0].messages[i].slice(active.getAttribute("name").length+1
                        ,chat[0].messages[i].length));
                 }
             }
        }else{
            message = `<div 
            style="background-color: blue;
             align-self:center;
             max-width: 100%;
             margin:0;
             color:white;
             text-align:cente;">
             no messages found with ${document.querySelector(".active").id}
             </div>`;
             document.getElementById("message-container").innerHTML = message;
        }
    })

// send message
formMessage.addEventListener("submit" , function(e){
    e.preventDefault();
    const message = `${window.localStorage.getItem("name")}:${messageInput.value}`;
    const room = roomInput.value;
    if(message == "") return;
    socket.emit(
        "send-message",
        message,
        room,
        `${window.localStorage.getItem("email")}`,
        document.querySelector(".active").id
        )
    displayMessage(
        message.slice(window.localStorage.getItem("name").length+1 ,
        message.length) ,
        "blue" ,
        "white",
        "5px",
        "80%" ,
        "0px" ,
        "10px" ,
        "flex-end");
    messageInput.value = "";
})

// join room 
joinRoomButton.addEventListener("click" , function(){
    let room = roomInput.value;
    socket.emit("join-room" , room , message=>{
        displayMessage(
            message,
            "blue" ,
            "white" ,
            "5px" ,
            "100%" ,
            "0" ,
            "0" ,
            "center")
    });
})
if(
    window.localStorage.getItem("name") != null&&
    window.localStorage.getItem("email") != null&&
    window.localStorage.getItem("password") != null
){
    document.querySelector(".chats").style.display = "flex";
    displayMessage(
        `wellcome ${window.localStorage.getItem("name")}`,
        "blue" ,
        "white" ,
        "0px" ,
        "100%" ,
        "0" ,
        "0" ,
        "center")
    document.querySelector(".login").style.display = "none";
}
loginButton.addEventListener("click" , function(e){
    e.preventDefault();
    const loginForm = document.querySelector("#login")
    document.querySelector(".login").style.display = "none";
    const data = {
        name:loginForm.name.value,
        email:loginForm.email.value,
        password:loginForm.password.value,
        }
    socket.emit("login" , data)
    window.localStorage.setItem("name" , data.name)
    window.localStorage.setItem("email" , data.email)
    window.localStorage.setItem("password" , data.password)
    document.querySelector(".chats").style.display = "flex";
    displayMessage(
        `wellcome ${data.name}`,
        "blue" ,
        "white" ,
        "0px" , 
        "100%" , 
        "0" ,
        "0" , 
        "center")
    socket.emit("add-user");
})
// finish login *************


    // add animaiton to show user button
    let showUsers = document.querySelector(".show-users")
    let users = document.querySelector(".chat-users");
    showUsers.addEventListener("click" ,function(){
        showUsers.style.animationName = "scale"
        setTimeout(function(){
            showUsers.style.animationName = ""
        },450)
        let isScale = users.getAttribute("aria-expanded");
        if(isScale == "true"){
            users.setAttribute("aria-expanded" , "false")
        }
        else{
            users.setAttribute("aria-expanded" , "true");
        }
    })