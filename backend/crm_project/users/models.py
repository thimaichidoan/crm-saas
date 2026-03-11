from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLE_ADMIN = "admin"
    ROLE_SALES = "sales"
    ROLE_USER = "user"

    ROLE_CHOICES = (
        (ROLE_ADMIN, "Admin"),
        (ROLE_SALES, "Commercial"),
        (ROLE_USER, "Utilisateur"),
    )

    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default=ROLE_USER)