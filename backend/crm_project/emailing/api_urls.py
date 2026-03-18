from django.urls import path, include
from rest_framework.routers import DefaultRouter

urlpatterns = [
    path("contacts/", include("contacts.urls")),
    path("companies/", include("companies.urls")),
    path("tasks/", include("tasks.urls")),
    path("deals/", include("deals.urls")),
    path("analytics/", include("analytics.urls")),
    path("emailing/", include("emailing.urls")),
]