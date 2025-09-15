from django.contrib.auth.models import User
from rest_framework import serializers

class RegisterSerializer(serializers.ModelSerializer):
	password = serializers.CharField(write_only=True, min_length=8)

	def validate_password(self, value):
		import re
		# At least 8 characters, one uppercase, one lowercase, one digit, one special character
		if len(value) < 8:
			raise serializers.ValidationError("Password must be at least 8 characters long.")
		if not re.search(r"[A-Z]", value):
			raise serializers.ValidationError("Password must contain at least one uppercase letter.")
		if not re.search(r"[a-z]", value):
			raise serializers.ValidationError("Password must contain at least one lowercase letter.")
		if not re.search(r"[0-9]", value):
			raise serializers.ValidationError("Password must contain at least one digit.")
		if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", value):
			raise serializers.ValidationError("Password must contain at least one special character.")
		return value

	class Meta:
		model = User
		fields = ["username", "email", "password"]

	def create(self, validated_data):
		user = User(
			username=validated_data["username"],
			email=validated_data.get("email", ""),
		)
		user.set_password(validated_data["password"])
		user.save()
		return user
