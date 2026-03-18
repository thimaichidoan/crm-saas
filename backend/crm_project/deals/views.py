from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated

from .models import Deal
from .serializers import DealSerializer


class DealViewSet(viewsets.ModelViewSet):
    serializer_class = DealSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["title", "description", "stage", "company__name", "contact__first_name", "contact__last_name"]
    ordering_fields = ["id", "value", "expected_close_date", "created_at", "updated_at"]
    ordering = ["-id"]

    def get_queryset(self):
        return Deal.objects.filter(owner=self.request.user).order_by("-id")

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)