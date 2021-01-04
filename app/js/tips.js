const tips = {
    dragging: document.querySelector(".tip#dragging"),
    connecting_ctrl: document.querySelector(".tip#connecting_ctrl"),
    connecting_shift: document.querySelector(".tip#connecting_shift"),
    waypoints: document.querySelector(".tip#waypoints")
}

for(let i in tips) {
    tips[i].show = function() {
        if(this.style.display == "block") return;
        this.style.display = "block";
        setTimeout(() => {
            this.style.opacity = .9;

            (function animate() {
                tips[i].style.left = 20;/*
                    Math.max(
                        Math.min(
                            mouse.screen.x - tips[i].clientWidth / 2,
                            c.width - tips[i].clientWidth),
                        0
                    );*/
                tips[i].style.top = 20; /*
                    Math.max(
                        mouse.screen.y - tips[i].clientHeight - 20,
                        0
                    );*/

                if(tips[i].style.display == "block") requestAnimationFrame(animate);
            })();

            this.disabled = true;
        });

        setTimeout(() => {
            this.hide();
        }, 5000);
    }

    tips[i].hide = function() {
        if(this.style.display == "none") return;
        this.style.opacity = 0;
        setTimeout(() => {
            this.style.display = "none";
        }, 500);
    }
}

setInterval(function() {
    if(!tips.dragging.disabled && dragging) {
        tips.dragging.show();
    }

    if(connecting) {
        if(!tips.connecting_ctrl.disabled &&
           mouse.screen.x < 100 || mouse.screen.x > c.width - 100 ||
           mouse.screen.y < 100 || mouse.screen.y > c.height - 100) {
            tips.connecting_ctrl.show();
        } else if(!tips.connecting_shift.disabled) {
            const x = connecting.pos.slice(-8).map(n => n.x);
            const y = connecting.pos.slice(-8).map(n => n.y);
            if(x.join("") == x[0].toString().repeat(8) || y.join("") == y[0].toString().repeat(8)) {
                 tips.connecting_shift.show();
            }
        }
    }

    if(!tips.waypoints.disabled && Math.random() < .01) {
        tips.waypoints.show();
    }
}, 500);
