from django.db import models


class Note(models.Model):
    """A single note as used by the Angular notes app."""

    title = models.CharField(max_length=200)
    content = models.TextField(blank=True)
    marked = models.BooleanField(default=False)
    trash = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self) -> str:
        return self.title
