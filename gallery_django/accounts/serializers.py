from rest_framework import serializers
from django.contrib.auth import get_user_model, authenticate, password_validation
from django.core import exceptions
from django.contrib.auth.models import User

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

    def validate(self, data):
        #Can not use the create_user method here because it will save the user right away
        #even the validation fails
        user = User(**data)

        password = data['password']

        errors = {}
        try:
            # validate the password and catch the exception
            password_validation.validate_password(password=password, user=user)

        # the exception raised here is different than serializers.ValidationError
        except exceptions.ValidationError as e:
            errors['password'] = e.messages[0]

        if errors:
            raise serializers.ValidationError(errors)

        return super(RegisterSerializer, self).validate(data)

    def create(self, validated_data):
        user = get_user_model().objects.create_user(
            username=validated_data['username'], 
            password=validated_data['password'],
            )

        return user
#Login Serializer
class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=15)
    password = serializers.CharField(max_length=15)
    
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
    
    def validate(self, data):
        user = self.context['request'].user
        password = data['new_password1']

        errors = {}
        try:
            # validate the password and catch the exception
            password_validation.validate_password(password=password, user=user)

        # the exception raised here is different than serializers.ValidationError
        except exceptions.ValidationError as e:
            errors['password'] = e.messages[0]

        if errors:
            raise serializers.ValidationError(errors)

        return super(ChangePasswordSerializer, self).validate(data)
