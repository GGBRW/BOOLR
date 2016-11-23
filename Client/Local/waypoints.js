let waypoints = [];

function setWaypoint(x,y) {
    waypoints.push({x,y});
    toolbar.message(`Waypoint set @ ${x}, ${y}`);
}

function gotoWaypoint(index) {
    if(!waypoints[index]) return;
    scroll(waypoints[index].x - mouse.grid.x, waypoints[index].y - mouse.grid.y);
    toolbar.message(`Jumped to waypoint ${index} at ${waypoints[index].x}, ${waypoints[index].y}`);
}