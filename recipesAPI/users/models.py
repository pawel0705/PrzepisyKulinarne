from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.
class User(AbstractUser):
    name = models.CharField(max_length=30)
    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = []

    def __str__(self):
        return "%s" % self.username

    class Meta:
        ordering = ['username', 'email']
        swappable = 'AUTH_USER_MODEL'
