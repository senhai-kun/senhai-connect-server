let users = []
const playlist = []
let videoUrl ;

const addUser = (room, username) => {
    const userExist = users.find( i => i.username === username )   
    let newUser = {
        room: room,
        username: username
    }
    if (!userExist) {
        users.push(newUser)
    }

    return users
}

const storeVideoUrl = (data) => {
    const { url, title, direct, playedBy, icon, channel, uploadedAt, room, length } = data
    if (!direct) {
        let newUrl = {
            url: `${url}?rel=0&vq=360p`,
            title: title,
            playedBy: playedBy,
            icon: icon,
            channel: channel,
            uploadedAt: uploadedAt,
            room: room,
            direct: false,
            length: length,
            ytVideo: true
        }
        videoUrl = newUrl
    } else {
        let directUrl = {
            url: url,
            title: title,
            playedBy: playedBy,
            room: room,
            direct: true,
            ytVideo: false
        }
        videoUrl = directUrl
    }
    // videoUrl = url
    return videoUrl
}

const getUrl = (room) => {
    return videoUrl
}

const getRoomUsers = (room) => {
    console.log("room name", room)
    let user = users.filter( i => i.room === room )
    console.log("user ", user)
    return user
}

const deleteUser = (username) => {
    let index = users.filter( i => i.username !== username)
    // if (index !== -1) return users.splice(index, 1)[0];
    users = index
    return users
}


module.exports = { addUser, getRoomUsers, deleteUser, storeVideoUrl, getUrl }