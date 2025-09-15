from django.urls import path
from .views import TokenView, RoomJoinLogListView

urlpatterns = [
    path("token", TokenView.as_view(), name="radio_token"),
    path("logs", RoomJoinLogListView.as_view(), name="join_logs"),
]
