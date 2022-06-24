from django.urls import path
from django.conf.urls.static import static
from django.conf import settings
from chat import views

urlpatterns = [
    path('getMessages', views.ViewMessagesView.as_view(http_method_names=['get'])),
    path('sendMesssage', views.SendMessageView.as_view(http_method_names=['post'])),
    path('getPrivateChannel/<int:id>', views.PrivChannelView.as_view(http_method_names=['get'])),
]