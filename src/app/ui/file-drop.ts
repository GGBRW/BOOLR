// @ts-nocheck
// biome-ignore-all lint: transitional legacy interface module
/* eslint-disable */
function allowDrop(e) {
  e.preventDefault();
}

const drop = (e) => {
  e.preventDefault();
  readFile(e.dataTransfer);
};
