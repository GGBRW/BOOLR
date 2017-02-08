const customComponentToolbar = document.getElementById("customComponentToolbar");
customComponentToolbar.querySelector(".close").onmouseup = () => customComponentToolbar.hide();

customComponentToolbar.show = function(name,close) {
    customComponentToolbar.style.display = "block";

    customComponentToolbar.querySelector("#name").innerHTML = name;
    customComponentToolbar.querySelector(".close").onclick = close;

    setTimeout(() => {
        customComponentToolbar.style.top = 0;
    }, 10);
}

customComponentToolbar.hide = function() {
    customComponentToolbar.style.top = -50;
    setTimeout(() => {
        customComponentToolbar.style.display = "none";
    }, 200);
}
