// @ts-nocheck
// biome-ignore-all lint: transitional legacy interface module
/* eslint-disable */
class Display extends Component {
  constructor(name, pos) {
    super(name, pos, 3, 4);
    this.properties.displayMode = 'bcd';
    this.properties.digits = 1;
    this.properties.colorMode = 'fixed';
    this.properties.colorOn = '#ff3b3b';
    this.properties.colorOff = '#1f0b0b';
    this.value = 0;
    this.digitValues = [0];
    this.configureDisplay();
  }

  configureDisplay() {
    const digits = Math.max(1, Math.min(8, parseInt(this.properties.digits) || 1));
    this.properties.displayMode = 'bcd';
    this.properties.digits = digits;
    const signal = this.properties.colorMode === 'signal';
    const dataPins = digits * 4;
    this.width = digits * 3;
    this.height = 4;

    // Keep the three colour ports (and their wires) when digits are added
    // or removed; only the data bus in front of them changes size.
    const colorPorts = this.input.filter((port) => /^C[0-2]$/.test(port.name || ''));
    const dataPorts = this.input.filter((port) => !/^C[0-2]$/.test(port.name || ''));
    this.input = dataPorts;
    while (this.input.length < dataPins) this.addInputPort();
    while (this.input.length > dataPins) {
      const port = this.input.pop();
      if (port && port.connection) removeWire(port.connection);
    }
    for (let digit = 0; digit < digits; ++digit) {
      for (let bit = 0; bit < 4; ++bit) {
        const port = this.input[digit * 4 + bit];
        port.pos = {
          side: 0,
          pos: (digit * 4 + bit) * ((this.width - 1) / (dataPins - 1)),
        };
        port.name = 'D' + (digit * 4 + bit);
      }
    }
    if (signal) {
      while (colorPorts.length < 3) colorPorts.push(this.addInputPort());
      for (let i = 0; i < 3; ++i) {
        const port = colorPorts[i];
        if (this.input.indexOf(port) === -1) this.input.push(port);
        port.pos = { side: 3, pos: 0.35 + i * 0.35 };
        port.name = 'C' + i;
      }
    } else {
      for (const port of colorPorts) {
        if (port.connection) removeWire(port.connection);
      }
    }
  }

  isPowered() {
    const digits = this.properties.digits || 1;
    const dataPins = digits * 4;
    return (
      this.input.slice(0, dataPins).some((port) => !!port.connection) ||
      this.digitValues.some((value) => value !== 0)
    );
  }

  addDigit() {
    this.properties.digits = Math.min(8, (this.properties.digits || 1) + 1);
    this.configureDisplay();
  }

  removeDigit() {
    this.properties.digits = Math.max(1, (this.properties.digits || 1) - 1);
    this.configureDisplay();
  }

  function() {
    if (this.properties.displayMode !== 'bcd') {
      this.value = this.input[0]?.value || 0;
      return;
    }
    const digits = this.properties.digits || 1;
    this.digitValues = [];
    for (let digit = 0; digit < digits; ++digit) {
      let value = 0;
      for (let bit = 0; bit < 4; ++bit) {
        value |= (this.input[digit * 4 + bit]?.value || 0) << bit;
      }
      this.digitValues.push(value & 15);
    }
    this.value = this.digitValues[digits - 1] || 0;
  }

  draw() {
    Component.prototype.draw.call(this);
    const box = componentBox(this);
    if (this.properties.displayMode !== 'bcd') {
      const screen = drawDisplayBezel(box, 0.075);
      const names = 'abcdefg';
      let lit = '';
      const powered =
        this.input.slice(0, 8).some((port) => !!port.connection) ||
        this.input.slice(0, 8).some((port) => !!port.value);
      if (!powered) return;
      for (let i = 0; i < 7; ++i) {
        if (this.input[i]?.value) lit += names[i];
      }
      if (this.input[7]?.value) lit += 'p';
      drawSevenDigit(
        screen.x,
        screen.y,
        screen.w,
        screen.h,
        lit,
        displayOnColor(this),
        displayOffColor(this),
      );
      return;
    }
    const digits = this.properties.digits || 1;
    const bezel = drawDisplayBezel(box, 0.055);
    const cellWidth = bezel.w / digits;
    const gap = zoom * 0.08;
    const powered = this.isPowered();
    if (!powered) return;
    const onColor = displayOnColor(this);
    const offColor = displayOffColor(this);
    for (let digit = 0; digit < digits; ++digit) {
      const cell = {
        x: bezel.x + digit * cellWidth + gap / 2,
        y: bezel.y,
        w: cellWidth - gap,
        h: bezel.h,
      };
      let value = 0;
      for (let bit = 0; bit < 4; ++bit) {
        value |= (this.input[digit * 4 + bit]?.value || 0) << bit;
      }
      drawSevenDigit(cell.x, cell.y, cell.w, cell.h, SEGMENTS[value] || '', onColor, offColor);
    }
  }
}
