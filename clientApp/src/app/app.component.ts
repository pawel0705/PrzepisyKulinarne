import { Component, OnInit, ViewChild } from '@angular/core';
import { ChatAdapter, IChatController, Message, User } from 'ng-chat';
import { AuthService } from './infrastructure/services/auth.service';
import { MyChatAdapter } from 'src/app/infrastructure/helpers/chat-adapter';
import { UserDetailsModel } from './infrastructure/models/user-details.model';
import { finalize } from 'rxjs/operators';
import { MessagesService } from './infrastructure/services/messages.service';
import { UserServiceService } from './infrastructure/services/user-service.service';
import { WebsocketService } from './infrastructure/services/websocket.service';
import { Location } from '@angular/common';
import { map } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  title = 'clientApp';

  @ViewChild('ngChatInstance')
  protected ngChatInstance: IChatController;

  public adapter: MyChatAdapter = new MyChatAdapter(
    this.messagesService,
    this.authService
  );

  public chatTitle = 'Wyślij wiadomość';
  public messagePlaceholder = 'Napisz wiadomość';

  users: UserDetailsModel[] = [];
  messages: any[] = [];

  constructor(
    private wsService: WebsocketService,
    private messagesService: MessagesService,
    private userService: UserServiceService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    setTimeout(() => {
      this.init();
    }, 1000);
  }

  private init() {
    this.fetchData();
  }

  private fetchMessages = (toUserId: number): void => {
    this.messagesService
      .getMessages(toUserId)
      .pipe(finalize(() => {}))
      .subscribe(
        (result) => {
          this.adapter.addMockedHistory(result);
        },
        (error) => {}
      );
  };

  private fetchData = (): void => {
    this.userService
      .getAllUsers()
      .pipe(
        finalize(() => {
          this.prepareChat();

          this.adapter.clearMockedHistory();
          let loggedId = this.authService.loggedId;

          for (var user of this.users) {
            if (user.id == +loggedId) {
              continue;
            }
            this.adapter.addParticipant(user.id, user.username);
            this.fetchMessages(user.id);

            let from = 0;
            let to = 0;

            if (+this.authService.loggedId > user.id) {
              from = user.id;
              to = +this.authService.loggedId;
            } else {
              from = +this.authService.loggedId;
              to = user.id;
            }

            this.messagesService.connect('0_0');
          }
        })
      )
      .subscribe(
        (result) => {
          this.adapter.clearParticipants();
          this.users = result;
        },
        (error) => {
          this.adapter.clearParticipants();
        }
      );
  };

  private prepareChat() {
    this.wsService.onMessage.subscribe((result) => {
      let user = this.adapter.mockedParticipants.find(
        (x) => +x.id === +result.senderId
      );

      let mes = new Message();
      mes.dateSent = new Date();
      mes.fromId = result.senderId;
      mes.toId = result.receiverId;
      mes.message = result.message;

      this.adapter.addMessageToMockedHistory(mes);

      if (
        result.receiverId != this.authService.loggedId &&
        result.senderId != this.authService.loggedId
      ) {
        return;
      }

      this.adapter.onMessageReceived(user, mes);
    });
  }

  public openedParticipantChat(participant: any) {}

  public closedParticipantChat(participant: any) {}
}
