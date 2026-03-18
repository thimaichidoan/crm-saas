from django.contrib import admin
from .models import Deal


@admin.register(Deal)
class DealAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'stage', 'value', 'owner', 'company', 'contact', 'is_active', 'created_at')
    list_filter = ('stage', 'is_active', 'created_at')
    search_fields = ('title', 'description')