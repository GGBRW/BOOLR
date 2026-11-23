// @ts-nocheck
// biome-ignore-all lint: transitional legacy interface module
/* eslint-disable */
const tutorial = document.querySelector('.tutorial');
tutorial.sections = tutorial.querySelectorAll('.sections > div');
tutorial.sectionIndex = 0;
tutorial.nextBtn = tutorial.querySelector('.next');
tutorial.previousBtn = tutorial.querySelector('.previous');
tutorial.renderSection = function () {
  this.sections.forEach((section, index) => {
    const current = index === this.sectionIndex;
    section.classList.toggle('is-current', current);
    section.hidden = !current;
    section.setAttribute('aria-hidden', String(!current));
  });
  this.previousBtn.disabled = this.sectionIndex === 0;
  this.nextBtn.disabled = this.sectionIndex === this.sections.length - 1;
  this.querySelector('.index').textContent = `${this.sectionIndex + 1}/${this.sections.length}`;
  this.querySelector('.sections').scrollTop = 0;
};
tutorial.nextBtn.onclick = () => {
  tutorial.sectionIndex = Math.min(tutorial.sections.length - 1, tutorial.sectionIndex + 1);
  tutorial.renderSection();
};
tutorial.previousBtn.onclick = () => {
  tutorial.sectionIndex = Math.max(0, tutorial.sectionIndex - 1);
  tutorial.renderSection();
};
tutorial.show = function () {
  this.style.display = 'block';
  this.style.opacity = 1;
  this.style.left = '0px';
  this.renderSection();
};
tutorial.hide = function () {
  this.style.display = 'none';
  this.style.opacity = 0;
  this.sectionIndex = 0;
  this.renderSection();
};
tutorial.toggle = function () {
  this.style.display === 'block' ? this.hide() : this.show();
};
tutorial.renderSection();
