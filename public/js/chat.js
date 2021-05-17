const socket = io()

const messageTemplate = document.querySelector("#message-template").innerHTML
const locationMessageTemplate = document.querySelector("#location-message-template").innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

const messages = document.querySelector("#messages")
 
const { username,room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoScroll = () => {
    // New message element
    const $newMessage = messages.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight = messages.offsetHeight

    // Height of messages container
    const containerHeight = messages.scrollHeight

    // How far have I scrolled?
    const scrollOffset = messages.scrollTop + visibleHeight

    if(Math.round(containerHeight - newMessageHeight) <= Math.round(scrollOffset)){
        messages.scrollTop = messages.scrollHeight;
    }
}

socket.on("message",(message) =>{
    const html = Mustache.render(messageTemplate,{
        message : message.text,
        createdAt : moment(message.createdAt).format("h:mm a"),
        username : message.username
    })
    messages.insertAdjacentHTML("beforeend",html)
    autoScroll()
})

socket.on("locationmessage",(url) =>{
    const html = Mustache.render(locationMessageTemplate,{
        url: url.url,
        createdAt: moment(url.createdAt).format("h:mm a"),
        username : url.username
    })
    messages.insertAdjacentHTML("beforeend",html)
    autoScroll

})

socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})



document.querySelector("#message-form").addEventListener("submit",(e)=>{
    const message = e.target.children[0].value

    socket.emit("sendMessage",message,(msg)=>{
    })
    e.preventDefault()
})

const sendLocation = () => {
    if(!navigator.geolocation){
        return alert("geolocation is not supported by your browser!")
    }

    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit("sendPosition",position.coords.latitude,position.coords.longitude,()=>{
        })
    })
}

socket.emit("join", { username,room },(error)=>{
    if(error){
        alert(error)
        location.href = "/"
    }
} )

// socket.on("countUpdated",(count)=>{
//     console.log("countUpdated" + count)
// })

// document.querySelector("#increment").addEventListener("click",()=>{
//     socket.emit("increment")
// })