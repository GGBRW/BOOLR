// @ts-nocheck
// biome-ignore-all lint: transitional legacy interface module
/* eslint-disable */
dialog.editPort = function (port) {
  dialog.show();
  dialog.name.innerHTML = 'Edit port';
  dialog.container.innerHTML +=
    "<p class='material-icons' style='font-size: 60px; margin: 10px'>edit<p>";

  const name = createInput(
    port,
    'name',
    port.name || '',
    (name) => name.length < 12,
    'Enter a name between 0 and 12 characters',
    function () {
      edit(port, 'name', this.value);
    },
  );
  name.focus();

  const side = createInput(
    port.pos,
    'side',
    port.pos.side,
    (side) => +side >= 0 && +side <= 3,
    'Enter the number of a side, a number between 0 and 3',
    function () {
      movePort(port, +this.value, port.pos.pos);
    },
  );

  const pos = createInput(
    port.pos,
    'pos',
    port.pos.pos,
    (pos) =>
      side.valid(side.value) &&
      +pos >= 0 &&
      +pos < (+side.value % 2 == 0 ? port.component.width : port.component.height) &&
      !findPortByComponent(port.component, +side.value, +pos),
    'Enter a (free) position for the port, a number between 0 and the width/height of the component',
    function () {
      movePort(port, port.pos.side, +this.value);
    },
  );

  const inputs = [name, side, pos];

  const errormsg = document.createElement('p');
  errormsg.className = 'errormsg';
  errormsg.innerHTML = '.';
  errormsg.hide = null;
  errormsg.show = function (text) {
    clearTimeout(this.hide);
    this.innerHTML = text;
    this.style.opacity = 1;
    this.hide = setTimeout(() => (this.style.opacity = 0), 2500);
  };
  dialog.container.appendChild(errormsg);

  dialog.addOption('Cancel');
  dialog.addOption('OK', function () {
    for (let i = 0; i < inputs.length; ++i) {
      const input = inputs[i];
      input.className = '';

      if (!input.valid(input.value)) {
        input.className = 'error';
        errormsg.show(input.errormsg);

        this.onmouseup = () => (this.onmouseup = dialog.hide);
        return;
      }
    }

    for (let i = 0; i < inputs.length; ++i) {
      inputs[i].apply();
    }
  });
};

dialog.editDelay = function (component, callback) {
  if (!component) return;
  dialog.show();
  dialog.name.innerHTML = 'Edit delay';
  dialog.container.innerHTML += "<i class='material-icons' style='font-size: 60px'>access_time<i>";
  dialog.container.innerHTML += `<p>Enter a delay time in ms for component <i>${component.name}</i></p>`;

  const input = createInput(
    component.properties,
    'delay',
    component.properties.delay || '',
    (delay) => !isNaN(parseVariableInput(delay)),
    'Enter a positive delay time in milliseconds',
    function () {
      component.properties.delay = parseVariableInput(this.value);
      createVariableReference(this.value, component, ['properties', 'delay']);
    },
  );
  input.focus();
  dialog.container.removeChild(dialog.container.children[dialog.container.children.length - 1]);
  dialog.container.appendChild(document.createTextNode('ms'));

  const errormsg = document.createElement('p');
  errormsg.className = 'errormsg';
  errormsg.innerHTML = '.';
  errormsg.hide = null;
  errormsg.show = function (text) {
    clearTimeout(this.hide);
    this.innerHTML = text;
    this.style.opacity = 1;
    this.hide = setTimeout(() => (this.style.opacity = 0), 2500);
  };
  dialog.container.appendChild(errormsg);

  dialog.addOption('Cancel', function () {
    if (!component.properties.delay) {
      component.properties.delay = 1000;
      callback && callback();
    }
  });
  dialog.addOption('OK', function () {
    if (input.valid(input.value)) {
      input.apply();
      callback && callback();
    } else {
      input.className = 'error';
      errormsg.show(input.errormsg);
      this.onmouseup = () => (this.onmouseup = dialog.hide);
    }
  });
};
dialog.editRom = function (component, callback) {
  if (!component) return;
  dialog.show();
  dialog.name.innerHTML = 'Edit ROM';
  dialog.container.innerHTML += "<i class='material-icons' style='font-size: 60px'>memory<i>";
  dialog.container.innerHTML += `<p>Enter a hex-encoded data for component <i>${component.name}</i></p>`;

  const addressWidthInput = createInput(
    component.properties,
    'addressWidth',
    component.properties.addressWidth || '4',
    (addressWidth) => !isNaN(parseVariableInput(addressWidth)),
    'Address width in bits',
    function () {
      component.properties.addressWidth = parseVariableInput(this.value);
      component.height = Math.max(
        component.properties.addressWidth,
        component.properties.dataWidth,
      );
      component.input = [];
      for (let i = 0; i < component.properties.addressWidth; ++i) {
        component.addInputPort({ side: 3, pos: i });
      }
      createVariableReference(this.value, component, ['properties', 'addressWidth']);
    },
  );
  const dataWidthInput = createSelect(
    component.properties,
    'dataWidth',
    component.properties.dataWidth || 4,
    [
      { value: 4, text: '4' },
      { value: 8, text: '8' },
      { value: 16, text: '16' },
      { value: 32, text: '32' },
    ],
    function () {
      component.properties.dataWidth = +this.value;
      component.height = Math.max(
        component.properties.addressWidth,
        component.properties.dataWidth,
      );
      component.output = [];
      for (let i = 0; i < component.properties.dataWidth; ++i) {
        component.addOutputPort({ side: 1, pos: i });
      }
    },
  );
  const dataInput = createTextArea(
    component.properties,
    'data',
    component.properties.data || '',
    // TODO better validation?
    () => true,
    'Enter hex-encoded data',
    function () {
      // Keep original data
      component.properties.data = this.value;
      // Sanatize and store parsed data as an array of numbers
      const contents = this.value.replace(/\s/g, '').toUpperCase();
      const dataWidth = component.properties.dataWidth;
      let data = Array(Math.pow(2, component.properties.addressWidth)).fill(0);
      for (let i = 0; i < data.length; i++) {
        const start = (i * dataWidth) / 4;
        const end = start + dataWidth / 4;
        const content = contents.slice(start, end);
        data[i] = parseInt(content, 16);
      }
      component.properties.rom = data;
      createVariableReference(this.value, component, ['properties', 'rom']);
    },
  );
  addressWidthInput.focus();
  dialog.container.removeChild(dialog.container.children[dialog.container.children.length - 1]);

  const errormsg = document.createElement('p');
  errormsg.className = 'errormsg';
  errormsg.innerHTML = '.';
  errormsg.hide = null;
  errormsg.show = function (text) {
    clearTimeout(this.hide);
    this.innerHTML = text;
    this.style.opacity = 1;
    this.hide = setTimeout(() => (this.style.opacity = 0), 2500);
  };
  dialog.container.appendChild(errormsg);

  dialog.addOption('Cancel', function () {
    if (!component.properties.addressWidth && !component.properties.data) {
      component.properties.addressWidth = 0;
      component.properties.data = '';
      callback && callback();
    }
  });
  dialog.addOption('OK', function () {
    if (addressWidthInput.valid(addressWidthInput.value) && dataInput.valid(dataInput.value)) {
      addressWidthInput.apply();
      dataWidthInput.apply();
      dataInput.apply();
      callback && callback();
    } else {
      input.className = 'error';
      errormsg.show(addressWidthInput.errormsg);
      errormsg.show(dataInput.errormsg);
      this.onmouseup = () => (this.onmouseup = dialog.hide);
    }
  });
};
