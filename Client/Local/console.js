const Console = document.getElementById("console");
Console.input = document.getElementById("input");
Console.output = document.getElementById("output");

Console.type = function(background="#111",color="#888") {
    this.background = background;
    this.color = color;
}
Console.types = {};
Console.types.chat = new Console.type("#bbb","#111");
Console.types.debug = new Console.type("#747a80","#111");
Console.types.error = new Console.type("#822","#ddd");

Console.message = function(text,type=Console.types.chat) {
    const message = document.createElement("li");
    message.style.background = type.background;
    message.style.color = type.color;
    message.style.opacity = 1;
    message.innerHTML = text;
    message.fadeOut = function() {
        message.style.opacity = 0;
        setTimeout(() => { message.style.display = "none" }, 1000);
    }
    Console.output.appendChild(message);
    setTimeout(() => message.fadeOut(), 3000);

    for(let i = Console.output.children.length - 1; i >= 0; --i) {
        if(Console.output.children[i].style.display != "none" && Console.output.children.length - i > 4) Console.output.children[i].fadeOut();
    }
}

Console.input.onkeydown = function(e) {
    if(e.which == 13) {
        const input = Console.input.value.split(" ");
        const command = input[0];
        const args = input.slice(1);
        switch(command) {
            case "help":
                Console.message("- 'center': naar het midden <br>- 'goto x y': ga naar x,y <br>- Er komen nog meer commando's hoor!");
                break;
            case "center":
                scroll(-offset.x,-offset.y);
                Console.message("Moved to center");
                break;
            case "goto":
                scroll(+args[0],+args[1]);
                Console.message("Moved to " + args[0] + "," + args[1]);
                break;
            default:
                Console.message("That command does not exist", Console.types.error);
                break;
        }

        Console.input.value = "";
    }
}
