from django.contrib import admin

from .models import Task, TaskComment, TaskFile


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ("title", "project", "assigned_to", "status", "priority", "due_date")


@admin.register(TaskComment)
class TaskCommentAdmin(admin.ModelAdmin):
    list_display = ("task", "user", "created_at")


@admin.register(TaskFile)
class TaskFileAdmin(admin.ModelAdmin):
    list_display = ("task", "uploaded_by", "uploaded_at")