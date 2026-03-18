from django.db.models import Sum
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from contacts.models import Contact
from companies.models import Company
from deals.models import Deal
from tasks.models import Task


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def stats_view(request):
    user = request.user

    total_contacts = Contact.objects.filter(user=user).count()

    # Company n'a pas de champ user dans ton modèle actuel
    total_companies = Company.objects.count()

    total_deals = Deal.objects.filter(owner=user).count()

    deals_won = Deal.objects.filter(owner=user, stage="WON").count()
    deals_lost = Deal.objects.filter(owner=user, stage="LOST").count()

    conversion_rate = 0
    if total_deals > 0:
        conversion_rate = round((deals_won / total_deals) * 100, 2)

    pending_tasks = Task.objects.filter(user=user, completed=False).count()
    completed_tasks = Task.objects.filter(user=user, completed=True).count()

    revenue = (
        Deal.objects.filter(owner=user, stage="WON")
        .aggregate(total=Sum("value"))["total"]
        or 0
    )

    return Response({
        "total_contacts": total_contacts,
        "total_companies": total_companies,
        "total_deals": total_deals,
        "conversion_rate": conversion_rate,
        "pending_tasks": pending_tasks,
        "completed_tasks": completed_tasks,
        "deals_won": deals_won,
        "deals_lost": deals_lost,
        "revenue": revenue,
    })