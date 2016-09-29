const componentInfo = document.getElementById("componentInfo");

componentInfo.show = function(component,pos) {
    this.style.top = pos.y - this.clientHeight - zoom / 2;
    this.style.left = pos.x - this.clientWidth / 2;

    this.innerHTML = `<h1>${ component.constructor.name }</h1>`;
    this.innerHTML += `<p>x: <span>${ component.pos.x }</span></p>`;
    this.innerHTML += `<p>y: <span>${ component.pos.y }</span></p>`;
    component.label != undefined && (this.innerHTML += `<p>label: <span>${ component.label }</span></p>`);
    component.value != undefined && (this.innerHTML += `<p>value: <span>${ component.value }</span></p>`);
    setTimeout(() => this.style.display = "block", 1);
}
componentInfo.hide = function() { this.style.display = "none" };
