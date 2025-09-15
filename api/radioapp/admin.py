
from django.contrib import admin
from .models import RoomJoinLog

@admin.register(RoomJoinLog)
class RoomJoinLogAdmin(admin.ModelAdmin):
	list_display = ("user", "frequency", "joined_at")
