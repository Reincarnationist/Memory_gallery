from django.contrib.auth import login, logout, update_session_auth_hash
from django.http import JsonResponse
from django.middleware.csrf import get_token
from rest_framework.authentication import SessionAuthentication, BasicAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import ChangePasswordSerializer, UserSerializer, \
	RegisterSerializer, LoginSerializer

#csrf token
def GetCsrf(request):
	return JsonResponse({'csrfToken': get_token(request)})

class RegisterView(APIView):
	serializer_class = RegisterSerializer

	def post(self, request, format=None):
		serializer = self.serializer_class(data=request.data)
		if serializer.is_valid():
			user = serializer.save()
			login(request, user)
			return Response({
				"user": UserSerializer(user).data},status=status.HTTP_201_CREATED)
				
		return Response({"Bad Request": serializer.errors.get('password',"Invalid Data...")},
							status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
	serializer_class = LoginSerializer

	def post(self, request, format=None):
		serializer = self.serializer_class(data=request.data)
		if serializer.is_valid():
			user = serializer.validated_data
			login(request, user)
			return Response({"user": UserSerializer(user).data},
							status=status.HTTP_200_OK)

		return Response({
			"Bad Request": serializer.errors.get("non_field_errors", "Invalid Data...")},
							status=status.HTTP_400_BAD_REQUEST)

class LogoutView(APIView):
	authentication_classes = [SessionAuthentication, BasicAuthentication]
	permission_classes = [IsAuthenticated]

	def post(self, request, format=None):
		logout(request)
		return Response({"Msg": "Successfully log out"},
							status=status.HTTP_200_OK)

class ChangePasswordView(APIView):
	authentication_classes = [SessionAuthentication, BasicAuthentication]
	permission_classes = [IsAuthenticated]
	serializer_class = ChangePasswordSerializer

	def put(self, request, format=None):
		user = request.user
		if not user.check_password(request.data.get('old_password')):
			return Response({"Bad Request": "Wrong password."},
						status=status.HTTP_400_BAD_REQUEST)
		elif request.data.get('new_password1') != request.data.get('new_password2'):
				return Response({"Bad Request": "Password fields must match."},
							status=status.HTTP_400_BAD_REQUEST)
		elif request.data.get('old_password') == request.data.get('new_password1'):
			return Response({"Bad Request": "Old password can not be the same as previous one."},
						status=status.HTTP_400_BAD_REQUEST)

		context = {'request':request}
		serializer = self.serializer_class(data=request.data, context=context)

		if serializer.is_valid():
			new_password1 = serializer.data.get('new_password1')
			user.set_password(new_password1)
			user.save()
			update_session_auth_hash(request, user)
			return Response({'Message': 'Password update successfully.'}, status=status.HTTP_200_OK)
			
		return Response({"Bad Request": serializer.errors.get("password", "Invalid Data")},
							status=status.HTTP_400_BAD_REQUEST)

class DeleteUserView(APIView):
	authentication_classes = [SessionAuthentication, BasicAuthentication]
	permission_classes = [IsAuthenticated]

	def delete(self, request, format=None):
		self.request.user.delete()
		return Response({'Message': 'Delete successfully.'}, status=status.HTTP_200_OK)

class SessionView(APIView):
	authentication_classes = [SessionAuthentication, BasicAuthentication]
	permission_classes = [IsAuthenticated]

	@staticmethod
	def get(request, format=None):
		return Response({'isAuthenticated': True}, status=status.HTTP_200_OK)


class WhoAmIView(APIView):
	authentication_classes = [SessionAuthentication, BasicAuthentication]
	permission_classes = [IsAuthenticated]

	@staticmethod
	def get(request, format=None):
		return Response({'username': request.user.username}, 
						status=status.HTTP_200_OK)
