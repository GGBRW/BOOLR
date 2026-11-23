// @ts-nocheck
// biome-ignore-all lint: transitional legacy interface module
/* eslint-disable */
dialog.connections = function (component) {
  dialog.show();
  dialog.name.innerHTML = 'Connections';

  const input = document.createElement('ul');
  for (let i = 0; i < component.input.length; ++i) {
    const wire = component.input[i].connection;
    wire &&
      (function getInputs(wire) {
        if (wire.from) {
          const li = document.createElement('li');
          li.textContent = wire.from.component.name;
          li.setAttribute('data-no-i18n', '');
          input.appendChild(li);
        }
        for (let i = 0; i < wire.input.length; ++i) {
          getInputs(wire.input[i]);
        }
      })(wire);
  }

  const output = document.createElement('ul');
  for (let i = 0; i < component.output.length; ++i) {
    const wire = component.output[i].connection;
    wire &&
      (function getOutputs(wire) {
        if (wire.to) {
          const li = document.createElement('li');
          li.textContent = wire.to.component.name;
          li.setAttribute('data-no-i18n', '');
          output.appendChild(li);
        }
        for (let i = 0; i < wire.output.length; ++i) {
          getOutputs(wire.output[i]);
        }
      })(wire);
  }

  const connections = input.children.length + output.children.length;
  dialog.container.innerHTML += `${component.name} has ${connections} connection${connections == 1 ? '' : 's'}. <br><br>`;

  if (input.children.length > 0) {
    dialog.container.innerHTML += `${input.children.length} connection${input.children.length == 1 ? '' : 's'} from:`;
    dialog.container.appendChild(input);
  }

  if (output.children.length > 0) {
    dialog.container.innerHTML += `${output.children.length} connection${output.children.length == 1 ? '' : 's'} to:`;
    dialog.container.appendChild(output);
  }

  dialog.addOption('Close');
};

dialog.truthTable = function (type) {
  dialog.show();
  dialog.name.innerHTML = type.name + ' gate';

  const component = new type();

  dialog.container.innerHTML += window.reeoCircuitSVG(type.name);
  dialog.container.innerHTML += '<p>Truth table:</p>';

  // Create truth table
  const table = document.createElement('table');
  table.className = 'truthtable';
  dialog.container.appendChild(table);

  const length = Math.pow(2, component.input.length);

  const tr = document.createElement('tr');
  const inputTh = document.createElement('th');
  inputTh.innerHTML = 'Input';
  inputTh.colSpan = component.input.length;
  tr.appendChild(inputTh);
  const outputTh = document.createElement('th');
  outputTh.innerHTML = 'Output';
  outputTh.colSpan = component.output.length;
  tr.appendChild(outputTh);
  table.appendChild(tr);

  for (let i = 0; i < length; ++i) {
    const tr = document.createElement('tr');
    const input = ('0'.repeat(component.input.length) + i.toString(2)).slice(
      -component.input.length,
    );
    for (let i = 0; i < input.length; ++i) {
      component.input[i].value = +input[i];
    }
    component.update();

    for (let i = 0; i < input.length; ++i) {
      const td = document.createElement('td');
      td.innerHTML = input[i];
      tr.appendChild(td);
    }
    for (let i = 0; i < component.output.length; ++i) {
      const td = document.createElement('td');
      td.innerHTML = component.output[i].value;
      tr.appendChild(td);
    }

    table.appendChild(tr);
  }

  dialog.addOption('Close');
};

dialog.settings = function (component) {
  dialog.show();
  dialog.name.innerHTML = 'Settings';

  dialog.container.innerHTML += "<i class='material-icons' style='font-size: 60px'>settings<i>";

  const settingsList = document.getElementById('settings').cloneNode(true);
  settingsList.style.display = 'block';
  dialog.container.appendChild(settingsList);

  const scrollAnimationOption = settingsList.querySelector('.option.scrollAnimation');
  scrollAnimationOption.checked = settings.scrollAnimation;

  const zoomAnimationOption = settingsList.querySelector('.option.zoomAnimation');
  zoomAnimationOption.checked = settings.zoomAnimation;

  const showDebugInfoOption = settingsList.querySelector('.option.showDebugInfo');
  showDebugInfoOption.checked = settings.showDebugInfo;

  const showComponentUpdatesOption = settingsList.querySelector('.option.showComponentUpdates');
  showComponentUpdatesOption.checked = settings.showComponentUpdates;

  settingsList.querySelector('#settings #reset').onclick = () =>
    dialog.confirm('Are you sure you want to clear all local stored data?', clearReeoLocalData);

  dialog.addOption('Cancel');
  dialog.addOption('OK', () => {
    settings.scrollAnimation = scrollAnimationOption.checked;
    settings.zoomAnimation = zoomAnimationOption.checked;
    settings.showDebugInfo = showDebugInfoOption.checked;
    settings.showComponentUpdates = showComponentUpdatesOption.checked;
  });
};

dialog.confirm = function (text, callback) {
  dialog.show();
  dialog.name.innerHTML = 'Confirm';
  dialog.container.innerHTML += "<i class='material-icons' style='font-size: 60px'>?<i>";
  dialog.container.innerHTML += '<p>' + text + '</p>';

  dialog.addOption('Cancel');
  dialog.addOption('OK', callback);
};

dialog.warning = function (text) {
  dialog.show();
  dialog.name.innerHTML = 'Warning';
  dialog.container.innerHTML += "<i class='material-icons' style='font-size: 60px'>warning<i>";
  dialog.container.innerHTML += '<p>' + text + '</p>';

  dialog.addOption('OK');
};

dialog.localStorageError = function () {
  dialog.show();
  dialog.name.innerHTML = 'localStorage not available';
  dialog.container.innerHTML += "<i class='material-icons' style='font-size: 60px'>warning<i>";
  dialog.container.innerHTML +=
    "<p>Your browser doesn't allow this application to store data locally. " +
    'REEO uses localStorage to store clipbord data, settings, etc. ' +
    "Either you have disabled localStorage in your browser's settings or your browser is too old.</p>";

  dialog.addOption('OK');
};

// dialog.edit = function(component) {
//     if(!component) return;
//     dialog.show();
//     dialog.name.innerHTML = "Edit";
//
//     const properties = ["name",...Object.keys(component.properties)];
//     const inputs = [];
//
//     // Name
//     const name = document.createElement("input");
//     inputs.push(name);
//     name.value = component.name;
//
//     dialog.container.appendChild(document.createTextNode("Name:"));
//     dialog.container.appendChild(name);
//     dialog.container.appendChild(document.createElement("br"));
//
//     for(let i in component.properties) {
//         const input = document.createElement("input");
//         inputs.push(input);
//         input.value = component.properties[i];
//
//         dialog.container.appendChild(document.createTextNode(i.slice(0,1).toUpperCase() + i.slice(1) + ":"));
//         dialog.container.appendChild(input);
//
//         if(i == "duration" || i == "delay") {
//             dialog.container.appendChild(document.createTextNode("ms"));
//         } else if(i == "frequency") {
//             dialog.container.appendChild(document.createTextNode("Hz"));
//         }
//         dialog.container.appendChild(document.createElement("br"));
//     }
//
//     dialog.addOption("Cancel");
//     dialog.addOption("OK",  () => {
//         for(let i in component.properties) {
//             component.properties[i] = inputs[Object.keys(component.properties).indexOf(i) + 1].value;
//         }
//     });
// }
