let nodes = document.querySelectorAll(".prompt #ok");
for(let i = 0; i < nodes.length; ++i) {
    nodes[i].onclick = () => {
        document.getElementById("overlay").style.display = "none";
        nodes[i].parentNode.style.display = "none";
    }
}

let prompt = {
    whatsnew: document.getElementById("whatsnew")
}

for(let i in prompt) {
    prompt[i].show = function() { this.style.display = "block"; document.getElementById("overlay").style.display = "block" }
}

