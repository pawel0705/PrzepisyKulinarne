from django.db.models import Avg

from recipes.models import *
from rest_framework import serializers


class RecipeImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = RecipeImage
        fields = ['id', 'file']


class RecipeCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = RecipeCategory
        fields = ['id', 'name']


class RatingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rating
        fields = ['id', 'author', 'recipe', 'commentText', 'rating', 'create_date']

    def validate_rating(self, value):
        if value > 5 or value < 1:
            raise serializers.ValidationError("Rating out of scale 1-5")
        return value


class RecipeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Recipe
        fields = ['id', 'author', 'title', 'content', 'shortDescription', 'category', 'mainImage', 'view_count',
                  'create_date', 'update_date']

    def validate(self, data):
        return data

    def create(self, validated_data):
        return Recipe.objects.create(**validated_data)


class RatingRecipeGetSerializer(serializers.ModelSerializer):
    userId = serializers.SerializerMethodField()
    userName = serializers.SerializerMethodField()
    content = serializers.CharField(source='commentText')
    pub_date = serializers.DateTimeField(source='create_date')

    class Meta:
        model = Rating
        fields = ['userId', 'content', 'rating', 'userName', 'pub_date']

    def get_userId(self, obj):
        return obj.author.id

    def get_userName(self, obj):
        return obj.author.username


class RecipeFullViewSerializer(serializers.ModelSerializer):

    def __init__(self, *args, **kwargs):
        fields = kwargs.pop('fields', None)
        super().__init__(*args, **kwargs)
        if fields is not None:
            allowed = set(fields)
            existing = set(self.fields)
            for field_name in existing - allowed:
                self.fields.pop(field_name)

    recipeId = serializers.IntegerField(source='id')
    views = serializers.IntegerField(source='view_count')
    createdDate = serializers.DateTimeField(source='create_date')
    comments = serializers.SerializerMethodField()
    mainImageId = serializers.SerializerMethodField()
    categoryId = serializers.SerializerMethodField()
    authorName = serializers.SerializerMethodField()
    authorId = serializers.SerializerMethodField()
    rating = serializers.SerializerMethodField()

    class Meta:
        model = Recipe
        fields = ['authorName', 'authorId', 'recipeId', 'title', 'content', 'categoryId',
                  'shortDescription',
                  'createdDate', 'mainImageId', 'views', 'rating', 'comments']

    def get_comments(self, obj):
        comments = Rating.objects.filter(recipe=obj.id)
        return RatingRecipeGetSerializer(comments, many=True).data

    def get_categoryId(self, obj):
        return obj.category.id

    def get_mainImageId(self, obj):
        if obj.mainImage:
            return obj.mainImage.id
        return obj.mainImage

    def get_authorName(self, obj):
        return obj.author.username

    def get_authorId(self, obj):
        return obj.author.id

    def get_rating(self, obj):
        rec_ratings = Rating.objects.filter(recipe=obj.id)
        return rec_ratings.aggregate(Avg('rating'))['rating__avg']
