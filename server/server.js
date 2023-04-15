const {instrument} = require("@socket.io/admin-ui");
const mongoose = require("mongoose");
const User = require("./User");
const Chat = require("./Chat");

mongoose.connect("mongodb://localhost:27017/myChat" , { useNewUrlParser: true });
mongoose.set('strictQuery', true);
const io = require("socket.io")(3000, {
    cors:{
        origin: ['http://localhost:8080' , "https://admin.socket.io"],
        credentials: true
    }
});

io.on("connection" , async function(socket){
    // console.log(socket.id);
    const AllUsers = await User.find()
    // console.log(AllUsers)
    socket.emit("render-users" ,AllUsers)
    socket.on("add-user" , async function(){
        const AllUsers = await User.find();
        socket.emit("render-users" , AllUsers);
    })
    // handle send message 
    socket.on('send-message' , async function(message , room , email, otherEmail){
        let myChat = await Chat.find({ users: [
            email,
            otherEmail
          ]})
        let myChat1 = await Chat.find({users:[
            otherEmail,
            email
        ]})

        if(myChat.length === 0 && myChat1.length === 0){
            let chat = new Chat({
                users:[email , otherEmail],
                messages:[message]
            })
            if(room == ""){
                socket.broadcast.emit("receive-message", message);
                await chat.save().then(()=>{
                })
            }else{
                socket.to(room).emit("receive-message", message);
            }
        }else{
            Chat.findOneAndUpdate({users:[
                `${email}`,
                `${otherEmail}`
            ]},
            {$push:{messages:message}},{},function(error , sucsses){
                if(sucsses == null){
                    Chat.findOneAndUpdate({users:[
                        `${otherEmail}`,
                        `${email}`
                    ]},{
                        $push:{messages:message}
                    } ,{} , function(error , sucsses){
                        if(error){
                        }else{
                            socket.broadcast.emit("receive-message" , message);
                        }
                    })
                }
            })
        }
    }) // finish handel send message  

    socket.on("search-chat" , async function(otherEmail , email){
        let chat = await Chat.find({users:[
            email,
            otherEmail
        ]})     
        if(chat.length == 0){
            let chat1 = await Chat.find({users:[
                `${otherEmail}`,
                `${email}`
            ]})
            console.log(email);
            console.log(otherEmail);
            console.log(chat1);
            socket.emit("find-chat" , chat1);
        }else{
            socket.emit("find-chat" , chat)
        }
    })
    // costom join room
    socket.on("join-room" , (room , calBack)=>{
        socket.join(room)
        calBack(`joined to ${room}`);
    })
    socket.on("login" ,async function(user){
        let newUser =  new User({
            name:user.name,
            email:user.email,
            password:user.password,
        })
        await newUser.save().then(()=>{
            console.log("user saved")
        })
    })
})
instrument(io , {auth:false})