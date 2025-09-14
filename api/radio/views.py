from django.contrib.auth.models import User
from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from .serializers import RegisterSerializer
from livekit import api
from dotenv import load_dotenv
import os

load_dotenv()

# Create your views here.

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
        })

class RadioTokenView(APIView):
    # permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        frequency = request.data.get("frequency")
        try:
            frequency = float(frequency)
        except (TypeError, ValueError):
            return Response({"error": "Invalid frequency"}, status=400)

        api_key = os.getenv("LIVEKIT_API_KEY")
        api_secret = os.getenv("LIVEKIT_API_SECRET")
        if not api_key or not api_secret:
            return Response({"error": "LiveKit API credentials not set"}, status=500)

        try:
            identity = str(request.user.id)
            room_name = f"freq-{frequency}"

            token = api.AccessToken() \
                .with_identity(identity) \
                .with_name(request.user.username) \
                .with_grants(api.VideoGrants(
                    room_join=True,
                    room=room_name,
                ))
            jwt_token = token.to_jwt()

            return Response({"token": jwt_token, "room": room_name})
        except Exception as e:
            return Response({"error": str(e)}, status=500)