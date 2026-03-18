from django.conf import settings
from django.core.mail import send_mail
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def send_email_view(request):
    to_email = request.data.get("to")
    subject = request.data.get("subject")
    message = request.data.get("message")

    if not to_email or not subject or not message:
        return Response(
            {"detail": "Les champs to, subject et message sont obligatoires."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[to_email],
            fail_silently=False,
        )

        return Response(
            {"detail": "Email envoyé avec succès."},
            status=status.HTTP_200_OK,
        )
    except Exception as e:
        return Response(
            {"detail": f"Erreur lors de l’envoi : {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )