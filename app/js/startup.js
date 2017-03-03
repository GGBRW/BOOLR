"use strict";

setTimeout(() => {
    // parse localstorage
    getLocalStorage(localStorage.pwsData);

    readSaveFiles();
    updateDebugInfo();
    setInterval(updateDebugInfo, 500);
    draw();

    loading.style.display = "none";
    mainMenu.show();
});