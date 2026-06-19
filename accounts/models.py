from django.contrib.auth.models import AbstractUser
from django.db import models

#______________________User_Table______________
class User(AbstractUser):
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    updated_at = models.DateTimeField(auto_now=True)


#_________________UserProfile_table____________________

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    job_title = models.CharField(max_length=100, blank=True, null=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.user.username