function stringify() {
    let result = {
      components: [],
      connections: []
    }
    
    for(let i of components) {
        let component = [
            i.constructor.name, // Class
            {},                 // Params
            []                  // Connections
        ]
        
        // Params
        component[1] = Object.assign({}, i);
        
        // Connections
        if(i.input) {
          for(let input of i.input) {
            connections.push([components.indexOf(i),components.indexOf(input.to)]);
          }
        }
        
        string.push(component);
    }
    return JSON.stringify(string);
}

function parse(string) {
    string = JSON.parse(string);
    for(let i of string) {
        let component = eval("new " + i[0]);
        Object.assign(component,i[1]);
    }
}
