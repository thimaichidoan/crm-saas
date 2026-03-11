from rest_framework.routers import DefaultRouter
from contacts.views import ContactViewSet
from companies.views import CompanyViewSet
from leads.views import LeadViewSet
from tasks.views import TaskViewSet

router = DefaultRouter()
router.register(r"contacts", ContactViewSet, basename="contacts")
router.register(r"companies", CompanyViewSet, basename="companies")
router.register(r"leads", LeadViewSet, basename="leads")
router.register(r"tasks", TaskViewSet, basename="tasks")

urlpatterns = router.urls