from rest_framework.views import APIView
from rest_framework.response import Response

from contacts.models import Contact
from companies.models import Company
from leads.models import Lead
from tasks.models import Task


class DashboardStatsView(APIView):
    permission_classes = []

    def get(self, request):
        total_contacts = Contact.objects.count()
        total_companies = Company.objects.count()
        total_leads = Lead.objects.count()

        new_leads = Lead.objects.filter(status="new").count()
        progress_leads = Lead.objects.filter(status="progress").count()
        won_leads = Lead.objects.filter(status="won").count()
        lost_leads = Lead.objects.filter(status="lost").count()

        pending_tasks = Task.objects.filter(completed=False).count()
        completed_tasks = Task.objects.filter(completed=True).count()

        conversion_rate = 0
        if total_leads > 0:
            conversion_rate = round((won_leads / total_leads) * 100, 2)

        return Response({
            "total_contacts": total_contacts,
            "total_companies": total_companies,
            "total_leads": total_leads,
            "new_leads": new_leads,
            "progress_leads": progress_leads,
            "won_leads": won_leads,
            "lost_leads": lost_leads,
            "pending_tasks": pending_tasks,
            "completed_tasks": completed_tasks,
            "conversion_rate": conversion_rate,
        })