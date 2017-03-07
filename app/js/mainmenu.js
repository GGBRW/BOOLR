const mainMenu = document.querySelector(".main-menu");

mainMenu.show = function() {
    openedSaveFile && save();
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

    setTimeout(() => loading.style.display = "none");
    setTimeout(clearBoard,1000);
}

mainMenu.hide = function() {
    for(let i of sub) i.hide();

    const buttons = this.querySelectorAll("button");
    for(let i of buttons) {
        i.style.top = "100%";
    }

    this.querySelector("h1").style.top = "-100%";

    this.style.opacity = 0;

    setTimeout(() => {
        this.style.display = "none";
        c.focus();

        if(!localStorage.pwsData) {
            dialog.welcome();
        }
    }, 500);
}

// Loading indicator
const loading = document.querySelector(".main-menu .loading");

// Sub menu's
const sub = document.querySelectorAll(".main-menu .sub");

// Apply show and hide methods to sub menu's
for(let i of sub) {
    i.show = function() {
        i.onopen && i.onopen();

        this.style.display = "block";
        const height = Math.min(innerHeight - this.getBoundingClientRect().bottom, 0) - 100;

        setTimeout(() => {
            this.style.opacity = 1;
            this.style.transform = "translateY(0px)";
            mainMenu.style.transform = `translateY(${height}px)`;
        },10);

        setTimeout(() => this.querySelector("input") && this.querySelector("input") .focus(), 10);

        for(let j of sub) i != j && j.hide();
    }

    i.hide = function() {
        this.style.opacity = 0;
        this.style.transform = "translateY(-50px)";
        mainMenu.style.transform = "translateY(0px)";
        setTimeout(() => this.style.display = "none", 500);

        i.onclose && i.onclose();
    }

    i.toggle = function() {
        if(this.style.display != "block") this.show();
        else this.hide();
    }

    i.onkeydown = function(e) {
        if(e.which == 13) {
            const buttons = this.querySelectorAll("button");
            buttons[buttons.length - 1] && buttons[buttons.length - 1].click();
        } else if(e.which == 27) {
            this.hide();
        }
    }
}

document.body.onkeydown = e => {
    if(e.which == 27) {
        for(let i of sub) i.hide();
    }
}

const newBoardMenu = document.querySelector(".main-menu .new-board");
const openBoardMenu = document.querySelector(".main-menu .open-board");
const settingsMenu = document.querySelector(".main-menu .settings");

newBoardMenu.onopen = function() {
    this.querySelector("#boardname").value = "";
    this.querySelector("#filename").innerHTML = "This board will be saved as new-board.board";
    this.querySelector("#filename").style.opacity = 1;

    setTimeout(() => this.querySelector("#boardname").focus(), 10);
}

openBoardMenu.onopen = function() {
    const list = document.querySelector(".open-board ul");

    list.innerHTML = "";
    readSaveFiles();

    if(saves.length < 1) {
        const li = document.createElement("li");
        li.innerHTML = "You have no saved boards";
        li.style.textAlign = "center";
        li.style.color = "#888";
        list.appendChild(li);
        return;
    }

    for(let save of saves) {
        const li = document.createElement("li");
        li.save = save;

        li.appendChild(document.createTextNode(`${save.name}`));

        // Remove board button
        const removeBtn = document.createElement("i");
        removeBtn.className = "material-icons";
        removeBtn.title = "Remove board";
        removeBtn.innerHTML = "delete";
        removeBtn.onclick = function(e) {
            dialog.confirm(
                "Are you sure you want to delete " + this.parentNode.save.name + "?",
                () => {
                    fs.unlink(savesFolder + save.fileName, (err) => console.log(err));
                    const index = saves.indexOf(save);
                    if(index > -1) saves.splice(index,1);
                    openBoardMenu.onopen();
                }
            );
            e.stopPropagation();
        }
        li.appendChild(removeBtn);

        // Edit board button
        const editBtn = document.createElement("i");
        editBtn.className = "material-icons";
        editBtn.title = "Edit board";
        editBtn.innerHTML = "edit";
        editBtn.onclick = function(e) {
            dialog.editBoard(save);
            e.stopPropagation();
        }
        li.appendChild(editBtn);

        // Convert file size
        const i = Math.floor(Math.log(save.fileSize) / Math.log(1024));
        const size = (save.fileSize / Math.pow(1024,i)).toFixed(2) * 1 + " " + ["bytes","KB","MB","GB","TB"][i];

        const sizeSpan = document.createElement("span");
        sizeSpan.innerHTML = `<span>${size}</span>`;
        li.appendChild(sizeSpan);

        const fileNameSpan = document.createElement("span");
        fileNameSpan.innerHTML = `<span>${save.fileName}</span>`;
        li.appendChild(fileNameSpan);

        li.onclick = () => {
            openSaveFile(save);
            openBoardMenu.hide();
            mainMenu.hide();
        }

        list.appendChild(li);
    }
}

settingsMenu.onopen = function() {
    this.querySelector("#settings") && this.removeChild(this.querySelector("#settings"));

    const settingsList = document.getElementById("settings").cloneNode(true);
    settingsList.style.display = "block";
    this.insertBefore(settingsList, this.querySelector("br"));

    const scrollAnimationOption = settingsList.querySelector(".option.scrollAnimation");
    scrollAnimationOption.checked = settings.scrollAnimation;

    const zoomAnimationOption = settingsList.querySelector(".option.zoomAnimation");
    zoomAnimationOption.checked = settings.zoomAnimation;

    const showDebugInfoOption = settingsList.querySelector(".option.showDebugInfo");
    showDebugInfoOption.checked = settings.showDebugInfo;

    const showComponentUpdatesOption = settingsList.querySelector(".option.showComponentUpdates");
    showComponentUpdatesOption.checked = settings.showComponentUpdates;

    settingsList.querySelector("#settings #reset").onclick = () => dialog.confirm(
        'Are you sure you want to clear all local stored data?',
        () => {
            delete localStorage.pwsData;
            window.onbeforeunload = undefined;
            location.reload()
        }
    );

    this.apply = () => {
        settings.scrollAnimation = scrollAnimationOption.checked;
        settings.zoomAnimation = zoomAnimationOption.checked;
        settings.showDebugInfo = showDebugInfoOption.checked;
        settings.showComponentUpdates = showComponentUpdatesOption.checked;
    }
}

