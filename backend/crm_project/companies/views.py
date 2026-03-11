from rest_framework import viewsets
from .models import Company
from .serializers import CompanySerializer

class CompanyViewSet(viewsets.ModelViewSet):
    queryset = Company.objects.all().order_by("-created_at")
    serializer_class = CompanySerializer
    search_fields = ["name", "industry", "city", "website"]
    ordering_fields = ["created_at", "name", "city"]