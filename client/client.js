const socket = io();

socket.on("userNumber", (number) => {
    $("#userNumber").text(number);
});

$("#loginButton").click(loginAttempt);

function loginAttempt() {
    const name = $("#nameInput").val();
    socket.emit("loginAttempt", name);
}


socket.on("login", () => {
    $("#loginForm").hide();
    $("#room").show();
    $("#messageSubmit").click(submitMessage);
    $("#messageInput")
        .focus()
        .keydown((e) => {
            if (e.key === "Enter") submitMessage();
        });
    $("#logoutButton").show().click(logout);
    socket.on("serverMessage", displayMessage);
    socket.on("user", showUser);
    socket.on("removeUser", removeUser);
});


function logout() {
    location.reload();
}

function submitMessage() {
    var text = $("#messageInput").val();
    socket.emit("clientMessage", text);
    $("#messageInput").val("").focus();
}

function showUser(user) {
    const userSpan = $("<span></span>")
        .text(user.name+', ')
        .addClass("userSpan")
        .attr("title", `bichlee ${user.name}`)
        .attr("name", user.name)
        .click(() => {
            $("#messageInput")
                .val($("#messageInput").val() + ` [@${user.name}] `)
                .focus();
        });
    $("#userList").append(userSpan);
}

function removeUser(user) {
    $(`[name= ${user.name}]`).remove();
}

function getTime() {
    const currentDate = new Date();
    const timeOption = { hour: "2-digit", minute: "2-digit" };
    return currentDate.toLocaleTimeString([], timeOption);
}

const messages = document.getElementById("messages");

function displayMessage(serverMessage) {
    const timeStamp = $("<span></span>").text(getTime()).addClass("timeStamp");
    const userInfo = $("<span></span>")
        .text(`${serverMessage.name}: `)
    const messageText = $("<span></span>")
        .text(serverMessage.text)
    const message = $("<div></div>")
        .addClass("message")
        .append(timeStamp)
        .append(userInfo)
        .append(messageText);
    $("#messages")
        .append(message)
        .scrollTop(function () {
            return this.scrollHeight;
        });
}