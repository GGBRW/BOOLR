const componentInfo = document.getElementById("componentInfo");

function showComponentInfo(component,pos) {
    componentInfo.style.top = pos.y - componentInfo.clientHeight - zoom / 2;
    componentInfo.style.left = pos.x - componentInfo.clientWidth / 2;

    componentInfo.innerHTML = `<h1>${ component.constructor.name }</h1>`;
    componentInfo.innerHTML += `<p>x: <span>${ component.pos.x }</span></p>`;
    componentInfo.innerHTML += `<p>y: <span>${ component.pos.y }</span></p>`;
    component.label != undefined && (componentInfo.innerHTML += `<p>label: <span>${ component.label }</span></p>`);
    component.value != undefined && (componentInfo.innerHTML += `<p>value: <span>${ component.value }</span></p>`);
    setTimeout(() => componentInfo.style.display = "block", 1);
}
