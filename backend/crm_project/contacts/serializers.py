from rest_framework import serializers
from .models import Contact


class ContactSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source="company.name", read_only=True)

    class Meta:
        model = Contact
        fields = [
            "id",
            "first_name",
            "last_name",
            "email",
            "phone",
            "company",
            "company_name",
            "contact_type",
            "notes",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]