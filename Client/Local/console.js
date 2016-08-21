const Console = document.getElementById("console");
Console.input = document.getElementById("input");
Console.output = document.getElementById("output");

Console.type = function(name,background="#111",color="#888") {
    this.name = name;
    this.background = background;
    this.color = color;
}
Console.types = {};
Console.types.chat = new Console.type("chat","#111","#888");
Console.types.debug = new Console.type("debug","#747a80","#111");

Console.message = function(text,type=Console.types.chat) {
    const message = document.createElement("li");
    message.style.background = type.background;
    message.style.color = type.color;
    message.style.opacity = 1;
    message.innerHTML = "[" + type.name.toUpperCase() + "] " + text;
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
