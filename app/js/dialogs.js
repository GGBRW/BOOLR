const overlay = document.getElementById("over");
const dialog = document.getElementById("dialog");
dialog.name = document.querySelector("#dialog h1");
dialog.container = document.querySelector("#dialog .container");
dialog.options = document.querySelector("#dialog .options");

dialog.show = function() {
    this.container.innerHTML = "";
    this.options.innerHTML = "";
    hoverBalloon.style.display = "none";

    overlay.style.display = "block";
    overlay.style.pointerEvents = "auto";
    setTimeout(() => overlay.style.opacity = .8, 10);

    dialog.style.display = "block";
    setTimeout(() => {
        dialog.focus();
        dialog.style.opacity = 1;
        dialog.style.transform = "scale(1)";
        dialog.style.top = "16%";
    },10);
}

dialog.hide = function() {
    overlay.style.opacity = 0;
    overlay.style.pointerEvents = "none";
    setTimeout(() => {
        if(overlay.style.opacity == "0") {
            overlay.style.display = "none";
        }
    }, 500);

    dialog.style.opacity = 0;
    dialog.style.top = "100%";
    setTimeout(() => {
        if(dialog.style.opacity == "0") {
            dialog.style.display = "none";
        }
    }, 200);

    c.focus();
}

dialog.addOption = function(text,onclick) {
    const button = document.createElement("button");
    button.innerHTML = text;
    button.onmousedown = onclick;
    button.onmouseup = dialog.hide;
    dialog.options.appendChild(button);
}

dialog.onkeydown = function(e) {
    if(e.which == 13) {         // Enter
        dialog.options.children[dialog.options.children.length - 1].onmousedown();
        dialog.options.children[dialog.options.children.length - 1].onmouseup();
    } else if(e.which == 27) {  // Esc.
        this.hide();
    }
}

dialog.welcome = function(component) {
    dialog.show();
    dialog.name.innerHTML = "Welcome";

    dialog.container.innerHTML += "<i class='material-icons' style='font-size: 120px'>memory<i>";
    dialog.container.innerHTML += "<p>Welcome to <span style='font-family: Righteous; font-size: 24px;'>BOOLR</span> !</p>";
    dialog.container.innerHTML += "<p>If i'm right this is the first time you are using BOOLR.</p>";
    dialog.container.innerHTML += "<p>Need a tutorial to learn how everything works?</p>";
    dialog.addOption("Yes please!", () => tutorial.show());
    dialog.addOption("No, just start");
}

dialog.createBoard = function() {
    dialog.show();
    dialog.name.innerHTML = "Create save file";

    dialog.container.innerHTML += "<i class='material-icons' style='font-size: 120px'>save<i>";
    dialog.container.innerHTML += "<p>This board doesn't have a save file yet. Want to create one?</p>";

    dialog.container.appendChild(document.createTextNode("Name: "));
    const name = document.createElement("input");
    dialog.container.appendChild(name);
    setTimeout(() => name.focus(),10);

    dialog.addOption("Cancel");
    dialog.addOption("OK",  () => {
        createSaveFile(name.value);
    });
}

dialog.editBoard = function(save) {
    dialog.show();
    dialog.name.innerHTML = "Edit board";

    dialog.container.appendChild(document.createTextNode("Board name: "));
    const boardName = document.createElement("input");
    boardName.value = save.name;
    dialog.container.appendChild(boardName);
    setTimeout(() => boardName.focus(),10);
    dialog.container.appendChild(document.createElement("br"));

    dialog.container.appendChild(document.createTextNode("File name: "));
    const fileName = document.createElement("input");
    fileName.value = save.fileName.slice(0,save.fileName.indexOf(".board"));
    dialog.container.appendChild(fileName);
    dialog.container.appendChild(document.createTextNode(".board"));

    dialog.addOption("Cancel");
    dialog.addOption("OK",  () => {
        if(boardName.value != save.name && boardName.value.length > 0 && boardName.value.length < 100) {
            save.name = boardName.value;

            const content = JSON.parse(fs.readFileSync(savesFolder + save.fileName));
            content.name = boardName.value;
            fs.writeFile(
                savesFolder + save.fileName,
                JSON.stringify(content),
                "utf-8"
            );
        }

        if(fileName.value + ".board" != save.fileName) {
            const newFileName = createFileName(fileName.value);
            fs.rename(
                savesFolder + save.fileName,
                savesFolder + newFileName
            );
            save.fileName = newFileName;
        }

        openBoardMenu.onopen();
    });
}

dialog.update = function(component) {
    dialog.show();
    dialog.name.innerHTML = "Update " + VERSION;

    dialog.container.innerHTML += "<i class='material-icons' style='font-size: 60px'>update<i>";
    dialog.container.innerHTML += "<p>What's new:</p>";
    dialog.container.innerHTML +=
        "<ul style='width: 200px;'>" +
        "<li>Tutorial</li>" +
        "<li>New main menu</li>" +
        "<li>New edit menu</li>" +
        "</ul>";
    dialog.addOption("Close");
}

dialog.openBoard = function() {
    dialog.show();
    dialog.name.innerHTML = "Open board";

    dialog.container.innerHTML += "<i class='material-icons' style='font-size: 60px'>insert_drive_file<i>";

    const openboard = document.getElementById("openboard").cloneNode(true);
    openboard.style.display = "block";
    dialog.container.appendChild(openboard);

    dialog.addOption("Cancel");
}

dialog.connectToServer = function() {
    dialog.show();
    dialog.name.innerHTML = "Connect to server";

    dialog.container.innerHTML += "<i class='material-icons' style='font-size: 60px'>dns<i>";

    dialog.container.innerHTML += "<p>There are no public servers available.</p>";

    dialog.container.appendChild(document.createTextNode("Server URL: "));
    const url = document.createElement("input");
    dialog.container.appendChild(url);
    setTimeout(() => url.focus(),10);
    dialog.container.appendChild(document.createElement("br"));

    const msg = document.createElement("p");
    msg.show = function(text) {
        this.innerHTML = text;
        this.style.opacity = 1;
    }
    dialog.container.appendChild(msg);

    dialog.addOption("Cancel");
    dialog.addOption("Connect", function() {
        msg.show("Connecting...");
        connectToSocket(url.value, connected => {
            if(connected) {
                dialog.hide()
            } else {
                msg.className = "errormsg";
                msg.show("Could not connect to '" + url.value + "'");
            }
        });
        this.onmouseup = () => undefined;
    });
}

dialog.connections = function(component) {
    dialog.show();
    dialog.name.innerHTML = "Connections";

    const input = document.createElement("ul");
    for(let i = 0; i < component.input.length; ++i) {
        const cons = component.input[i].connection;

        if (cons) {
            for (let wire of cons) {
                wire && (function getInputs(wire) {
                    if(wire.from) {
                        const li = document.createElement("li");
                        li.innerHTML = wire.from.component.name;
                        input.appendChild(li);
                    }
                    for(let i = 0; i < wire.input.length; ++i) {
                        getInputs(wire.input[i]);
                    }
                })(wire);
            }
        }
    }

    const output = document.createElement("ul");
    for(let i = 0; i < component.output.length; ++i) {
        const cons = component.output[i].connection;

        if (cons) {
            for (let wire of cons) {
                wire && (function getOutputs(wire) {
                    if(wire.to) {
                        const li = document.createElement("li");
                        li.innerHTML = wire.to.component.name;
                        output.appendChild(li);
                    }
                    for(let i = 0; i < wire.output.length; ++i) {
                        getOutputs(wire.output[i]);
                    }
                })(wire);
            }
        }
    }

    const connections = input.children.length + output.children.length;
    dialog.container.innerHTML += `${component.name} has ${connections} connection${connections == 1 ? "" : "s"}. <br><br>`;

    if(input.children.length > 0) {
        dialog.container.innerHTML += `${input.children.length} connection${input.children.length == 1 ? "" : "s"} from:`;
        dialog.container.appendChild(input);
    }

    if(output.children.length > 0) {
        dialog.container.innerHTML += `${output.children.length} connection${output.children.length == 1 ? "" : "s"} to:`;
        dialog.container.appendChild(output);
    }

    dialog.addOption("Close");
}

dialog.truthTable = function(type) {
    dialog.show();
    dialog.name.innerHTML = type.name + " gate";

    const component = new type();

    dialog.container.innerHTML += "<span style='font-size: 50px; padding: 50px'>" + component.icon.text + "</span><br>";
    dialog.container.innerHTML += "<p>Truth table:</p>";

    // Create truth table
    const table = document.createElement("table");
    table.className = "truthtable";
    dialog.container.appendChild(table);

    const length = Math.pow(2,component.input.length);

    const tr = document.createElement("tr");
    const inputTh = document.createElement("th");
    inputTh.innerHTML = "Input";
    inputTh.colSpan = component.input.length;
    tr.appendChild(inputTh);
    const outputTh = document.createElement("th");
    outputTh.innerHTML = "Output";
    outputTh.colSpan = component.output.length;
    tr.appendChild(outputTh);
    table.appendChild(tr);


    for(let i = 0; i < length; ++i) {
        const tr = document.createElement("tr");
        const input = ("0".repeat(component.input.length) + i.toString(2)).slice(-component.input.length);
        for(let i = 0; i < input.length; ++i) {
            component.input[i].value = +input[i];
        }
        component.update();

        for(let i = 0; i < input.length; ++i) {
            const td = document.createElement("td");
            td.innerHTML = input[i];
            tr.appendChild(td);
        }
        for(let i = 0; i < component.output.length; ++i) {
            const td = document.createElement("td");
            td.innerHTML = component.output[i].value;
            tr.appendChild(td);
        }

        table.appendChild(tr);
    }

    dialog.addOption("Close");
}

dialog.settings = function(component) {
    dialog.show();
    dialog.name.innerHTML = "Settings";

    dialog.container.innerHTML += "<i class='material-icons' style='font-size: 60px'>settings<i>";

    const settingsList = document.getElementById("settings").cloneNode(true);
    settingsList.style.display = "block";
    dialog.container.appendChild(settingsList);

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

    dialog.addOption("Cancel");
    dialog.addOption("OK", () => {
        settings.scrollAnimation = scrollAnimationOption.checked;
        settings.zoomAnimation = zoomAnimationOption.checked;
        settings.showDebugInfo = showDebugInfoOption.checked;
        settings.showComponentUpdates = showComponentUpdatesOption.checked;
    });
}

dialog.confirm = function(text,callback) {
    dialog.show();
    dialog.name.innerHTML = "Confirm";
    dialog.container.innerHTML += "<i class='material-icons' style='font-size: 60px'>?<i>";
    dialog.container.innerHTML += "<p>" + text + "</p>";

    dialog.addOption("Cancel");
    dialog.addOption("OK", callback);
}

dialog.warning = function(text) {
    dialog.show();
    dialog.name.innerHTML = "Warning";
    dialog.container.innerHTML += "<i class='material-icons' style='font-size: 60px'>warning<i>";
    dialog.container.innerHTML += "<p>" + text + "</p>";

    dialog.addOption("OK");
}

dialog.localStorageError = function() {
    dialog.show();
    dialog.name.innerHTML = "localStorage not available";
    dialog.container.innerHTML += "<i class='material-icons' style='font-size: 60px'>warning<i>";
    dialog.container.innerHTML += "<p>Your browser doesn't allow this application to store data locally. " +
        "BOOLR uses localStorage to store clipbord data, settings, etc. " +
        "Either you have disabled localStorage in your browser's settings or your browser is too old.</p>";

    dialog.addOption("OK");
}

// dialog.edit = function(component) {
//     if(!component) return;
//     dialog.show();
//     dialog.name.innerHTML = "Edit";
//
//     const properties = ["name",...Object.keys(component.properties)];
//     const inputs = [];
//
//     // Name
//     const name = document.createElement("input");
//     inputs.push(name);
//     name.value = component.name;
//
//     dialog.container.appendChild(document.createTextNode("Name:"));
//     dialog.container.appendChild(name);
//     dialog.container.appendChild(document.createElement("br"));
//
//     for(let i in component.properties) {
//         const input = document.createElement("input");
//         inputs.push(input);
//         input.value = component.properties[i];
//
//         dialog.container.appendChild(document.createTextNode(i.slice(0,1).toUpperCase() + i.slice(1) + ":"));
//         dialog.container.appendChild(input);
//
//         if(i == "duration" || i == "delay") {
//             dialog.container.appendChild(document.createTextNode("ms"));
//         } else if(i == "frequency") {
//             dialog.container.appendChild(document.createTextNode("Hz"));
//         }
//         dialog.container.appendChild(document.createElement("br"));
//     }
//
//     dialog.addOption("Cancel");
//     dialog.addOption("OK",  () => {
//         for(let i in component.properties) {
//             component.properties[i] = inputs[Object.keys(component.properties).indexOf(i) + 1].value;
//         }
//     });
// }

dialog.editName = function(component) {
    if(!component) return;
    dialog.show();
    dialog.name.innerHTML = "Edit name";
    dialog.container.innerHTML += `<p>Enter a new name for component <i>${component.name}</i></p>`;
    const input = document.createElement("input");
    dialog.container.appendChild(input);
    setTimeout(() => input.focus(),10);

    dialog.addOption("Cancel");
    dialog.addOption("OK",  () => {
        if(input.value.length > 0 && input.value.length < 16) {
            edit(component,"name",input.value,true);
        }
    });
}

dialog.colorPicker = function(callback = a => a) {
    dialog.show();
    dialog.name.innerHTML = "Color Picker";
    dialog.container.innerHTML += "<i class='material-icons' style='font-size: 60px'>color_lens<i>";
    dialog.container.innerHTML += `<p>Pick a color:</p>`;

    const el = document.createElement("div");
    el.style.width = 70;
    el.style.height = 50;
    el.style.display = "inline-block";
    el.style.margin = 10;
    el.onclick = function() {
        callback(this.style.background.match(/\d+/g).map(n => +n));
        dialog.hide()
    }

    const colors = [
        "#f33","#37f","#5b5","#ff5",
        "#f90","#60f","#0fc","#f0f",
        "#222","#555","#888","#ddd"];
    for(let i = 0; i < colors.length; ++i) {
        const color = el.cloneNode();
        color.style.background = colors[i];
        color.onclick = el.onclick;
        dialog.container.appendChild(color);
    }

    dialog.addOption("Cancel");
}

dialog.editPort = function(port) {
    if(!port) return;
    dialog.show();
    dialog.name.innerHTML = "Edit port " + (port.name || "");

    dialog.container.appendChild(
        document.createTextNode("Name: ")
    );
    const name = document.createElement("input");
    dialog.container.appendChild(name);
    name.value = port.name || "";
    setTimeout(() => name.focus(),10);
    dialog.container.appendChild(document.createElement("br"));


    const from = document.createElement("p");
    from.innerHTML = "From: " + port.component.name;
    dialog.container.appendChild(from);

    const portType = document.createElement("p");
    portType.innerHTML = "Port type: " + port.type;
    dialog.container.appendChild(portType);

    const portId = document.createElement("p");
    portId.innerHTML = "ID: " + port.id;
    dialog.container.appendChild(portId);

    const position = document.createElement("p");
    position.innerHTML = "Position: " + port.pos;
    dialog.container.appendChild(position);

    const deleteConnection = document.createElement("button");
    if (port.connection && port.connection.length > 1) { 
        deleteConnection.innerHTML = "Delete connections";
    } else {
        console.log(port.connection)
        deleteConnection.innerHTML = "Delete connection";
    }
    deleteConnection.style.background = "#600";
    deleteConnection.onclick = () => {
        if (port.connection) {
            while (port.connection.length) {
                let wire = port.connection[0];
                removeWire(wire);
            }
        }
    }
    dialog.container.appendChild(deleteConnection);

    dialog.container.appendChild(document.createElement("br"));

    dialog.addOption("Cancel");
    dialog.addOption("OK",  () => {
        if(name.value.length > 0 && name.value.length < 20) port.name = name.value;
    });
}

dialog.editCustom = function(component) {
    if(!component) return;
    dialog.show();
    dialog.name.innerHTML = "Edit " + component.name;

    dialog.container.appendChild(
        document.createTextNode("Name: ")
    );
    const name = document.createElement("input");
    dialog.container.appendChild(name);
    name.value = component.name;

    dialog.container.appendChild(document.createElement("br"));

    dialog.container.appendChild(
        document.createTextNode("Description (optional): ")
    );
    const description = document.createElement("input");
    dialog.container.appendChild(description);
    description.value = component.properties.description;

    dialog.container.appendChild(document.createElement("br"));

    dialog.container.appendChild(
        document.createTextNode("Width: ")
    );
    const width = document.createElement("input");
    dialog.container.appendChild(width);
    width.value = component.width;

    dialog.container.appendChild(document.createElement("br"));

    dialog.container.appendChild(
        document.createTextNode("Height: ")
    );
    const height = document.createElement("input");
    dialog.container.appendChild(height);
    height.value = component.height;


    dialog.addOption("Cancel");
    dialog.addOption("OK",  () => {
        if(name.value.length > 0 && name.value.length < 20) component.name = name.value;
        if(description.value.length > 0) component.properties.description = description.value;
        if(+width.value > 1) component.width = +width.value;
        if(+height.value > 1) component.height = +height.value;
    });
}

dialog.savedCustomComponents = function() {
    dialog.show();
    dialog.name.innerHTML = "Saved components";

    const list = document.createElement("ul");
    list.style.listStyle = "none";
    list.style.margin = 0;
    list.style.padding = 0;

    for(let i = 0; i < savedCustomComponents.length; ++i) {
        const component = savedCustomComponents[i];

        const li = document.createElement("li");
        li.component = component;
        li.innerHTML = component.name;
        li.onclick = function() {
            select(
                class {
                    constructor() {
                        return cloneComponent(
                            component,
                            mouse.grid.x - component.pos.x,
                            mouse.grid.y - component.pos.y
                        )
                    }
                }
            );
            dialog.hide();
        }

        // Remove board button
        const removeBtn = document.createElement("i");
        removeBtn.className = "material-icons";
        removeBtn.title = "Remove component";
        removeBtn.innerHTML = "delete";
        removeBtn.onclick = function(e) {
            const index = savedCustomComponents.indexOf(component);
            index > -1 && savedCustomComponents.splice(index,1);

            dialog.savedCustomComponents();
            e.stopPropagation();
        }
        li.appendChild(removeBtn);

        list.appendChild(li);
    }

    if(!savedCustomComponents || savedCustomComponents.length == 0) {
        dialog.container.innerHTML = "<p>You have no saved custom components.</p>";
    } else {
        dialog.container.appendChild(list);
    }

    dialog.addOption("Close");
}

dialog.save = function(text) {
    dialog.show();
    dialog.name.innerHTML = "Save board";
    dialog.container.innerHTML += "<i class='material-icons' style='font-size: 60px'>save<i>";
    dialog.container.innerHTML += "<p>This board will be saved as a .board file</p>";
    dialog.container.innerHTML += "Name: ";

    let input = document.createElement("input");
    input.setAttribute("placeholder","BOOLR-Save-" + new Date().toLocaleString());
    dialog.container.appendChild(input);
    setTimeout(() => input.focus());

    dialog.container.innerHTML += "<span>.board</span>";
    input = document.querySelector("#dialog input");

    dialog.addOption("Cancel");
    dialog.addOption("OK", () => {
        saveBoard(input.value);
    });
}
