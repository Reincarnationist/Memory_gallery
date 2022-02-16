from django.db import IntegrityError
from django.shortcuts import render
from django.http import JsonResponse
from rest_framework import generics, status
from .serializers import UserSerializer ,\
	AlbumSerializer, CreateAlbumSerializer, UpdateAlbumSerializer, \
	PhotoSerializer, CreatePhotoSerializer, CommentSerializer, CreateCommentSerializer 


from .models import Album, Photo, PhotoComment, PhotoLike
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import SessionAuthentication, BasicAuthentication
from django.contrib.auth import get_user_model
from random import randint
# Create your views here.


class UserList(generics.ListAPIView):
	'''
		Get all the users' info, no album info included.

		url_param:
			None

		Returns:
			a list of (id, username)
			

	'''
	queryset = get_user_model().objects.all()
	serializer_class = UserSerializer

class UserDetailView(APIView):
	'''
		Get a single users' info, no album info included.

		url_param:
			'username'
			
		Returns:
			Success:
				status 200
				id, username
			
			Failure:
				Error 400 on url_param missing
				Error 404 on user not found

	'''
	serializer_class = UserSerializer
	lookup_url_kwarg = 'username'
	def get(self, request, format=None):
		try:
			username = request.GET[self.lookup_url_kwarg]
		except:
			return Response({'Parameter Missing': 'Username is required.'}, 
							status=status.HTTP_400_BAD_REQUEST)
		user_result = get_user_model().objects.filter(username=username)
		if user_result.exists():
			user = user_result[0]
			serializer = self.serializer_class(user)
			return Response(serializer.data, status=status.HTTP_200_OK)

		return Response({'Not Found': 'The user does not exist.'}, 
								status=status.HTTP_404_NOT_FOUND)
#Any user can see these albums as long as they are public
class GetAllNonEmptyPublicAlbums(APIView):
	'''
		Get all the public albums info.

		url_param:
			None
			
		Returns:
			Success:
				status 200
				a list of ('unique_id', 'title', 'description', 'create_at', 'owner', 'public', 'photos')
			
			Failure:
				Error 403 if private albums exist but no public album
				Error 404 on no albums exist

	'''
	serializer_class = AlbumSerializer
	def get(self, request, format=None):
		# get all non-empty public albums
		public_albums = Album.objects.exclude(photos__isnull=True).filter(public=True)
		if public_albums.exists():
			serializer = self.serializer_class(public_albums, many=True)
			return Response(serializer.data, status=status.HTTP_200_OK)

		return Response({'Not Found': 'No non-empty public albums found.'}, 
								status=status.HTTP_404_NOT_FOUND)

class GetUserOwnAlbums(APIView):
	'''
		Get the user's own albums(both public and private) info.

		[Authentication required]

		url_param:
			None
			
		Returns:
			Success:
				status 200
				a list of ('unique_id', 'title', 'description', 'create_at', 'owner', 'public', 'photos')
			
			Failure:
				Error 404 on no albums exist

		Note: this is often used along with GetAllPublicAlbums to display a authenticated user's home page
	'''
	authentication_classes = [SessionAuthentication, BasicAuthentication]
	permission_classes = [IsAuthenticated]
	serializer_class = AlbumSerializer  

	def get(self, request, format=None):
		my_albums = Album.objects.filter(owner=request.user)

		if my_albums.exists():
			serializer = self.serializer_class(my_albums, many=True)
			return Response(serializer.data, status=status.HTTP_200_OK)

		return Response({'Not Found': 'You do not have any album at the moment.'}, 
							status=status.HTTP_404_NOT_FOUND)

class GetOtherUserNonEmptyPublicAlbums(APIView):
	'''
		Get a single user's public albums info.

		url_param:
			'username'
			
		Returns:
			Success:
				status 200
				a list of ('unique_id', 'title', 'description', 'create_at', 'owner', 'public', 'photos')
			
			Failure:
				Error 400 on url_param missing
				Error 404 on the user does not have any public albums
				Error 404 on user not found

	'''
	lookup_url_kwarg = 'username'

	def get(self, request, format=None):
		try:
			username = request.GET[self.lookup_url_kwarg]
		except:
			return Response({'Parameter Missing': 'Username is required.'}, 
							status=status.HTTP_400_BAD_REQUEST)
		user_result = get_user_model().objects.filter(username=username)
		if user_result.exists():
			user = user_result[0]
			albums = Album.objects.filter(owner=user, public=True).exclude(photos__isnull=True)
			if albums.exists():
				data = AlbumSerializer(albums, many=True).data
				return Response(data, 
								status=status.HTTP_200_OK)
			return Response({'Not Found': 'This user has no available albums at the moment.'}, 
			status=status.HTTP_404_NOT_FOUND)
		return Response({'Not Found': 'The user does not exist.'}, 
		status=status.HTTP_404_NOT_FOUND)

#Only authenticated user can create albums in their account
class CreateAlbum(APIView):
	'''
		Create a album for the current user

		[Authentication required]

		url_param:
			None
		
		post_body:
			'title', 'description', 'public'
			
		Returns:
			Success:
				status 201
				a list of ('unique_id', 'title', 'description', 'create_at', 'owner', 'public', 'photos')
			
			Failure:
				Error 303 on the same album name exists
				Error 400 on post_body invalid

	'''
	authentication_classes = [SessionAuthentication, BasicAuthentication]
	permission_classes = [IsAuthenticated]
	serializer_class = CreateAlbumSerializer  

	def post(self, request, format=None):
		serializer = self.serializer_class(data=request.data)
		if serializer.is_valid():
			title = serializer.data.get('title')
			description = serializer.data.get('description')
			public = serializer.data.get('public')
			queryset = Album.objects.filter(owner=request.user, title=title)

			if queryset.exists():
				return Response({'See Other': 'The Album already exists.'}, status=status.HTTP_303_SEE_OTHER)
			else:
				album = Album(
					title=title, 
					description=description, 
					public=public,
					owner = request.user)
				album.save()
				return Response(AlbumSerializer(album).data, status=status.HTTP_201_CREATED)
			
		return Response({'Bad Request': 'Invalid data...'}, status=status.HTTP_400_BAD_REQUEST)

class UpdateAlbum(APIView):
	'''
		Update a album for the current user

		[Authentication required]

		url_param:
			'album_id'
		
		patch_body:
			'title', 'description', 'public'
			
		Returns:
			Success:
				status 200
				a list of ('unique_id', 'title', 'description', 'create_at', 'owner', 'public', 'photos')
			
			Failure:
				Error 400 on url_param missing
				Error 403 on the owner of updating album is not the same as the request user
				Error 400 on patch_body invalid
				Error 404 on the album with the album_id is not found

	'''
	authentication_classes = [SessionAuthentication, BasicAuthentication]
	permission_classes = [IsAuthenticated]
	serializer_class = UpdateAlbumSerializer

	lookup_url_kwarg = 'album_id'
	def patch(self, request, format=None):
		try:
			album_id = request.GET[self.lookup_url_kwarg]
		except:
			return Response({'Parameter Missing': 'Album id is required.'}, 
							status=status.HTTP_400_BAD_REQUEST)

		album_result = Album.objects.filter(unique_id=album_id)
		if album_result.exists():
			album = album_result[0]
			serializer = self.serializer_class(data=request.data)
			if serializer.is_valid():
				title = serializer.data.get('title')
				description = serializer.data.get('description')
				public = serializer.data.get('public')

				if request.user != album.onwer:
					return Response({'FORBIDDEN': 'You do not have permisson.'}, status=status.HTTP_403_FORBIDDEN)
				album.title = title
				album.description = description
				album.public = public
				album.save(update_fields=['title', 'description', 'public'])
				return Response(AlbumSerializer(album).data, status=status.HTTP_200_OK)
			return Response({'Bad Request': 'Invalid Data...'}, status=status.HTTP_400_BAD_REQUEST)
		return Response({'Not Found': 'The album does not exist.'}, status=status.HTTP_404_NOT_FOUND)

		

class DeleteAlbum(APIView):
	'''
		Delete a album for the current user

		[Authentication required]

		url_param:
			'album_id'
			
		Returns:
			Success:
				status 200
				"msg": "Delete successfully."
			
			Failure:
				Error 400 on url_param missing
				Error 403 on the owner of updating album is not the same as the request user
				Error 404 on the album with the album_id is not found

	'''
	authentication_classes = [SessionAuthentication, BasicAuthentication]
	permission_classes = [IsAuthenticated]

	lookup_url_kwarg = 'album_id'
	def delete(self, request, format=None):
		try:
			album_id = request.GET[self.lookup_url_kwarg]
		except:
			return Response({'Parameter Missing': 'Album id is required.'}, 
							status=status.HTTP_400_BAD_REQUEST)
							
		album_result = Album.objects.filter(unique_id=album_id)
		if album_result.exists():
			album = album_result[0]
			if request.user != album.owner:
					return Response({'FORBIDDEN': 'You do not have permisson.'}, 
										status=status.HTTP_403_FORBIDDEN)
			album.delete()
			return Response({"msg": "Delete successfully."}, status=status.HTTP_200_OK)
		return Response({'Not Found': 'The album does not exist.'}, status=status.HTTP_404_NOT_FOUND)


class GetPhotoDetail(APIView):
	'''
		Get a specific photo detail

		url_param:
			'photo_id'
			
		Returns:
			Success:
				status 200
				('unique_id', 'create_at', 'image', 'belong_to') and thumbnail url
			
			Failure:
				Error 400 on url_param missing
				Error 403 on the owner of the album that contains this photo is not the same as the request user
				Error 404 on the photo with the photo_id is not found

	'''
	serializer_class = PhotoSerializer
	lookup_url_kwarg = 'photo_id'

	def get(self, request, format=None):
		try:
			photo_id = request.GET[self.lookup_url_kwarg]
		except:
			return Response({'Parameter Missing': 'Photo id is required.'}, 
							status=status.HTTP_400_BAD_REQUEST)

		photo_result = Photo.objects.filter(unique_id=photo_id)
		if photo_result.exists():
			photo = photo_result[0]
			#private photo
			if not photo.belong_to.public:
				if request.user != photo.belong_to.owner:
					return Response({'FORBIDDEN': 'You do not have permisson.'}, 
											status=status.HTTP_403_FORBIDDEN)
			
			data = self.serializer_class(photo).data
			data['thumb'] = photo.image_thumbnail.url
			#depreciated due to slow reading   
			#data['exif'] = photo.exif
			return Response(data, status=status.HTTP_200_OK)

		return Response({'Not Found': 'This photo does not exist.'}, 
							status=status.HTTP_404_NOT_FOUND)

class GetAllPhotoDetailFromAlbum(APIView):
	'''
		Get all the photo detail from a album

		url_param:
			'album_id'
			
		Returns:
			Success:
				status 200
				a list of ('unique_id', 'create_at', 'image', 'belong_to') and thumbnail url
			
			Failure:
				Error 400 on url_param missing
				Error 403 on the owner of the album is not the same as the request user
				Error 404 on the album with the album_id is not found

	'''
	lookup_url_kwarg = 'album_id'

	def get(self, request, format=None):
		try:
			album_id = request.GET[self.lookup_url_kwarg]
		except:
			return Response({'Parameter Missing': 'Album id is required.'}, 
							status=status.HTTP_400_BAD_REQUEST)

		album_result = Album.objects.filter(unique_id=album_id)
		if album_result.exists():
			album = album_result[0]
			#private album only grant access to the owner
			if not album.public:
				if request.user != album.owner:
					return Response({'FORBIDDEN': 'You do not have permisson.'}, 
											status=status.HTTP_403_FORBIDDEN)
			
			data = AlbumSerializer(album).data

			photos_str = data.get('photos')
			photos_ids = [photo_str.split(':')[0] for photo_str in photos_str]
			photos = [Photo.objects.filter(unique_id=id)[0] for id in photos_ids]
			response_data = PhotoSerializer(photos, many=True).data
			for i in range(len(photos)):
				response_data[i]['thumb'] = photos[i].image_thumbnail.url
			
			return Response(response_data, status=status.HTTP_200_OK)
		   
			
		return Response({'Not Found': 'The Album does not exist.'}, 
							status=status.HTTP_404_NOT_FOUND)


class UploadPhotos(APIView):
	'''
		Upload photos into one of the current user's albums

		[Authentication required]
		url_param:
			'album_id'
			
		Returns:
			Success:
				status 201
				a list of ('unique_id', 'create_at', 'image', 'belong_to') and thumbnail url
			
			Failure:
				Error 400 on url_param missing
				Error 403 on the owner of the album is not the same as the request user
				Error 400 if the file uploaded is too large or have the wrong extension
				Error 404 on the album with the album_id is not found

	'''
	authentication_classes = [SessionAuthentication, BasicAuthentication]
	permission_classes = [IsAuthenticated]
	serializer_class = CreatePhotoSerializer

	lookup_url_kwarg = 'album_id'

	def post(self, request, format=None):
		try:
			album_id = request.GET[self.lookup_url_kwarg]
		except:
			return Response({'Parameter Missing': 'Album id is required.'}, 
							status=status.HTTP_400_BAD_REQUEST)

		album_result = Album.objects.filter(unique_id=album_id)
		if album_result.exists():
			album = album_result[0]

			#Only owner can upload photos
			if request.user != album.owner:
				return Response({'FORBIDDEN': 'You do not have permisson.'}, 
										status=status.HTTP_403_FORBIDDEN)
			
			response_list = []
			images = request.FILES.getlist('image')
			if not images:
				return Response({'Bad Request': "Can't upload empty file"}, status=status.HTTP_400_BAD_REQUEST)
			for image in images:
				serializer = self.serializer_class(data=request.data)
				if serializer.is_valid():
					photo = Photo(
								image=image,
								belong_to=album
					)

					try:
						photo.save()
						
					except IntegrityError:
						return Response({'Bad Request': 'You cannot upload file with the same name.'}, status=status.HTTP_400_BAD_REQUEST)

					#So that the thumbnail gets update if the original photo 
					# gets overwrite because of same name

					#update: since we no longer allow user to upload same name file, this is no longer needed
					#but I will keep it here incase we need it again in the future

					#photo.image_thumbnail.generate()

					data = PhotoSerializer(photo).data
					data['thumb'] = photo.image_thumbnail.url
					response_list.append(data)
					
				else:
					return Response({'Bad Request': 'Possibly you have the wrong file extension or '\
						'the file is too large.'}, status=status.HTTP_400_BAD_REQUEST)
			return Response(response_list, status=status.HTTP_201_CREATED)
		
		return Response({'Not Found': 'This album does not exist.'}, 
							status=status.HTTP_404_NOT_FOUND)

class DeletePhoto(APIView):
	'''
		Delete a photo for the current user

		[Authentication required]

		url_param:
			'photo_id'
			
		Returns:
			Success:
				status 200
				"msg": "Delete successfully."
			
			Failure:
				Error 400 on url_param missing
				Error 403 on the owner of the album that contains the deleting photo is not the same as the request user
				Error 404 on the photo with the photo_id is not found

	'''
	authentication_classes = [SessionAuthentication, BasicAuthentication]
	permission_classes = [IsAuthenticated]

	lookup_url_kwarg = 'photo_id'
	def delete(self, request, format=None):
		try:
			photo_id = request.GET[self.lookup_url_kwarg]
		except:
			return Response({'Parameter Missing': 'Photo id is required.'}, 
							status=status.HTTP_400_BAD_REQUEST)
		queryset = Photo.objects.filter(unique_id=photo_id)
		if queryset.exists():
			photo = queryset[0]
			if request.user != photo.belong_to.owner:
					return Response({'FORBIDDEN': 'You do not have permisson.'}, 
										status=status.HTTP_403_FORBIDDEN)
			photo.delete()
			return Response({"msg": "Delete successfully."}, status=status.HTTP_200_OK)
		return Response({'Not Found': 'The photo does not exist.'}, status=status.HTTP_404_NOT_FOUND)


class RandomPublicAlbum(APIView):
	'''
		Randomly get a public album

		url_param:
			None
			
		Returns:
			Success:
				status 200
				a list of ('unique_id', 'title', 'description', 'create_at', 'owner', 'public', 'photos')
			
			Failure:
				Error 404 on not public album available

	'''
	def get(self, request, format=None):
		album_count = Album.objects.filter(public=True).count()
		if album_count > 0:
			random_album = Album.objects.filter(public=True)[randint(0, album_count - 1)]
			return Response(AlbumSerializer(random_album).data, status=status.HTTP_200_OK) 
		return Response({'Not Found': 'No public album available.'}, status=status.HTTP_404_NOT_FOUND)

class GetFirstPhotoFromAlbum(APIView):
	'''
		Get first photo from an album

		url_param:
			None
			
		Returns:
			Success:
				status 200
				a list of ('unique_id', 'title', 'description', 'create_at', 'owner', 'public', 'photos')
			
			Failure:
				Error 400 on url_param missing
				Error 404 on not public album available

	'''
	def get(self, request, format=None):
		album_count = Album.objects.filter(public=True).count()
		if album_count > 0:
			random_album = Album.objects.filter(public=True)[randint(0, album_count - 1)]
			return Response(AlbumSerializer(random_album).data, status=status.HTTP_200_OK) 
		return Response({'Not Found': 'No public album available.'}, status=status.HTTP_404_NOT_FOUND)

class LikeOrUnlikeAPhoto(APIView):
	'''
		Like or unlike a photo depends on if the user has liked or not

		url_param:
			photo_id
			
		Returns:
			Success:
				status 200
				successful message
			
			Failure:
				Error 400 on url_param missing
				Error 400 on liking user's own photo
				Error 403 on liking a private photo
				Error 404 on photo no found

	'''
	authentication_classes = [SessionAuthentication, BasicAuthentication]
	permission_classes = [IsAuthenticated]

	lookup_url_kwarg = 'photo_id'
	def put(self, request, format=None):
		try:
			photo_id = request.GET[self.lookup_url_kwarg]
		except:
			return Response({'Parameter Missing': 'Photo id is required.'}, 
							status=status.HTTP_400_BAD_REQUEST)
		queryset = Photo.objects.filter(unique_id=photo_id)
		if queryset.exists():
			photo = queryset[0]
			#private
			if not photo.belong_to.public:
				return Response({'FORBIDDEN': 'You do not have permisson.'}, 
										status=status.HTTP_403_FORBIDDEN)
			if photo.belong_to.owner == request.user:
				return Response({'Bad Request': 'You cannot like your own photo.'}, 
							status=status.HTTP_400_BAD_REQUEST)
							 
			like, created = PhotoLike.objects.get_or_create(owner=request.user, belong_to=photo)
			if not created:
				# the user already liked this picture before
				# unlike
				like.delete()
				return Response({'msg':'Unlike successfully'}, status=status.HTTP_200_OK) 
			else:
				return Response({'msg':'like successfully'}, status=status.HTTP_200_OK)
		return Response({'Not Found': 'Photo not found.'}, status=status.HTTP_404_NOT_FOUND)

class GetUserAlreadyLikePhoto(APIView):
	'''
		To find out if the current user already likes the displayed photo or not

		url_param:
			photo_id
			
		Returns:
			Success:
				status 200
				successful message
			
			Failure:
				Error 400 on url_param missing
				Error 404 on photo no found

	'''
	authentication_classes = [SessionAuthentication, BasicAuthentication]
	permission_classes = [IsAuthenticated]

	lookup_url_kwarg = 'photo_id'
	def get(self, request, format=None):
		try:
			photo_id = request.GET[self.lookup_url_kwarg]
		except:
			return Response({'Parameter Missing': 'Photo id is required.'}, 
							status=status.HTTP_400_BAD_REQUEST)
		queryset = Photo.objects.filter(unique_id=photo_id)
		if queryset.exists():
			photo = queryset[0]
			user_likes_this = photo.likes.filter(owner=request.user) and True or False
			return Response({'user_likes_this':user_likes_this}, status=status.HTTP_200_OK) 
		return Response({'Not Found': 'Photo not found.'}, status=status.HTTP_404_NOT_FOUND)

class GetPhotoComment(APIView):
	'''
		Get comments of a photo

		url_param:
			photo_id
			
		Returns:
			Success:
				status 200
				('owner', 'timestamp', 'content', 'belong_to')
			
			Failure:
				Error 400 on url_param missing
				Error 403 on getting comments from a private photo
				Error 404 on photo no found

	'''
	authentication_classes = [SessionAuthentication, BasicAuthentication]
	permission_classes = [IsAuthenticated]

	lookup_url_kwarg = 'photo_id'
	def get(self, request, format=None):
		try:
			photo_id = request.GET[self.lookup_url_kwarg]
		except:
			return Response({'Parameter Missing': 'Photo id is required.'}, 
							status=status.HTTP_400_BAD_REQUEST)
		queryset = Photo.objects.filter(unique_id=photo_id)
		if queryset.exists():
			photo = queryset[0]
			if not photo.belong_to.public:
				return Response({'FORBIDDEN': 'You do not have permisson.'}, 
										status=status.HTTP_403_FORBIDDEN)

			comments = PhotoComment.objects.filter(belong_to=photo)
			data = CommentSerializer(comments, many=True).data
			return Response(data, status=status.HTTP_200_OK) 
		return Response({'Not Found': 'Photo not found.'}, status=status.HTTP_404_NOT_FOUND)


class CreatePhotoComment(APIView):
	'''
		Comment to a photo

		url_param:
			photo_id
			
		Returns:
			Success:
				status 200
				('owner', 'timestamp', 'content', 'belong_to')
			
			Failure:
				Error 400 on url_param missing
				Error 400 on invalid data
				Error 400 on the user has more than 2 comments on this photo already
				Error 403 on commenting a private photo
				Error 404 on photo no found

	'''
	authentication_classes = [SessionAuthentication, BasicAuthentication]
	permission_classes = [IsAuthenticated]
	serializer_class = CreateCommentSerializer

	lookup_url_kwarg = 'photo_id'
	def put(self, request, format=None):
		try:
			photo_id = request.GET[self.lookup_url_kwarg]
		except:
			return Response({'Parameter Missing': 'Photo id is required.'}, 
							status=status.HTTP_400_BAD_REQUEST)
		queryset = Photo.objects.filter(unique_id=photo_id)
		if queryset.exists():
			photo = queryset[0]
			if not photo.belong_to.public:
				return Response({'FORBIDDEN': 'You do not have permisson.'}, 
										status=status.HTTP_403_FORBIDDEN)
			if PhotoComment.objects.filter(belong_to=photo, owner=request.user).count() > 2:
				return Response({'Bad Request': 'The maximum number of comments you can have on the same \
					photo is 3'}, status=status.HTTP_400_BAD_REQUEST)

			serializer = self.serializer_class(data=request.data)
			if serializer.is_valid():
				content = serializer.data.get('content')
				comment = PhotoComment(owner=request.user, belong_to=photo, content=content)
				comment.save()
				return Response(CommentSerializer(comment).data, status=status.HTTP_200_OK) 
			return Response({'Bad Request': 'Invalid data, please make sure your comment has less than 50 words.'}, status=status.HTTP_400_BAD_REQUEST)
		return Response({'Not Found': 'Photo not found.'}, status=status.HTTP_404_NOT_FOUND)
	
class DeletePhotoComment(APIView):
	'''
		Delete a comment for the current user

		[Authentication required]

		url_param:
			'comment_id'
			
		Returns:
			Success:
				status 200
				"msg": "Delete successfully."
			
			Failure:
				Error 400 on url_param missing
				Error 403 on the owner of the comment is not the same as the request user
				Error 404 on the photo with the photo_id is not found

	'''
	authentication_classes = [SessionAuthentication, BasicAuthentication]
	permission_classes = [IsAuthenticated]

	lookup_url_kwarg = 'comment_id'
	def delete(self, request, format=None):
		try:
			comment_id = request.GET[self.lookup_url_kwarg]
		except:
			return Response({'Parameter Missing': 'Comment id is required.'}, 
							status=status.HTTP_400_BAD_REQUEST)
		queryset = PhotoComment.objects.filter(unique_id=comment_id)
		if queryset.exists():
			comment = queryset[0]
			if request.user != comment.owner:
					return Response({'FORBIDDEN': 'You do not have permisson.'}, 
										status=status.HTTP_403_FORBIDDEN)
			comment.delete()
			return Response({"msg": "Delete successfully."}, status=status.HTTP_200_OK)
		return Response({'Not Found': 'The comment does not exist.'}, status=status.HTTP_404_NOT_FOUND)