from rest_framework import serializers
from .models import Album, Photo, PhotoComment, PhotoLike
from django.contrib.auth import get_user_model

class UserSerializer(serializers.ModelSerializer):
    # always use get user album along with get user while looking user's space
    # albums = serializers.SlugRelatedField(many=True, 
    #                                         queryset=Album.objects.all(),
    #                                         slug_field='title')

    class Meta:
        model = get_user_model()
        fields = ('id', 'username')
    
#Not in use because it reveals private albums too
class UserSerializerAllAlbums(serializers.ModelSerializer):
    albums = serializers.SlugRelatedField(many=True, 
                                                queryset=Album.objects.all(),
                                                slug_field='title')
    class Meta:
        model = get_user_model()
        fields = ('albums',)


class AlbumSerializer(serializers.ModelSerializer):
    def getOwnerName(self, obj):
        return obj.owner.username
        
    owner = serializers.SerializerMethodField("getOwnerName")
    photos = serializers.StringRelatedField(many=True)
    class Meta:
        model = Album
        fields = ('unique_id', 'title', 'description', 'create_at', 'owner', 'public', 'photos')

class CreateAlbumSerializer(serializers.ModelSerializer):
    class Meta:
        model = Album
        fields = ('title', 'description', 'public',)

class UpdateAlbumSerializer(serializers.ModelSerializer):
    class Meta:
        model = Album
        fields = ('title', 'description', 'public',)


class PhotoSerializer(serializers.ModelSerializer):
    def getAlbumTitle(self, obj):
        return obj.belong_to.title
        
    belong_to = serializers.SerializerMethodField("getAlbumTitle")
    class Meta:
        model = Photo
        fields = ('unique_id', 'create_at', 'image', 'belong_to')

class CreatePhotoSerializer(serializers.ModelSerializer):
    #multiple images upload does not support title, hence removed
    class Meta:
        model = Photo
        fields = ('image',)


