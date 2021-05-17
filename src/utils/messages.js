const generateMessage = (text,username) => {
    return {
        text,
        username,
        createdAt : new Date().getTime()
    }
}

const generateLocationMessage = (url,username) => {
    return {
        url,
        createdAt : new Date().getTime(),
        username,
    }
}

module.exports = {
    generateMessage,
    generateLocationMessage
}