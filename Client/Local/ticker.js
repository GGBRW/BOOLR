let update_queue = [];
const delay = 17;

function tick() {
    let start = new Date;
    while(update_queue.length && new Date - start < delay) {
        for(let i = 0, len = update_queue.length; i < len; ++i) {
            update_queue[0].update.call(update_queue[0].component);
            update_queue.splice(0,1);
        }
    }
    if(update_queue.length) console.log(update_queue);

    requestAnimationFrame(tick);
}

// setInterval(tick, delay);