from rest_framework import serializers
from .models import Deal


class DealSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source="company.name", read_only=True)
    owner_username = serializers.CharField(source="owner.username", read_only=True)

    contact_name = serializers.SerializerMethodField()

    class Meta:
        model = Deal
        fields = [
            "id",
            "title",
            "description",
            "value",
            "stage",
            "contact",
            "contact_name",
            "company",
            "company_name",
            "owner",
            "owner_username",
            "expected_close_date",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["owner", "created_at", "updated_at"]

    def get_contact_name(self, obj):
        if obj.contact:
            return f"{obj.contact.first_name} {obj.contact.last_name}"
        return None