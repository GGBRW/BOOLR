const fs = require("fs");
const savesFolder = "../saves/";

let saves = [];

// Read save files from "saves" folder
const files = fs.readdirSync(savesFolder);

files.forEach(file => {
    saves.push({
        //name: JSON.parse(fs.readFileSync(savesFolder + file, "utf-8")).name || file,
        fileSize: fs.statSync(savesFolder + file).size,
        fileName: file,
        location: savesFolder + file
    });
});

function openSaveFile(file) {
    const saveFile = JSON.parse(fs.readFileSync(savesFolder + file, "utf-8"));
    if(!Array.isArray(saveFile)) {

    } else {
        const parsed = parse(saveFile);
        const clone = cloneSelection(parsed.components || [], parsed.wires || []);

        components = [];
        wires = [];
        redoStack = [];
        undoStack = [];

        addSelection(
            clone.components,
            clone.wires
        );
    }
}

function createSaveFile() {

}
