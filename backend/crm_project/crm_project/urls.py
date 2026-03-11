from django.contrib import admin
from django.http import HttpResponse
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from analytics.views import DashboardStatsView

def home(request):
    return HttpResponse("CRM Django backend is running")

urlpatterns = [
    path("", home),
    path("admin/", admin.site.urls),
    path("api/", include("crm_project.api_urls")),
    path("api/stats/", DashboardStatsView.as_view(), name="dashboard-stats"),
    path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
]