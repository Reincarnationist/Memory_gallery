from django.urls import path
from . import views

urlpatterns = [
    path('csrf/', views.GetCsrf),
    path('register/', views.RegisterView.as_view()),
    path('login/', views.LoginView.as_view()),
    path('logout/', views.LogoutView.as_view()),
    path('change-password/', views.ChangePasswordView.as_view()),
    path('delete-user/', views.DeleteUserView.as_view()),
    path('session/', views.SessionView.as_view()),
    path('whoami/', views.WhoAmIView.as_view()),
]
