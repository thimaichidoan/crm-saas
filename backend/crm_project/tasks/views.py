from rest_framework import viewsets
from .models import Task
from .serializers import TaskSerializer

class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all().order_by("-created_at")
    serializer_class = TaskSerializer
    filterset_fields = ["completed", "user", "lead"]
    ordering_fields = ["created_at", "due_date", "completed"]