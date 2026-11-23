// @ts-nocheck
// biome-ignore-all lint: transitional legacy interface module
/* eslint-disable */
class Input extends Component {
  constructor(name, pos) {
    super(name, pos, 2, 1, { type: 'value' });
    this.addOutputPort({ side: 1, pos: 0 });
    this.value = 0;
  }

  onmousedown(sendToSocket = true) {
    this.value = 1 - this.value;
    this.update(true);

    if (socket && sendToSocket) {
      socket.send(
        JSON.stringify({
          type: 'mousedown',
          data: this.id,
        }),
      );
    }
  }

  function() {
    this.output[0].value = this.value;
  }
}

class Output extends Component {
  constructor(name, pos) {
    super(name, pos, 2, 1, { type: 'value' });
    this.addInputPort({ side: 3, pos: 0 });
    this.value = 0;
  }

  function() {
    this.value = this.input[0].value;
  }
}

var timerStart;
class TimerStart extends Component {
  constructor(name, pos) {
    super(name, pos, 2, 1, { type: 'value' });
    this.addOutputPort({ side: 1, pos: 0 });
    this.value = 0;
  }

  onmousedown(sendToSocket = true) {
    this.value = 1 - this.value;
    this.update(true);

    if (socket && sendToSocket) {
      socket.send(
        JSON.stringify({
          type: 'mousedown',
          data: this.id,
        }),
      );
    }
  }

  update() {
    if (this.disposed) return;
    console.time();
    timerStart = new Date();

    this.function();

    this.output[0].value = this.value;
    this.output[0].connection && this.output[0].connection.update(this.value);
  }

  function() {
    this.output[0].value = this.value;
  }
}

class TimerEnd extends Component {
  constructor(name, pos) {
    super(name, pos, 2, 1, { type: 'value' });
    this.addInputPort({ side: 3, pos: 0 });
    this.value = 0;
  }

  update() {
    if (this.disposed) return;
    console.timeEnd();
    reeoConsole.log(this.name + ': ' + (new Date() - timerStart) + ' ms');

    this.function();

    this.input[0].value == 1 && (this.value = 1);
  }

  function() {
    this.value = this.input[0].value;
  }
}
