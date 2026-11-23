// @ts-nocheck
// biome-ignore-all lint: transitional legacy interface module
/* eslint-disable */
class NOT extends Component {
  constructor(name, pos) {
    super(name, pos, 1, 1, { type: 'char', text: '!' });
    this.addInputPort({ side: 3, pos: 0 });
    this.addOutputPort({ side: 1, pos: 0 });
    this.function = function () {
      this.output[0].value = 1 - this.input[0].value;
    };
  }
}

class AND extends Component {
  constructor(name, pos) {
    super(name, pos, 2, 2, { type: 'char', text: '&' });
    this.addInputPort({ side: 3, pos: 1 });
    this.addInputPort({ side: 3, pos: 0 });
    this.addOutputPort({ side: 1, pos: 0 });
    this.function = function () {
      this.output[0].value = this.input[0].value & this.input[1].value;
    };
  }
}

class OR extends Component {
  constructor(name, pos) {
    super(name, pos, 2, 2, { type: 'char', text: '|' });
    this.addInputPort({ side: 3, pos: 1 });
    this.addInputPort({ side: 3, pos: 0 });
    this.addOutputPort({ side: 1, pos: 0 });
    this.function = function () {
      this.output[0].value = this.input[0].value | this.input[1].value;
    };
  }
}

class XOR extends Component {
  constructor(name, pos) {
    super(name, pos, 2, 2, { type: 'char', text: '^' });
    this.addInputPort({ side: 3, pos: 1 });
    this.addInputPort({ side: 3, pos: 0 });
    this.addOutputPort({ side: 1, pos: 0 });
    this.function = function () {
      this.output[0].value = this.input[0].value ^ this.input[1].value;
    };
  }
}
