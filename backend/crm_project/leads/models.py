from django.conf import settings
from django.db import models
from contacts.models import Contact

class Lead(models.Model):
    STATUS_NEW = "new"
    STATUS_PROGRESS = "progress"
    STATUS_WON = "won"
    STATUS_LOST = "lost"

    STATUS_CHOICES = (
        (STATUS_NEW, "Nouveau"),
        (STATUS_PROGRESS, "En cours"),
        (STATUS_WON, "Gagné"),
        (STATUS_LOST, "Perdu"),
    )

    contact = models.ForeignKey(Contact, on_delete=models.CASCADE, related_name="leads")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_NEW)
    source = models.CharField(max_length=120, blank=True)  # ex: Facebook, Google, Salon
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="assigned_leads"
    )
    value_estimate = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Lead {self.contact} ({self.status})"