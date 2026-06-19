from django.contrib import admin

from .models import Team, TeamMember


@admin.register(Team)
class TeamAdmin(admin.ModelAdmin):
    list_display = ("name", "company", "department", "created_at")


@admin.register(TeamMember)
class TeamMemberAdmin(admin.ModelAdmin):
    list_display = ("team", "user", "role", "joined_at")