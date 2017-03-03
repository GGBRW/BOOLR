const tutorial = document.querySelector(".tutorial");

tutorial.sections = tutorial.querySelectorAll(".sections div");
tutorial.sectionIndex = 0;

tutorial.querySelector(".index").innerHTML = (tutorial.sectionIndex + 1) + "/" + tutorial.sections.length;

tutorial.nextBtn = tutorial.querySelector(".next");
tutorial.nextBtn.onclick = function() {
    const previousSection = tutorial.sections[tutorial.sectionIndex];
    previousSection.style.display = "none";
    ++tutorial.sectionIndex;
    tutorial.sections[tutorial.sectionIndex].style.display = "block";

    tutorial.querySelector(".index").innerHTML = (tutorial.sectionIndex + 1) + "/" + tutorial.sections.length;

    tutorial.previousBtn.disabled = false;
    if(tutorial.sectionIndex >= tutorial.sections.length - 1) {
        this.disabled = true;
    }
}

tutorial.previousBtn = tutorial.querySelector(".previous");
tutorial.previousBtn.onclick = function() {
    tutorial.sections[tutorial.sectionIndex].style.display = "none";
    --tutorial.sectionIndex;
    tutorial.sections[tutorial.sectionIndex].style.display = "block";

    tutorial.querySelector(".index").innerHTML = (tutorial.sectionIndex + 1) + "/" + tutorial.sections.length;

    tutorial.nextBtn.disabled = false;
    if(tutorial.sectionIndex < 1) {
        this.disabled = true;
    }
}

tutorial.show = function() {
    this.style.display = "block";
    setTimeout(() => {
        this.style.opacity = 1;
        this.style.left = 0;
    }, 10);
}

tutorial.hide = function() {
    this.style.opacity = 0;
    this.style.left = "-30%";
    setTimeout(() => {
        this.style.display = "none";
    }, 200);
}