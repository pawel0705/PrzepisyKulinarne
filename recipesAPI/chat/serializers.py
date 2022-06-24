from rest_framework import serializers
from chat.models import Message


class MessageSerializerGet(serializers.ModelSerializer):

    sendDate = serializers.DateTimeField(source='date', required=False)
    fromUserId = serializers.SerializerMethodField()
    toUserId = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = ['id', 'fromUserId', 'toUserId', 'message', 'sendDate']

    def get_fromUserId(self, obj):
        return obj.from_user.id

    def get_toUserId(self, obj):
        return obj.to_user.id


class MessageSerializerCreate(serializers.ModelSerializer):

    date = serializers.DateTimeField(required=False)

    class Meta:
        model = Message
        fields = ['id', 'from_user', 'to_user', 'message', 'date']


