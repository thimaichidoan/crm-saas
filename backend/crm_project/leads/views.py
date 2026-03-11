from rest_framework import viewsets
from .models import Lead
from .serializers import LeadSerializer

class LeadViewSet(viewsets.ModelViewSet):
    queryset = Lead.objects.all().order_by("-created_at")
    serializer_class = LeadSerializer
    filterset_fields = ["status", "contact"]
    ordering_fields = ["created_at", "value_estimate", "status"]