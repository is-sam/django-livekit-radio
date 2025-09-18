from django.conf import settings
from .models import RoomJoinLog
from .serializers import RoomJoinLogSerializer, FrequencyTokenSerializer
from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from livekit import api

class TokenView(APIView):
    """
    API endpoint to generate a LiveKit access token for a user to join a room based on frequency.
    Requires authentication.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        """
        Generate a LiveKit access token for the authenticated user.
        Expects 'frequency' in the request data.
        """
        serializer = FrequencyTokenSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        frequency = serializer.validated_data['frequency']

        api_key = getattr(settings, "LIVEKIT_API_KEY", None)
        api_secret = getattr(settings, "LIVEKIT_API_SECRET", None)
        if not api_key or not api_secret:
            return Response({"error": "LiveKit API credentials not set"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        room_name = f"freq-{frequency}"

        try:
            identity = str(request.user.id)
            token = api.AccessToken(api_key=api_key, api_secret=api_secret) \
                .with_identity(identity) \
                .with_name(request.user.username) \
                .with_grants(api.VideoGrants(
                    room_join=True,
                    room=room_name,
                ))
            jwt_token = token.to_jwt()

            # Log the room join request
            RoomJoinLog.objects.create(
                user=request.user,
                frequency=frequency
            )

            return Response({"token": jwt_token, "room": room_name}, status=status.HTTP_200_OK)
        except api.LiveKitException as e:
            return Response({"error": str(e)}, status=status.HTTP_502_BAD_GATEWAY)
        except Exception:
            return Response({"error": "Internal server error"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class RoomJoinLogListView(generics.ListAPIView):
    """
    Admin-only endpoint to list all room join logs, paginated and ordered by join time.
    """
    permission_classes = [permissions.IsAdminUser]
    queryset = RoomJoinLog.objects.select_related('user')
    serializer_class = RoomJoinLogSerializer