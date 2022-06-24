from itertools import chain

from django.db.models import Q
from django.http import JsonResponse, HttpResponse
from drf_yasg.openapi import *
from drf_yasg.utils import swagger_auto_schema
from rest_framework import permissions, status
from rest_framework.generics import GenericAPIView

from chat.serializers import *
from recipes.views import create_response
from users.models import User


class ViewMessagesView(GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = MessageSerializerGet

    @swagger_auto_schema(tags=["messages"],
                         manual_parameters=[
                             Parameter('toUserId', IN_QUERY, type='integer'),
                         ])
    def get(self, request):
        user_id = request.user.id
        target_id = int(request.GET['toUserId'])
        search = (Q(from_user=user_id) & Q(to_user=target_id)) | (Q(from_user=target_id) & Q(to_user=user_id))
        messages = Message.objects.filter(search)
        messages_serializer = MessageSerializerGet(messages, many=True)
        return JsonResponse(messages_serializer.data, safe=False, status=status.HTTP_200_OK)


class SendMessageView(GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = MessageSerializerCreate

    @swagger_auto_schema(tags=["messages"],
                         request_body=Schema(
                             type=TYPE_OBJECT,
                             properties={
                                 'toUserId': Schema(type=TYPE_INTEGER),
                                 'message': Schema(type=TYPE_STRING)
                             }
                         ),
                         responses={
                             status.HTTP_200_OK: Schema(type=TYPE_OBJECT,
                                                        properties={'isCreated': Schema(type=TYPE_BOOLEAN),
                                                                    'id': Schema(type=TYPE_INTEGER)}
                                                        )
                         })
    def post(self, request):
        data = request.data
        data['from_user'] = request.user.id
        data['to_user'] = data['toUserId']
        new_message = MessageSerializerCreate(data=data)
        return create_response(new_message)

class PrivChannelView(GenericAPIView):

    permission_classes = [permissions.IsAuthenticated]
    serializer_class = MessageSerializerGet

    @staticmethod
    def encode_ids(my_id, other_id):
        if my_id <= other_id:
            smaller_id = my_id
            larger_id = other_id
        else:
            smaller_id = other_id
            larger_id = my_id
        return  str(smaller_id)+'_'+str(larger_id)

    @staticmethod
    def get_other_id(room_name, my_id):
        ids = room_name.split('_')
        if int(ids[0]) == my_id:
            return int(ids[1])
        else:
            return int(ids[0])

    @swagger_auto_schema(tags=["messages"])
    def get(self, request, id):
        my_id = request.user.id
        other_id = id
        return JsonResponse({'channelId': self.encode_ids(my_id, other_id)}, status=status.HTTP_200_OK)
