let hover = {
    components: [],

};

setInterval(function() {
    hover = [];
    if(!keys[32]) return;
    const component = find(mouse.grid.x,mouse.grid.y);

    if(component && component.hasOwnProperty("value")) {
        hover = [component];
        let x = component.pos.x; let y = component.pos.y;
        while(true) {
            x += component.width;

            const adjacent = find(x,y);
            if(!adjacent || !adjacent.hasOwnProperty("value")) break;
            else hover.push(adjacent);
        }

        x = component.pos.x; y = component.pos.y;
        while(true) {
            x -= component.width;

            const adjacent = find(x,y);
            if(!adjacent || !adjacent.hasOwnProperty("value")) break;
            else hover.unshift(adjacent);
        }
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
hoverBalloon.show = function() {

}