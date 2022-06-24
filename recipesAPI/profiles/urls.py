from django.urls import path
from profiles import views

urlpatterns = [
    path('profile/<int:pk>', views.UserProfileGetProfileView.as_view(http_method_names=['get'])),
    path('user-recipes/<int:pk>', views.UserProfileGetUserRecipesView.as_view(http_method_names=['get'])),
]
