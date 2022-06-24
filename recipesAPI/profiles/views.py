from django.db.models import Sum, Avg
from drf_yasg.openapi import *
from drf_yasg.utils import swagger_auto_schema
from rest_framework import permissions
from rest_framework.generics import GenericAPIView
from recipes.models import *
from .serializers import *
from django.http import JsonResponse
from django.core import serializers
from rest_framework import status
from recipes.serializers import RecipeSerializer, RecipeFullViewSerializer
from recipes.models import Recipe


class UserProfileGetUserRecipesView(GenericAPIView):
    serializer_class = RecipeSerializer
    queryset = ''

    @swagger_auto_schema(tags=["userProfile"],
                         responses={
                             status.HTTP_200_OK: Schema(type=TYPE_OBJECT,
                                                        properties={
                                                            'recipeId': Schema(type=TYPE_INTEGER),
                                                            'authorId': Schema(type=TYPE_INTEGER),
                                                            'categoryId': Schema(type=TYPE_INTEGER),
                                                            'shortDescription': Schema(type=TYPE_STRING),
                                                            'title': Schema(type=TYPE_STRING),
                                                            'createdDate': Schema(type=TYPE_STRING),
                                                            'mainImageId': Schema(type=TYPE_INTEGER),
                                                            'authorName': Schema(type=TYPE_STRING),
                                                            'rating': Schema(type=TYPE_INTEGER),

                                                        })
                         }
                         )
    def get(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
            userRecipes = Recipe.objects.filter(author=user.id)
        except (User.DoesNotExist, Recipe.DoesNotExist):
            return JsonResponse({}, status=status.HTTP_404_NOT_FOUND)
        serializer = RecipeFullViewSerializer(userRecipes, many=True, fields={
            'recipeId',
            'authorId',
            'categoryId',
            'shortDescription',
            'title',
            'createdDate',
            'mainImageId',
            'authorName',
            'rating'})

        return JsonResponse(serializer.data, status=status.HTTP_200_OK, safe=False)


class UserProfileGetProfileView(GenericAPIView):
    serializer_class = UserProfileSerializer
    queryset = ''

    @swagger_auto_schema(tags=["userProfile"],
                         request_body=Schema(
                             type=TYPE_OBJECT,
                             properties={
                                 'userId': Schema(type=TYPE_INTEGER)
                             }
                         ),
                         responses={
                             status.HTTP_200_OK: Schema(type=TYPE_OBJECT,
                                                        properties={
                                                            'name': Schema(type=TYPE_STRING),
                                                            'rating': Schema(type=TYPE_INTEGER),
                                                            'views': Schema(type=TYPE_STRING),
                                                        })
                         }
                         )
    def getAvgUserRatings(self, user):
        userRatings = Rating.objects.filter(author=user.id)
        return userRatings.aggregate(Avg('rating'))['rating__avg']

    def getSumUserRecipes(self, user):
        userRecipes = Recipe.objects.filter(author=user.id)
        return userRecipes.aggregate(Sum('view_count'))['view_count__sum']

    def get(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
            data = {'name': user.username, 'rating': self.getAvgUserRatings(user),
                    'views': self.getSumUserRecipes(user)}
            serializer = UserProfileSerializer(data=data)
        except (User.DoesNotExist, Rating.DoesNotExist, Recipe.DoesNotExist):
            return JsonResponse({}, status=status.HTTP_404_NOT_FOUND)
        try:
            if serializer.is_valid(raise_exception=True):
                return JsonResponse(serializer.data, status=status.HTTP_200_OK)
        except serializers.ValidationError as valEr:
            return JsonResponse({'errorMessage': valEr.detail}, status=status.HTTP_400_BAD_REQUEST)
