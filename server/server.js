const express = require("express");
const app = express();
const PORT = process.env.PORT || 7000;
const server = app.listen(PORT, () => console.log(`Server running on PORT ${PORT}`));
app.use(express.static("client"));

const socket = require("socket.io");
const io = socket(server);

const botName = "Game";

module.exports = { io, botName };

const { users, removeUser, getUserById, getUserByName, regExp } = require("./users.js");


io.on("connection", (socket) => {
    io.emit("userNumber", users.length);
    socket.on("loginAttempt", (name) => {
        addUser(socket, name);
    });
    socket.on("clientMessage", (text) => sendMessage(socket, text));
    socket.on("disconnect", () => removeSocket(socket));
});

function addUser(socket, name) {
    socket.join("users");
    socket.emit("login");
    io.to("users").emit("serverMessage", {
        name: botName,
        text: `${name} uruund user bn`,

    });

    for (const otherUser of users) {
        socket.emit("user", otherUser);
    }

    const user = { id: socket.id, name: name };
    users.push(user);

    io.emit("userNumber", users.length);

    io.to("users").emit("user", user);
}

function removeSocket(socket) {
    const user = getUserById(socket.id);
    if (!user) return;
    io.to("users").emit("serverMessage", {
        name: botName,
        text: `${user.name} uruunuus garaad yavchihloo!`
    });
    socket.leave("users");
    removeUser(user);
    io.emit("userNumber", users.length);
    io.to("users").emit("removeUser", user);
}

function sendMessage(socket, text) {
    if (text.length === 0) return;
    
    if (text.length > 180) {
        socket.emit("serverMessage", {
            name: botName,
            text: `180 bh yostoi!`
        });
        return;
    }

    const user = getUserById(socket.id);

    if (!user) return;
    let recipients, sender;
    const matches = text.match(regExp());
    if (matches) {
        recipients = [socket.id];
        sender = `${user.name} (PM)`;
        for (const match of matches) {
            const privateName = match.substring(2, match.length - 1);
            const privateUser = getUserByName(privateName);
            if (privateUser && privateUser.id !== socket.id) {
                recipients.push(privateUser.id);
            }
        }
    } else {
        recipients = ["users"];
        sender = user.name;
    }
    for (const recipient of recipients) {
        io.to(recipient).emit("serverMessage", {
            name: sender,
            text: text
        });
    }
}