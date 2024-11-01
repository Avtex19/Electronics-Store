from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from django.contrib.auth import authenticate
from ..models import Product, Category


class RegisterUserSerializer(serializers.ModelSerializer):
    password2 = serializers.CharField(style={'input_type': 'password'}, write_only=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password2')
        extra_kwargs = {'password': {'write_only': True}}

    def save(self, **kwargs):
        password = self.validated_data['password']
        password2 = self.validated_data['password2']
        if password != password2:
            raise serializers.ValidationError('Passwords do not match')
        if User.objects.filter(email=self.validated_data['email']).exists():
            raise serializers.ValidationError('Email is already used')

        account = User(email=self.validated_data['email'], username=self.validated_data['username'])
        account.set_password(password)
        account.save()
        return account


class LoginUserSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)
    last_login = serializers.DateTimeField(read_only=True)

    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')

        user = authenticate(username=username, password=password)

        if user is None:
            raise serializers.ValidationError('Invalid login credentials')

        attrs['user'] = user
        attrs['last_login'] = user.last_login

        return attrs



class AccountUpdateSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=False, write_only=True)
    new_password = serializers.CharField(required=False, write_only=True)
    confirm_password = serializers.CharField(required=False, write_only=True)
    username = serializers.CharField(required=False, max_length=150)
    email = serializers.EmailField(required=False)

    def validate(self, data):
        if not any(field in data for field in ['username', 'email', 'new_password']):
            raise serializers.ValidationError(
                "At least one of 'username', 'email', or 'new_password' must be provided.")
        if 'new_password' in data or 'confirm_password' in data:
            if not data.get('old_password'):
                raise serializers.ValidationError({"old_password": "Old password is required to update password."})
            if data['new_password'] != data['confirm_password']:
                raise serializers.ValidationError({"confirm_password": "Password fields didn't match."})
            validate_password(data['new_password'])

        return data

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect.")
        return value

    def validate_email(self, value):
        user = self.context['request'].user
        if User.objects.exclude(id=user.id).filter(email=value).exists():
            raise serializers.ValidationError("Email is already used.")
        if user.email == value:
            raise serializers.ValidationError("You are using the same email address.")
        return value

    def validate_username(self, value):
        user = self.context['request'].user
        if User.objects.exclude(id=user.id).filter(username=value).exists():
            raise serializers.ValidationError("Username is already used.")
        if user.username == value:
            raise serializers.ValidationError("You are using the same username.")
        return value

    def update(self, instance, validated_data):
        user = self.context['request'].user
        if 'new_password' in validated_data:
            user.set_password(validated_data['new_password'])
        if 'username' in validated_data:
            user.username = validated_data['username']
        if 'email' in validated_data:
            user.email = validated_data['email']

        instance.save()
        return instance


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('is_superuser', 'username', 'email')
