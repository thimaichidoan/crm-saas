from django.urls import path, include
from rest_framework.routers import DefaultRouter

from contacts.views import ContactViewSet
from companies.views import CompanyViewSet
from tasks.views import TaskViewSet
from deals.views import DealViewSet
from analytics.views import StatsAPIView

router = DefaultRouter()
router.register(r"contacts", ContactViewSet, basename="contact")
router.register(r"companies", CompanyViewSet, basename="company")
router.register(r"tasks", TaskViewSet, basename="task")
router.register(r"deals", DealViewSet, basename="deal")

urlpatterns = [
    path("", include(router.urls)),
    path("stats/", StatsAPIView.as_view(), name="stats"),
]