import json

from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer

from chat import views
from chat.serializers import MessageSerializerCreate


class ChatConsumer(WebsocketConsumer):

    def connect(self):
        self.user = self.scope["user"]

        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = 'chat_%s' % self.room_name

        # Join room group
        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name,
            self.channel_name
        )

        self.accept()


    def disconnect(self, close_code):
        # Leave room group
        async_to_sync(self.channel_layer.group_discard)(
            self.room_group_name,
            self.channel_name
        )

    # Receive message from WebSocket
    def receive(self, text_data=None, bytes_data=None):
        text_data_json = json.loads(text_data)
        message = text_data_json['message']
        sender = int(text_data_json['fromUserId'])
        receiver = int(text_data_json['toUserId'])
        #receiver = views.PrivChannelView.get_other_id(self.room_name, sender)

        data = {'from_user': sender,
                'to_user': receiver,
                'message': message}
        new_message = MessageSerializerCreate(data=data)

        if new_message.is_valid():
            new_message.save()

            # Send message to room group
            async_to_sync(self.channel_layer.group_send)(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'sender' : sender,
                    'receiver' : receiver,
                    'message': message
                }
            )

    # Receive message from room group
    def chat_message(self, event):
        message = event['message']
        sender = int(event['sender'])
        receiver = int(event['receiver'])

        # Send message to WebSocket
        self.send(text_data=json.dumps({
            'senderId': sender,
            'receiverId': receiver,
            'message': message
        }))
