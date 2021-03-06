from django.urls import path
from . import views


urlpatterns = [
    path('users/', views.UserList.as_view()),
    path('user/', views.UserDetailView.as_view()),
    path('public-albums/', views.GetAllNonEmptyPublicAlbums.as_view()),
    path('get-my-albums/', views.GetUserOwnAlbums.as_view()),
    path('get-user-public-albums/', views.GetOtherUserNonEmptyPublicAlbums.as_view()),
    path('create-album/', views.CreateAlbum.as_view()),
    path('update-album', views.UpdateAlbum.as_view()),
    path('delete-album/', views.DeleteAlbum.as_view()),
	path('random-public-album/', views.RandomPublicAlbum.as_view()),
    path('get-photo/', views.GetPhotoDetail.as_view()),
    path('get-photo-from-album/', views.GetAllPhotoDetailFromAlbum.as_view()),
    path('upload-photo/', views.UploadPhotos.as_view()),
    path('delete-photo/', views.DeletePhoto.as_view()),
	path('like-unlike-photo/', views.LikeOrUnlikeAPhoto.as_view()),
	path('already-like-photo/', views.GetUserAlreadyLikePhoto.as_view()),
	path('get-comment/', views.GetPhotoComment.as_view()),
	path('create-comment/', views.CreatePhotoComment.as_view()),
	path('delete-comment/', views.DeletePhotoComment.as_view()),
]