from rest_framework import serializers

from .models import Note


class NoteSerializer(serializers.ModelSerializer):
    """Maps a Note to the JSON shape expected by the Angular Note interface."""

    class Meta:
        model = Note
        fields = ['id', 'title', 'content', 'marked', 'trash']
        read_only_fields = ['id']
