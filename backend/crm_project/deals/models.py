from django.db import models
from django.contrib.auth import get_user_model
from contacts.models import Contact
from companies.models import Company

User = get_user_model()


class Deal(models.Model):
    STAGE_CHOICES = [
        ('NEW', 'New'),
        ('QUALIFIED', 'Qualified'),
        ('PROPOSAL', 'Proposal'),
        ('NEGOTIATION', 'Negotiation'),
        ('WON', 'Won'),
        ('LOST', 'Lost'),
    ]

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    value = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    stage = models.CharField(max_length=20, choices=STAGE_CHOICES, default='NEW')

    contact = models.ForeignKey(
        Contact,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='deals'
    )
    company = models.ForeignKey(
        Company,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='deals'
    )
    owner = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='deals'
    )

    expected_close_date = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} - {self.stage}"