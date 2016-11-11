const tips = {
    dragging: document.querySelector(".tip#dragging"),
    connecting: document.querySelector(".tip#connecting")
}

for(let i in tips) {
    tips[i].show = function() {
        this.style.display = "block";
        setTimeout(() => {
            this.style.opacity = .9;

            (function animate() {
                tips[i].style.left = mouse.screen.x - tips[i].clientWidth / 2;
                tips[i].style.top = mouse.screen.y - tips[i].clientHeight - 20;

                if(tips[i].style.display == "block") requestAnimationFrame(animate);
            })();
        });
    }

    tips[i].hide = function() {
        this.style.opacity = 0;
        setTimeout(() => {
            this.style.display = "none";
        }, 500);
    }
}

setInterval(function() {
    if(dragging) {
        tips.dragging.show();
    } else {
        tips.dragging.hide();
    }

    if(connecting && connecting.wire.pos.length > 10) {
        setTimeout(() => {
            tips.connecting.show();
        }, 1000);
    } else {
        tips.connecting.hide();
    }
}, 500);