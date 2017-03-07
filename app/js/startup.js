"use strict";

setTimeout(() => {
    // parse localstorage
    getLocalStorage(localStorage.pwsData);
    getCustomComponents();

    readSaveFiles();
    updateDebugInfo();
    setInterval(updateDebugInfo, 500);
    draw();

    loading.style.display = "none";

    const buttons = mainMenu.querySelectorAll(".main-menu > button");
    for(let i of buttons) {
        i.style.top = 0;
        i.style.opacity = 1;
        i.style.transform = "translateX(0px)";

        i.querySelector(".material-icons").style.transform = "translateX(0px)";
    }
});