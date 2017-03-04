let savedCustomComponents = [];

function saveCustomComponent(component) {
    savedCustomComponents.push(component);
    toolbar.message("Saved component " + component.name);
}

function saveCustomComponents() {
    const stringified = stringify(savedCustomComponents);
    fs.writeFileSync(
        "../data/customcomponents.json",
        stringified,
        "utf-8"
    );
}

function getCustomComponents() {
    const data = fs.readFileSync(
        "../data/customcomponents.json",
        "utf-8"
    );

    savedCustomComponents = parse(data).components;
}

