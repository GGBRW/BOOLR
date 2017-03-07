let savedCustomComponents = [];

function saveCustomComponent(component) {
    const clone = cloneComponent(component);
    clone.name = component.name;
    savedCustomComponents.push(clone);
    toolbar.message("Saved component " + component.name);
}

function saveCustomComponents() {
    const stringified = stringify(savedCustomComponents);
    fs.writeFileSync(
        __dirname + "/../data/customcomponents.json",
        stringified,
        "utf-8"
    );
}

function getCustomComponents() {
    const data = fs.readFileSync(
        __dirname + "/../data/customcomponents.json",
        "utf-8"
    );

    savedCustomComponents = parse(data).components;
}

