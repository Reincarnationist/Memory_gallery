from rest_framework import serializers
from django.contrib.auth import get_user_model, authenticate, password_validation
from rest_framework.fields import CurrentUserDefault

#User Serializer
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = get_user_model()
        fields = ('id', 'username')
#Register Serializer
class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = get_user_model()
        fields = ('id', 'username', 'password')
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def create(self, validated_data):
        user = get_user_model().objects.create_user(
            username=validated_data['username'], 
            password=validated_data['password'],
            )

        return user
#Login Serializer
class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()
    
    def validate(self, data):
        user = authenticate(**data)

        if user and user.is_active:
            return user
        
        raise serializers.ValidationError('Incorrect Credentials')

#Change Password Serializer
class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField()
    new_password1 = serializers.CharField(max_length=15)
    new_password2 = serializers.CharField(max_length=15)
