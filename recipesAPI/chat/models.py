from django.db import models
from users.models import User


class Message(models.Model):

    from_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="messages_sent")
    to_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="messages_received")

    message = models.CharField(max_length=300)

    date = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date']