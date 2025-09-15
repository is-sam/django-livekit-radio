from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone


class RoomJoinLog(models.Model):
	user = models.ForeignKey(User, on_delete=models.CASCADE)
	frequency = models.FloatField()
	joined_at = models.DateTimeField(default=timezone.now)

	def __str__(self):
		return f"User {self.user_id} joined room at {self.frequency} Hz on {self.joined_at}" 
