from rest_framework import viewsets
from .models import Contact
from .serializers import ContactSerializer

class ContactViewSet(viewsets.ModelViewSet):
    queryset = Contact.objects.all().order_by("-created_at")
    serializer_class = ContactSerializer
    search_fields = ["first_name", "last_name", "email", "phone"]
    ordering_fields = ["created_at", "last_name", "first_name"]