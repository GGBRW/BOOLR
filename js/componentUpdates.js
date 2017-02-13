var updateQueue = [];

let lastTick = new Date;
let ticksPerSecond = 0;

function tick() {
    const start = new Date;
    let updates = 0;
    while(updateQueue.length > 0 && new Date - start < 17) {
        const update = updateQueue.splice(0,1)[0];
        update();

        ++updates;
    }

    ticksPerSecond = 1000 / (new Date - lastTick);
    lastTick = new Date;

    setTimeout(tick);
}

tick();
