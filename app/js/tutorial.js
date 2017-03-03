const tutorial = document.querySelector(".tutorial");

tutorial.sections = tutorial.querySelectorAll(".sections div");
tutorial.sectionIndex = 0;

tutorial.querySelector(".index").innerHTML = (tutorial.sectionIndex + 1) + "/" + tutorial.sections.length;

tutorial.nextBtn = tutorial.querySelector(".next");
tutorial.nextBtn.onclick = function() {
    const previousSection = tutorial.sections[tutorial.sectionIndex];
    previousSection.style.opacity = 0;
    previousSection.style.transform = "translateX(-500px)";

    ++tutorial.sectionIndex;

    const nextSection = tutorial.sections[tutorial.sectionIndex]
    nextSection.style.opacity = 1;
    nextSection.style.transform = "translateX(0px)";

    tutorial.querySelector(".index").innerHTML = (tutorial.sectionIndex + 1) + "/" + tutorial.sections.length;

    tutorial.previousBtn.disabled = false;
    if(tutorial.sectionIndex >= tutorial.sections.length - 1) {
        this.disabled = true;
    }
}

tutorial.previousBtn = tutorial.querySelector(".previous");
tutorial.previousBtn.onclick = function() {
    const previousSection = tutorial.sections[tutorial.sectionIndex];
    previousSection.style.opacity = 0;
    previousSection.style.transform = "translateX(500px)";

    --tutorial.sectionIndex;

    const nextSection = tutorial.sections[tutorial.sectionIndex]
    nextSection.style.opacity = 1;
    nextSection.style.transform = "translateX(0px)";

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

        for(let i of this.sections) {
            i.style.opacity = 0;
            i.style.transform = "translateX(500px)";
        }

        const nextSection = this.sections[0];
        nextSection.style.opacity = 1;
        nextSection.style.transform = "translateX(0px)";

        this.sectionIndex = 0;
        tutorial.previousBtn.disabled = true;
        tutorial.querySelector(".index").innerHTML = (tutorial.sectionIndex + 1) + "/" + tutorial.sections.length;
    }, 200);
}

tutorial.toggle = function() {
    if(this.style.display != "block") {
        this.show();
    } else {
        this.hide();
    }
}