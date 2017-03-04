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
    mainMenu.hide();
});