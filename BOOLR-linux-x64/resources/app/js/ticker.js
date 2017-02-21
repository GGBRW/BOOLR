let update_queue = [];
const delay = 20;

let tickrate = 50, lastTick = new Date;
function tick() {
    let start = new Date;
    while(update_queue.length && new Date - start < delay) {
        for(let i = 0, len = update_queue.length; i < len; ++i) {
            update_queue[0].update.call(update_queue[0].component);
            update_queue.splice(0,1);
        }
    }
    if(update_queue.length) console.log(update_queue);

    // Tickrate berekenen
    tickrate = 1000 / (new Date - lastTick);
    lastTick = new Date;

    setTimeout(tick,delay);
}