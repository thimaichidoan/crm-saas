from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated

from .models import Contact
from .serializers import ContactSerializer


class ContactViewSet(viewsets.ModelViewSet):
    serializer_class = ContactSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = [
        "first_name",
        "last_name",
        "email",
        "phone",
        "notes",
        "company__name",
        "contact_type",
    ]
    ordering_fields = ["id", "first_name", "last_name", "created_at"]
    ordering = ["-id"]

    def get_queryset(self):
        return Contact.objects.filter(user=self.request.user).order_by("-id")

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)