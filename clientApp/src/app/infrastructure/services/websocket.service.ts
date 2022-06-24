import { HttpClient } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { Observer, Subject } from 'rxjs';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class WebsocketService {
  constructor() {}

  onMessage: EventEmitter<any> = new EventEmitter();
  private subject: Subject<MessageEvent>;
  public ws: WebSocket;

  public connect(url): Subject<MessageEvent> {
    if (!this.subject) {
      this.subject = this.create(url);
    }
    return this.subject;
  }

  private create(url): Subject<MessageEvent> {
    const self = this;

    this.ws = new WebSocket(url);
    let observable = Observable.create((obs: Observer<MessageEvent>) => {
      this.ws.onmessage = obs.next.bind(obs);
      this.ws.onerror = obs.error.bind(obs);
      this.ws.onclose = obs.complete.bind(obs);
      return this.ws.close.bind(this.ws);
    });
    let observer = {
      next: (data: Object) => {
        if (this.ws.readyState === WebSocket.OPEN) {
          this.ws.send(JSON.stringify(data));
        }
      },
    };

    this.ws.onopen = function () {};

    this.ws.onerror = function () {};

    this.ws.onclose = function () {};

    this.ws.onmessage = function (msg) {
      const mes = JSON.parse(msg.data);
      self.onMessage.emit(mes);
    };

    return Subject.create(observer, observable);
  }
}
