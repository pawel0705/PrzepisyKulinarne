export class ButtonModalModel {
    id: string;
    text: string;
    class: string;
    action: Function;
  
    constructor(_id = "", _text = "", _class = "", _action = () => {}) {
      this.id = _id;
      this.text = _text;
      this.class = _class;
      this.action = _action;
    }
  }
  