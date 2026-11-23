// @ts-nocheck
// biome-ignore-all lint: transitional legacy interface module
/* eslint-disable */
/*
 Generates id for every component using ES6 generators
 */
const IdGenerator = (function* () {
  let id = 0;
  while (true) yield id++;
})();
const generateId = () => IdGenerator.next().value;
