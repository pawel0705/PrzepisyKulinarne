import {
  ChatAdapter,
  IChatGroupAdapter,
  User,
  Group,
  Message,
  ChatParticipantStatus,
  ParticipantResponse,
  ParticipantMetadata,
  ChatParticipantType,
  IChatParticipant,
} from 'ng-chat';
import { Observable, of } from 'rxjs';
import { delay, finalize } from 'rxjs/operators';
import { UserDetailsModel } from '../models/user-details.model';
import { UserServiceService } from '../services/user-service.service';
import { MessagesService } from '../services/messages.service';
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { SendMessageModel } from '../models/send-message.model';

export class MyChatAdapter extends ChatAdapter {
  constructor(
    private messagesService: MessagesService,
    private authService: AuthService
  ) {
    super();
  }

  public mockedParticipants: IChatParticipant[] = [];
  public mockedHistory: Array<Message> = [];

  addParticipant(id: number, name: string) {
    this.mockedParticipants.push({
      participantType: ChatParticipantType.User,
      id: id,
      displayName: name,
      avatar:
        'https://img.myloview.pl/tapety/hand-drawn-modern-man-avatar-profile-icon-or-portrait-icon-user-flat-avatar-icon-sign-profile-male-symbol-700-234216721.jpg',
      status: ChatParticipantStatus.Offline,
    });
  }

  clearWhereToId(toId: number) {
    let currentUserId = this.authService.loggedId;

    this.mockedHistory = this.mockedHistory.filter((obj) => {
      return obj.toId !== toId && obj.fromId !== currentUserId;
    });
  }

  clearMockedHistory() {
    this.mockedHistory = [];
  }

  clearParticipants() {
    this.mockedParticipants = [];
  }

  listFriends(): Observable<ParticipantResponse[]> {
    return of(
      this.mockedParticipants.map((user) => {
        let participantResponse = new ParticipantResponse();

        participantResponse.participant = user;

        return participantResponse;
      })
    );
  }

  public onFriendsListChanged(
    participantsResponse: ParticipantResponse[]
  ): void {}

  addMockedHistory(messages: any[]) {
    messages.forEach((x) => {
      this.mockedHistory.push({
        fromId: x.fromUserId,
        toId: x.toUserId,
        message: x.message,
        dateSent: new Date(x.sendDate),
      });
    });
  }

  addMessageToMockedHistory(msg: Message) {
    this.mockedHistory.push(msg);
  }

  getMessageHistory(destinataryId: any): Observable<Message[]> {
    let messages: Array<Message> = [];

    messages = this.mockedHistory.filter((obj) => {
      return obj.toId === destinataryId || obj.fromId === destinataryId;
    });

    messages = messages.sort((a, b) => (a.dateSent < b.dateSent ? -1 : 1));

    return of(messages).pipe(delay(0));
  }

  sendMessage(message: Message): void {
    if (!this.authService.isLoggedIn) {
      return;
    }
    let mes = new SendMessageModel();
    mes.fromUserId = message.fromId;
    mes.message = message.message;
    mes.toUserId = message.toId;

    this.messagesService.sendMessage(mes);
  }
}
