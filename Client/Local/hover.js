let hover = {
    components: [],
    time: 0
};

setInterval(function() {
    if(!keys[32]) {
      hover.components = [];
      hover.time = [];
      return;
    }

    const component = find(mouse.grid.x,mouse.grid.y);
    if(hover.components.includes(component)) return;

    hover.components = [];
    hover.time = [];

    if(component && component.hasOwnProperty("value")) {
        hover.components = [component];
        hover.time = 0;

        let hComponents = [component];
        let x = component.pos.x; let y = component.pos.y;
        while(true) {
            x += component.width;

            const adjacent = find(x,y);
            if(!adjacent || !adjacent.hasOwnProperty("value") || adjacent.constructor == Wire) break;
            else hComponents.push(adjacent);
        }

        x = component.pos.x; y = component.pos.y;
        while(true) {
            x -= component.width;

            const adjacent = find(x,y);
            if(!adjacent || !adjacent.hasOwnProperty("value") || adjacent.constructor == Wire) break;
            else hComponents.unshift(adjacent);
        }

        let vComponents = [component];
        x = component.pos.x; y = component.pos.y;
        while(true) {
            y -= component.height;

            const adjacent = find(x,y);
            if(!adjacent || !adjacent.hasOwnProperty("value") || adjacent.constructor == Wire) break;
            else vComponents.push(adjacent);
        }

        x = component.pos.x; y = component.pos.y;
        while(true) {
            y += component.height;

            const adjacent = find(x,y);
            if(!adjacent || !adjacent.hasOwnProperty("value") || adjacent.constructor == Wire) break;
            else vComponents.unshift(adjacent);
        }

        hover.components = hComponents.length > vComponents.length ? hComponents : vComponents;
    } else {
        if(hoverBalloon.style.display == "block") {
            hoverBalloon.style.opacity = 0;
            setTimeout(() => {
                hoverBalloon.style.display = "none";
            }, 200);
        }
    }
}, 500);

const hoverBalloon = document.getElementById("hoverBalloon");
hoverBalloon.show = function(value) {
  this.style.display = "block";
  this.innerHTML =
      `<span style="font-size: 30px; color: #888">${value}</span> <br>` +
      `0b${value.toString(2)} <br>` +
      `0x${value.toString(16).toUpperCase()} <br>` +
      `0${value.toString(8)} <br>`;
  this.style.top = mouse.screen.y - this.clientHeight - 50;
  this.style.left = mouse.screen.x - this.clientWidth / 2;
  setTimeout(() => this.style.opacity = 1);
}

hoverBalloon.hide = function() {
  hoverBalloon.style.opacity = 0;
  setTimeout(() => hoverBalloon.style.display = "none",200);
}
