let variables = {};
let variableReferences = {};

function setVariable(name,value) {
    name = (name.match(/[a-zA-Z'`´_-]+/g) || []) == name ? name : null;
    if(!name) throw "Invalid variable name";
    if(!value) throw "No value given for variable " + name;

    variables[name] = +value || value;

    if(variableReferences[name]) {
        for(let i = 0; i < variableReferences[name].length; ++i) {
            const reference = variableReferences[name][i];
            let obj = findComponentByID(reference.id) || findWireByID(reference.id) || findPortByID(reference.id);
            if(!obj) {
                variableReferences[name].splice(i, 1);
                continue;
            }

            for(let j = 0; j < reference.property.length - 1; ++j) {
                obj = obj[reference.property[j]];
            }

            if(!obj) {
                variableReferences[name].splice(i, 1);
                continue;
            }

            obj[reference.property.slice(-1)[0]] = parseVariableInput(reference.str);
            console.log(obj,obj[reference.property.slice(-1)[0]]);
        }
    }

    return value;
}

function getVariable(name) {
    name = (name.match(/[a-zA-Z'`´_-]+/g) || []) == name ? name : null;
    if(!name) throw "Invalid variable name";
    return variables[name];
}

function parseVariableInput(str) {
    str = str + "";
    const vars = str.match(/[a-zA-Z'`´_-]+/g) || [];
    str = str.replace(
        /[a-zA-Z'`´_-]+/g,
        "variables['$&']"
    );

    const value = eval(str);
    if(isNaN(value)) return;

    return value;
}

function createVariableReference(str,component,property) {
    const vars = str.match(/[a-zA-Z'`´_-]+/g) || [];
    for(let i = 0; i < vars.length; ++i) {
        if(!variableReferences[vars[i]]) variableReferences[vars[i]] = [];
        variableReferences[vars[i]].push({
            id: component.id,
            property,
            str
        });
    }
}