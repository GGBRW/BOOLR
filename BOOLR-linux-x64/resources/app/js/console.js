const Console = document.querySelector("#console");
Console.input = document.querySelector("#console #input");
Console.messages = document.querySelector("#console #messages");

let variables = {};

Console.show = function() {
    this.style.display = "block";
    this.style.left = 0;
}

Console.hide = function() {
    this.style.display = "none";
    Console.input.blur();
    c.focus();
}

Console.message = function(msg) {
    Console.messages.innerHTML += "<div class='message'>" + msg + "</div>";
}

Console.error = function(msg) {
    Console.messages.innerHTML += "<div class='error'>ERROR: " + msg + "</div>";
}

Console.input.onkeydown = function(e) {
    if(e.which == 13) {
        let input = this.textContent;
        Console.input.textContent = "";
        Console.messages.innerHTML += "<div class='input'>" + input + "</div>";

        input = input.split(/ +/g);
        const command = input[0];
        const args = input.slice(1);

        switch(command) {
            case "help":
                Console.message(
                    "<u>Commands</u> <br> " +
                    "<b>help</b>: get list of all commands<br>" +
                    "<b>center</b>: move to center of the map<br>" +
                    "<b>goto [x] [y]</b>: move to a point on the map<br>" +
                    "<b>find [name]</b>: find and move to component<br>" +
                    "<b>connect [name] [name]</b>: connect two components<br>"
                );
                break;
            case "center":
                scroll(-offset.x,-offset.y);
                Console.messages.innerHTML += "<div class='output'>Moved to center</div>";
                break;
            case "goto":
                let dx = 0;
                if(args[0] && (args[0][0] == "+" || args[0][0] == "-") && args[0].length > 1) dx = +args[0];
                else if(!isNaN(args[0])) dx = +args[0] - offset.x;

                let dy = 0;
                if(args[1] && (args[1][0] == "+" || args[1][0] == "-") && args[1].length > 1) dy = +args[1];
                else if(!isNaN(args[1])) dy = +args[1] - offset.y;

                Console.messages.innerHTML += "<div class='output'>Moved to " + Math.round(offset.x + dx) + " " + Math.round(offset.y + dy) + "</div>";
                scroll(dx,dy);
                break;
            case "find":
                let component = components.find(n => n.name == args[0]);
                if(component) {
                    Console.messages.innerHTML += "<div class='output'>Component '" + args[0] + "' found at " + component.pos.x + " " + component.pos.y + "</div>";
                } else Console.messages.innerHTML += "<div class='output'>No component called '" + args[0] + "' found</div>";
                break;
            case "connect":
                let from = components.find(n => n.name == args[0]);
                let to = components.find(n => n.name == args[1]);
                if(!from && !to) {
                    Console.messages.innerHTML += "<div class='output'>No components called '" + args[0] + "' and '" + args[1] + "' found</div>";
                } else if(!from) {
                    Console.messages.innerHTML += "<div class='output'>No component called '" + args[0] + "' found</div>";
                } else if(!to) {
                    Console.messages.innerHTML += "<div class='output'>No component called '" + args[1] + "' found</div>";
                } else {
                    let wire = new Wire();
                    wire.from = from;
                    wire.to = to;
                    from.connect(to,wire);
                    Console.messages.innerHTML += "<div class='output'>Connected '" + args[0] + "' with '" + args[1] + "'</div>";
                }
                break;
            case "list":
                let list = "";
                for(let i in socket.users) {
                    list += `${i}<br>`;
                }
                Console.messages.innerHTML +=
                    "<div class='output'>" + list + "</div>";
                break;
            case "set":
                if((args[0].match(/[a-zA-Z'`´_-]+/g) || []) != args[0]) {
                    Console.error(args[0] + ": not a valid variable name");
                } else if(!variables[args[0]]) {
                    variables[args[0]] = {
                        value: isNaN(args[1]) ? args[1] : +args[1],
                        updates: []
                    };
                    Console.messages.innerHTML += "<div class='output'>" + args[1] + "</div>";
                } else {
                    const variable = variables[args[0]];
                    variable.value = isNaN(args[1]) ? args[1] : +args[1];

                    for(let i = 0; i < variable.updates.length; ++i) {
                        variable.updates[i]();
                    }

                    Console.messages.innerHTML += "<div class='output'>" + args[1] + "</div>";
                }
                break;
            case "get":
                const value = variables[args[0]].value;
                if(value == undefined) {
                    Console.error("Variable " + args[0] + " not found");
                } else {
                    Console.messages.innerHTML += "<div class='output'>" + value + "</div>";
                }
                break;
            default:
                Console.error("Command not found: \"" + command + "\"");
                break;
        }
        setTimeout(() => Console.input.focus());
        return false;
    } else if(e.which == 27) {
        Console.hide();
    }
}