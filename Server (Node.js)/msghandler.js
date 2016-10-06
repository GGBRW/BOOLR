module.exports = function(message) {
    message = message.toString().split(" ");
    const command = message[0];
    const data = message.splice(1);

    switch(command) {
        case "add":
            break;
        case "remove":
            break;
        case "edit":
            break;
    }
}