from rest_framework import serializers
from .models import RoomJoinLog
from decimal import Decimal

class FrequencyTokenSerializer(serializers.Serializer):
    # 3 digits + 2 decimals (e.g., 123.45)
    frequency = serializers.DecimalField(
        max_digits=5,
        decimal_places=2,
        min_value=Decimal("0.00"),
        max_value=Decimal("999.99"),
        required=True
    )

    def validate_frequency(self, value):
        return value

class RoomJoinLogSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username')

    class Meta:
        model = RoomJoinLog
        fields = ['id', 'username', 'frequency', 'joined_at']

