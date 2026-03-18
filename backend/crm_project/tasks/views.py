from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated

from .models import Task
from .serializers import TaskSerializer


class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["title", "description"]
    ordering_fields = ["id", "due_date", "completed", "created_at"]
    ordering = ["-id"]

    def get_queryset(self):
        queryset = Task.objects.filter(user=self.request.user).order_by("-id")

        completed = self.request.query_params.get("completed")
        if completed is not None:
            if completed.lower() == "true":
                queryset = queryset.filter(completed=True)
            elif completed.lower() == "false":
                queryset = queryset.filter(completed=False)

        return queryset

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)