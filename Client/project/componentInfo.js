const componentInfo = document.getElementById("componentInfo");
componentInfo.expanded = false;

componentInfo.show = function(component,pos) {
    this.innerHTML = `<h1>${ component.name }</h1>`;
    this.innerHTML += `${ component.constructor.name }<br>`;
    this.innerHTML += `x: ${ component.pos.x }, y: ${ component.pos.y }<br>`;

    if(!this.expanded) {
        this.innerHTML +=
            "<span style='font-size: 12px; color: #444; margin-top: 10px'>Press tab for more details</span>";
    } else {
        for(let i in component) {
            this.innerHTML += `${i}: ${component[i]}<br>`;
        }
    }

    this.style.top = pos.y - this.clientHeight - zoom / 2;
    this.style.left = pos.x - this.clientWidth / 2;

    setTimeout(() => {
        this.style.display = "block";
        setTimeout(() => {
            this.style.transform = "translateY(0px)";
            this.style.opacity = 1;
        }, 100);
    });
}
componentInfo.hide = function() {
    componentInfo.expanded = false;

    this.style.transform = "translateY(20px)";
    this.style.opacity = 0;
    setTimeout(() => this.style.display = "none",100);
};
