const userList = document.getElementById("userList");

userList.show = function() {
    this.style.display = "block";
    this.innerHTML = "";

    for(let i in socket.users) {
        this.innerHTML +=
            i + ": " +
            (socket.users[i].online ? "online".fontcolor("#050") : "offline".fontcolor("#500")).bold() +
            "<br>";
    }

    this.innerHTML += "Spectators: " + (socket.spectators ? socket.spectators : 0);
}