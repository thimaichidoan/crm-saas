from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from django.http import JsonResponse

def health(request):
    return JsonResponse({"status": "ok"})

urlpatterns = [

    path("health/", health),
    path("admin/", admin.site.urls),

    path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    path("api/contacts/", include("contacts.urls")),
    path("api/companies/", include("companies.urls")),
    path("api/deals/", include("deals.urls")),
    path("api/tasks/", include("tasks.urls")),
    path("api/users/", include("users.urls")),
    path("api/analytics/", include("analytics.urls")),
    path("api/emailing/", include("emailing.urls")),
]

