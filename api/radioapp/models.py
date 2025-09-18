from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

class RoomJoinLog(models.Model):
	user = models.ForeignKey(User, on_delete=models.CASCADE)
	frequency = models.DecimalField(max_digits=5, decimal_places=2)
	joined_at = models.DateTimeField(default=timezone.now)
 
	class Meta:
		ordering = ['-joined_at']

	def __str__(self):
		return f"User {self.user_id} joined room at {self.frequency} Hz on {self.joined_at}" 
