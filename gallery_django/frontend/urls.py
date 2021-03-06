from django.urls import path
from . import views
urlpatterns = [
    path('', views.index),
	path('home/', views.index),
    path('authenticate/', views.index),
    path('account/<str:username>', views.index),
	path('collection/<str:username>/', views.index),
	path('collection/<str:username>/<uuid:album_id>', views.index),
]