// @ts-nocheck
// biome-ignore-all lint: transitional legacy interface module
/* eslint-disable */
class Clock extends Component {
  constructor(name, pos) {
    super(name, pos, 2, 1, { type: 'icon', text: 'access_time' });
    this.addOutputPort({ side: 1, pos: 0 });
    this.value = 0;

    this.schedule(() => {
      if (this.properties.hasOwnProperty('delay')) {
        this.tick();
      } else {
        dialog.editDelay(this, this.tick.bind(this));
      }
    }, 100);
  }

  tick() {
    if (this.disposed) return;
    this.value = 1 - this.value;
    this.update();
    this.properties.delay &&
      this.schedule(() => {
        const generation = this.timerGeneration || 0;
        updateQueue.push(() => {
          if ((this.timerGeneration || 0) === generation) this.tick();
        });
      }, this.properties.delay);
  }

  function() {
    this.output[0].value = this.value;
  }
}

// class Key extends Component {
//     constructor(name,pos) {
//         super(name,pos,2,1,{ type: "icon", text: "keyboard" });
//         this.addOutputPort({ side: 1, pos: 0 });
//         this.value = 0;
//
//         // TODO
//     }
//
//     function() {
//         this.output[0].value = this.value;
//     }
// }

class Debug extends Component {
  constructor(name, pos) {
    super(name, pos, 2, 1, { type: 'icon', text: 'report_problem' });
    this.addInputPort({ side: 3, pos: 0 });
    this.value = 0;
  }

  function() {
    this.value = this.input[0].value;
    notifications.push(this.name + ': ' + this.value);
    reeoConsole.log(this.name + ': ' + this.value);
  }
}

class Beep extends Component {
  constructor(name, pos) {
    super(name, pos, 2, 1, { type: 'icon', text: 'audiotrack' });
    this.addInputPort({ side: 3, pos: 0 });
    this.properties.frequency = 700;
    this.properties.duration = 200;
  }

  function() {
    if (this.input[0].value == 1) {
      beep(this.properties.frequency, this.properties.duration);
    }
  }
}

class Counter extends Component {
  constructor(name, pos) {
    super(name, pos, 2, 1, { type: 'value' });
    this.addInputPort({ side: 3, pos: 0 });
    this.value = 0;
  }

  function() {
    const high = this.input[0].value == 1;
    if (high && !this.previousHigh) ++this.value;
    this.previousHigh = high;
  }
}
