from rest_framework import viewsets, filters
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from contacts.models import Contact
from companies.models import Company
from leads.models import Lead
from tasks.models import Task
from deals.models import Deal

from contacts.serializers import ContactSerializer
from companies.serializers import CompanySerializer
from leads.serializers import LeadSerializer
from tasks.serializers import TaskSerializer
from deals.serializers import DealSerializer


class ContactViewSet(viewsets.ModelViewSet):
    queryset = Contact.objects.all().order_by("-id")
    serializer_class = ContactSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ["first_name", "last_name", "email", "phone"]


class CompanyViewSet(viewsets.ModelViewSet):
    queryset = Company.objects.all().order_by("-id")
    serializer_class = CompanySerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ["name", "website", "industry", "city"]


class LeadViewSet(viewsets.ModelViewSet):
    serializer_class = LeadSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Lead.objects.all().order_by("-id")
        status_value = self.request.query_params.get("status")
        if status_value:
            queryset = queryset.filter(status=status_value)
        return queryset


class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Task.objects.all().order_by("-id")
        completed_value = self.request.query_params.get("completed")

        if completed_value == "true":
            queryset = queryset.filter(completed=True)
        elif completed_value == "false":
            queryset = queryset.filter(completed=False)

        return queryset


class DealViewSet(viewsets.ModelViewSet):
    queryset = Deal.objects.all().order_by("-id")
    serializer_class = DealSerializer
    permission_classes = [IsAuthenticated]


class StatsAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        total_contacts = Contact.objects.count()
        total_companies = Company.objects.count()
        total_leads = Lead.objects.count()
        completed_tasks = Task.objects.filter(completed=True).count()
        pending_tasks = Task.objects.filter(completed=False).count()

        won_leads = Lead.objects.filter(status="won").count()
        conversion_rate = 0
        if total_leads > 0:
            conversion_rate = round((won_leads / total_leads) * 100, 2)

        return Response({
            "total_contacts": total_contacts,
            "total_companies": total_companies,
            "conversion_rate": conversion_rate,
            "pending_tasks": pending_tasks,
            "completed_tasks": completed_tasks,
        })