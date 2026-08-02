from rest_framework import viewsets

from .models import Note
from .serializers import NoteSerializer


class NoteViewSet(viewsets.ModelViewSet):
    """Full CRUD for notes: list, create, retrieve, update, partial update, destroy."""

    queryset = Note.objects.all()
    serializer_class = NoteSerializer
