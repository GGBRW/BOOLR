// I'm sorry for the mess

(function() {
    function createInput(
        component,
        property,
        value,
        valid,
        errormsg,
        apply) {
        const input = document.createElement("input");
        input.value = value;

        input.valid = valid;
        input.errormsg = errormsg;
        input.apply = apply;

        dialog.container.appendChild(document.createTextNode(property.slice(0,1).toUpperCase() + property.slice(1) + ":"));
        dialog.container.appendChild(input);
        dialog.container.appendChild(document.createElement("br"));
        return input;
    }

    dialog.editComponent = function(component) {
        dialog.show();
        dialog.name.innerHTML = "Edit component";
        dialog.container.innerHTML += "<p class='material-icons' style='font-size: 60px; margin: 10px'>edit<p>";

        const name = createInput(
            component, "name", component.name,
            name => name.length > 0 && name.length < 12,
            "Enter a name between 0 and 12 characters",
            function() {
                edit(component,"name",this.value,true);
            }
        );
        setTimeout(() => name.focus(), 10);

        const pos = createInput(
            component, "pos", component.pos.x + "," + component.pos.y,
            pos => (pos.match(/-?\d+\s*\,\s*-?\d+/g) || [])[0] == pos,
            "Enter a value for x and y separated by a comma",
            function() {
                const pos = this.value.split(",").map(n => +n);
                component.pos.x = pos[0];
                component.pos.t = pos[1];
            }
        );
        const width = createInput(
            component, "width", component.width,
            width => width > 0 && 2 * (+width + component.height) >= component.input.length + component.output.length,
            "The component must be wider for the ports to fit",
            function() {
                changeSize(component,+this.value,undefined,true);
            }
        );
        const height = createInput(
            component, "height", component.height,
            height => {
                height = parseVariableInput(height);
                if(isNaN(height)) return false;
                return height > 0 && 2 * (+height + component.width) >= component.input.length + component.output.length
            },
            "The component must be higher for the ports to fit",
            function() {
                changeSize(component,undefined, parseVariableInput(+this.value), true);
            }
        );

        const inputs = [name,pos,width,height];

        // Additional properties:

        if(component.properties.hasOwnProperty("delay")) {
            inputs.push(
                createInput(
                    component.properties, "delay", component.properties.delay || "",
                    delay => !isNaN(parseVariableInput(delay)),
                    "Enter a positive delay time in milliseconds",
                    function() {
                        component.properties.delay = parseVariableInput(this.value);
                        createVariableReference(this.value,component,["properties","delay"]);
                    }
                )
            );
            dialog.container.removeChild(dialog.container.children[dialog.container.children.length - 1]);
            dialog.container.appendChild(document.createTextNode("ms"));
            dialog.container.appendChild(document.createElement("br"));
        }

        if(component.properties.hasOwnProperty("frequency")) {
            inputs.push(
                createInput(
                    component.properties, "frequency", component.properties.frequency,
                    frequency => +frequency > 0,
                    "Enter a positive frequency value in Hz",
                    function() {
                        component.properties.frequency = +this.value;
                    }
                )
            );
            dialog.container.removeChild(dialog.container.children[dialog.container.children.length - 1]);
            dialog.container.appendChild(document.createTextNode("Hz"));
            dialog.container.appendChild(document.createElement("br"));
        }

        if(component.properties.hasOwnProperty("duration")) {
            inputs.push(
                createInput(
                    component.properties, "duration", component.properties.duration,
                    frequency => +frequency > 0,
                    "Enter a positive duration time in ms",
                    function() {
                        component.properties.duration = +this.value;
                    }
                )
            );
            dialog.container.removeChild(dialog.container.children[dialog.container.children.length - 1]);
            dialog.container.appendChild(document.createTextNode("ms"));
            dialog.container.appendChild(document.createElement("br"));
        }

        const errormsg = document.createElement("p");
        errormsg.className = "errormsg";
        errormsg.innerHTML = ".";
        errormsg.hide = null;
        errormsg.show = function(text) {
            clearTimeout(this.hide);
            this.innerHTML = text;
            this.style.opacity = 1;
            this.hide = setTimeout(() => this.style.opacity = 0, 2500);
        }
        dialog.container.appendChild(errormsg);

        dialog.addOption("Cancel");
        dialog.addOption("OK",  function() {
            for(let i = 0; i < inputs.length; ++i) {
                const input = inputs[i];
                input.className = "";

                if(!input.valid(input.value)) {
                    input.className = "error";
                    errormsg.show(input.errormsg);

                    this.onmouseup = () => this.onmouseup = dialog.hide;
                    return;
                }
            }

            for(let i = 0; i < inputs.length; ++i) {
                inputs[i].apply();
            }
        });
    }

    dialog.editPort = function(port) {
        dialog.show();
        dialog.name.innerHTML = "Edit port";
        dialog.container.innerHTML += "<p class='material-icons' style='font-size: 60px; margin: 10px'>edit<p>";

        const name = createInput(
            port, "name", port.name || "",
            name => name.length < 12,
            "Enter a name between 0 and 12 characters",
            function() {
                edit(port,"name",this.value);
            }
        );
        setTimeout(() => name.focus(), 10);

        const side = createInput(
            port.pos, "side", port.pos.side,
            side => +side >= 0 && +side <= 3,
            "Enter the number of a side, a number between 0 and 3",
            function() {
                movePort(port,+this.value,port.pos.pos);
            }
        );

        const pos = createInput(
            port.pos, "pos", port.pos.pos,
            pos => side.valid(side.value) && +pos >= 0 && +pos < (+side.value % 2 == 0 ? port.component.width: port.component.height) && !findPortByComponent(port.component,+side.value,+pos),
            "Enter a (free) position for the port, a number between 0 and the width/height of the component",
            function() {
                movePort(port,port.pos.side,+this.value);
            }
        );

        const inputs = [name,side,pos];

        const errormsg = document.createElement("p");
        errormsg.className = "errormsg";
        errormsg.innerHTML = ".";
        errormsg.hide = null;
        errormsg.show = function(text) {
            clearTimeout(this.hide);
            this.innerHTML = text;
            this.style.opacity = 1;
            this.hide = setTimeout(() => this.style.opacity = 0, 2500);
        }
        dialog.container.appendChild(errormsg);

        dialog.addOption("Cancel");
        dialog.addOption("OK",  function() {
            for(let i = 0; i < inputs.length; ++i) {
                const input = inputs[i];
                input.className = "";

                if(!input.valid(input.value)) {
                    input.className = "error";
                    errormsg.show(input.errormsg);

                    this.onmouseup = () => this.onmouseup = dialog.hide;
                    return;
                }
            }

            for(let i = 0; i < inputs.length; ++i) {
                inputs[i].apply();
            }
        });
    }

    dialog.editDelay = function(component,callback) {
        if(!component) return;
        dialog.show();
        dialog.name.innerHTML = "Edit delay";
        dialog.container.innerHTML += "<i class='material-icons' style='font-size: 60px'>access_time<i>";
        dialog.container.innerHTML += `<p>Enter a delay time in ms for component <i>${component.name}</i></p>`;


        const input = createInput(
            component.properties, "delay", component.properties.delay || "",
            delay => !isNaN(parseVariableInput(delay)),
            "Enter a positive delay time in milliseconds",
            function() {
                component.properties.delay = parseVariableInput(this.value);
                createVariableReference(this.value,component,["properties","delay"]);
            }
        );
        setTimeout(() => input.focus(),10);
        dialog.container.removeChild(dialog.container.children[dialog.container.children.length - 1]);
        dialog.container.appendChild(document.createTextNode("ms"));

        const errormsg = document.createElement("p");
        errormsg.className = "errormsg";
        errormsg.innerHTML = ".";
        errormsg.hide = null;
        errormsg.show = function(text) {
            clearTimeout(this.hide);
            this.innerHTML = text;
            this.style.opacity = 1;
            this.hide = setTimeout(() => this.style.opacity = 0, 2500);
        }
        dialog.container.appendChild(errormsg);

        dialog.addOption("Cancel", function() {
            if(!component.properties.delay) {
                component.properties.delay = 1000;
                callback && callback();
            }
        });
        dialog.addOption("OK",  function() {
            if(input.valid(input.value)) {
                input.apply();
                callback && callback();
            } else {
                input.className = "error";
                errormsg.show(input.errormsg);
                this.onmouseup = () => this.onmouseup = dialog.hide;
            }
        });
    }
})();