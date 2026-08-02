from django.contrib import admin

from .models import Note


@admin.register(Note)
class NoteAdmin(admin.ModelAdmin):
    list_display = ['id', 'title', 'marked', 'trash', 'created_at']
    list_filter = ['marked', 'trash']
    search_fields = ['title', 'content']
