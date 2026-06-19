from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import User, UserProfile


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        ("Extra Info", {"fields": ("phone_number", "updated_at")}),
    )

    add_fieldsets = UserAdmin.add_fieldsets + (
        ("Extra Info", {"fields": ("email", "phone_number")}),
    )

    readonly_fields = ("updated_at",)


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "job_title", "updated_at")
    readonly_fields = ("updated_at",)