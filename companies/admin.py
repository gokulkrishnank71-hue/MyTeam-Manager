from django.contrib import admin

from .models import Company, CompanyMember


@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ("name", "email", "phone", "created_at")


@admin.register(CompanyMember)
class CompanyMemberAdmin(admin.ModelAdmin):
    list_display = ("company", "user", "role", "joined_at")