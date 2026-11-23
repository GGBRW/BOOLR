// @ts-nocheck
// biome-ignore-all lint: transitional legacy interface module
/* eslint-disable */
class Button extends Component {
  constructor(name, pos) {
    super(name, pos, 2, 1, { type: 'icon', text: 'radio_button_checked' });
    this.addOutputPort({ side: 1, pos: 0 });
    this.value = 0;
  }

  onmousedown(sendToSocket = true) {
    this.value = 1;
    this.update();

    if (socket && sendToSocket) {
      socket.send(
        JSON.stringify({
          type: 'mousedown',
          data: this.id,
        }),
      );
    }
  }

  onmouseup(sendToSocket = true) {
    this.value = 0;
    this.update();

    if (socket && sendToSocket) {
      socket.send(
        JSON.stringify({
          type: 'mouseup',
          data: this.id,
        }),
      );
    }
  }

  function() {
    this.output[0].value = this.value;
  }
}

class Constant extends Component {
  constructor(name, pos, value = 1) {
    super(name, pos, 2, 1, { type: 'value' });
    this.addOutputPort({ side: 1, pos: 0 });
    this.value = value ? 1 : 0;
  }

  function() {
    this.output[0].value = this.value;
  }
}
