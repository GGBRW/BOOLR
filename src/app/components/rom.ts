// @ts-nocheck
// biome-ignore-all lint: transitional legacy interface module
/* eslint-disable */
class ROM extends Component {
  constructor(name, pos, data = []) {
    super(name, pos, 3, 8, { type: 'char', text: 'ROM' });

    this.schedule(() => {
      if (
        !this.properties.hasOwnProperty('data') ||
        !this.properties.hasOwnProperty('addressWidth')
      ) {
        dialog.editRom(this);
      }
    }, 100);
  }

  function() {
    let addr = 0;
    for (let i = 0; i < this.input.length; i++) {
      addr |= (this.input[i].value > 0) << i;
    }
    let rom = this.properties.rom;
    if (rom) {
      let content = this.properties.rom[addr];
      for (let i = 0; i < this.output.length; i++) {
        this.output[i].value = (content >>> i) & 1;
      }
    }
  }
}
