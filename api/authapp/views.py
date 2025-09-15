from django.contrib.auth.models import User
from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from .serializers import RegisterSerializer

# Register endpoint: POST /api/auth/register/
class RegisterView(generics.CreateAPIView):
	queryset = User.objects.all()
	serializer_class = RegisterSerializer
	permission_classes = [permissions.AllowAny]

# "Me" endpoint: GET /api/auth/me/
# Returns info about the logged-in user
class MeView(APIView):
	permission_classes = [permissions.IsAuthenticated]

	def get(self, request):
		return Response({
			"id": request.user.id,
			"username": request.user.username,
			"email": request.user.email,
			"is_admin": request.user.is_staff,
		})
