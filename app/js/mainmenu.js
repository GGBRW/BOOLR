const mainMenu = document.querySelector(".main-menu");

mainMenu.show = function() {
    this.style.display = "block";

    setTimeout(() => {
        this.style.opacity = 1;
    },10);

    this.querySelector("h1").style.top = 0;

    const buttons = this.querySelectorAll(".main-menu > button");
    for(let i of buttons) {
        i.style.top = 0;
        i.style.opacity = 1;
        i.style.transform = "translateX(0px)";

        i.querySelector(".material-icons").style.transform = "translateX(0px)";
    }
}

mainMenu.hide = function() {
    const buttons = this.querySelectorAll("button");
    for(let i of buttons) {
        i.style.top = "100%";
    }

    this.querySelector("h1").style.top = "-100%";

    this.style.opacity = 0;

    setTimeout(() => {
        this.style.display = "none";
        c.focus();
    }, 500);
}

window.onload = mainMenu.show.bind(mainMenu);


// Open board menu

const openBoardMenu = document.querySelector(".open-board");
openBoardMenu.show = function() {
    this.style.display = "block";
    const height = this.clientHeight - 50;

    setTimeout(() => {
        this.style.opacity = 1;
        this.style.transform = "translateY(0px)";
        mainMenu.style.transform = "translateY(-100px)";
    },10);
}

openBoardMenu.hide = function() {
    setTimeout(() => {
        this.style.opacity = 0;
        this.style.transform = "translateY(-50px)";
        mainMenu.style.transform = "translateY(0px)";
    });
    setTimeout(() => this.style.display = "none", 500);
};

(function() {
    const list = document.querySelector(".open-board ul");

    for(let save of saves) {
        const li = document.createElement("li");
        li.innerHTML += `${save.name}`;

        // Convert file size
        const i = Math.floor(Math.log(save.fileSize) / Math.log(1024));
        const size = (save.fileSize / Math.pow(1024,i)).toFixed(2) * 1 + " " + ["bytes","KB","MB","GB","TB"][i];

        li.innerHTML += `<span>${size}</span>`;

        li.innerHTML += `<span>${save.fileName}</span>`;

        li.onclick = () => {
            openSaveFile(save.fileName);
            openBoardMenu.hide();
            mainMenu.hide();
        }

        list.appendChild(li);
    }
})();