import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { SendMessageModel } from 'src/app/infrastructure/models/send-message.model';
import { AuthService } from './auth.service';
import { WebsocketService } from './websocket.service';

@Injectable({
  providedIn: 'root',
})
export class MessagesService {
  constructor(
    @Inject('BASE_API_URL') private readonly baseApiUrl: string,
    private readonly http: HttpClient,
    private wsService: WebsocketService,
    private authService: AuthService
  ) {}

  public messages: Subject<any> = new Subject<any>();

  roomName = '';

  connect = (roomName: string): void => {
    this.roomName = roomName;
    this.messages = <Subject<any>>(
      this.wsService.connect(
        'ws://127.0.0.1:8000/ws/messages/' + roomName + '/'
      )
    );
  };

  getMessages = (toUserId: number): Observable<any[]> => {
    this.wsService;
    return this.http.get<any[]>(
      `${this.baseApiUrl}/messages/getMessages?toUserId=${toUserId}`
    );
  };

  sendMessage = (model: SendMessageModel): void => {
    this.wsService.ws.send(JSON.stringify(model));
  };
}
