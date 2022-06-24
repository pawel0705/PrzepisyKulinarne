from django.urls import path
from django.conf.urls.static import static
from django.conf import settings
from recipes import views

urlpatterns = [
    path('get-recipe/<int:pk>', views.RecipeGetView.as_view(http_method_names=['get'])),
    path('create-recipe', views.RecipeCreateView.as_view(http_method_names=['post'])),
    path('upload-main-image', views.RecipeUploadImage.as_view(http_method_names=['post'])),
    path('edit-recipe/<int:pk>',  views.RecipeEditView.as_view(http_method_names=['put'])),
    path('delete-recipe/<int:pk>', views.RecipeDeleteView.as_view(http_method_names=['delete'])),
    path('get-all', views.RecipeGetAllView.as_view(http_method_names=['get'])),
    path('create-comment', views.RecipeCreateCommentView.as_view(http_method_names=['post'])),
    path('get-categories', views.RecipeCategoryView.as_view(http_method_names=['get'])),
    path('get-image/<int:pk>', views.RecipeGetImage.as_view(http_method_names=['get'])),
    path('get-image-id/<int:pk>', views.RecipeGetImageByImageId.as_view(http_method_names=['get'])),
]
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)