// @ts-nocheck
// biome-ignore-all lint: transitional legacy interface module
/* eslint-disable */
function saveBoard(name, components = window.components, wires = window.wires) {
  // let data = stringify(components_,wires_);
  //
  // document.title = "REEO | " + name;
  //
  // // Export data as .board file
  // const a = document.createElement("a");
  // data = "data:text/json;charset=utf-8," + encodeURIComponent(data);
  // a.setAttribute('href', data);
  // a.setAttribute('download', name + ".board");
  // a.click();

  name = name || 'REEO-save-' + new Date().toLocaleString();

  const data = stringify(components, wires);
  const csvData = new Blob([data], { type: 'text/csv' });
  const csvUrl = URL.createObjectURL(csvData);

  const a = document.createElement('a');
  a.href = csvUrl;
  a.target = '_blank';
  a.download = name + '.board';
  a.click();
}

function openFile() {
  window.reeo.importBoard();
}

function readFile(input) {
  const file = input.files && input.files[0];
  if (file) window.reeo.importFile(file);
  dialog.hide();
}
