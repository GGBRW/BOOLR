// @ts-nocheck
// biome-ignore-all lint: transitional legacy interface module
/* eslint-disable */
function localStorageAvailable() {
  try {
    localStorage.setItem('', '');
    localStorage.removeItem('');
    return true;
  } catch (e) {
    return false;
  }
}

function setLocalStorage() {
  if (!localStorageAvailable()) {
    dialog.localStorageError();
    return;
  }

  const data = {};

  let tipsData = {};
  for (let i in tips) {
    tipsData[i] = !!tips[i].disabled;
  }

  data.version = VERSION;
  if (clipboard.components.length || clipboard.wires.length || clipboard.selection) {
    data.clipboard = stringify(clipboard.components, clipboard.wires, clipboard.selection);
  }
  data.settings = settings;
  data.tips = tipsData;

  //data.savedCustomComponents = stringify(savedCustomComponents);

  try {
    localStorage.pwsData = JSON.stringify(data);
  } catch (e) {
    console.warn('Could not set localStorage data');
  }
}

function getLocalStorage() {
  if (!localStorageAvailable()) {
    dialog.localStorageError();
    return;
  }

  let data = localStorage.pwsData;

  if (!localStorage.pwsData) {
    return;
  }

  try {
    data = JSON.parse(data);
  } catch (e) {
    console.warn('Could not parse localStorage data ' + e);
    return;
  }

  if (!data.version || data.version != VERSION) {
    dialog.update();
  }

  if (data.clipboard) {
    try {
      const parsed = parse(data.clipboard);
      clipboard.copy(parsed.components, parsed.wires, parsed.selection);
    } catch (e) {
      console.warn('Could not parse clipboard data from localStorage ' + e);
    }
  }

  // if(data.savedCustomComponents) {
  //     savedCustomComponents = parse(data.savedCustomComponents).components;
  // }

  if (data.settings) {
    settings = data.settings;
  }

  if (data.tips) {
    for (let tip in data.tips) {
      tips[tip].disabled = data.tips[tip];
    }
  }
}
