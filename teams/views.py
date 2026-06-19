from django.contrib import messages
from django.contrib.auth import get_user_model
from django.contrib.auth.decorators import login_required
from django.shortcuts import redirect, render

from companies.models import CompanyMember
from tasks.models import Task
from .models import Team, TeamMember


User = get_user_model()


def _can_manage_company_teams(company_member):
    # Company admin can create, update, and delete team records.
    return company_member and company_member.role == "company_admin"


def _lead_team_ids(user, company):
    # Lead can manage members only inside teams where they are the lead.
    return TeamMember.objects.filter(
        user=user,
        role="lead",
        team__company=company,
    ).values_list("team_id", flat=True)


def _manageable_team_queryset(company, can_manage_teams, lead_team_ids):
    # These are the teams where the user is allowed to add or edit members.
    if can_manage_teams:
        return Team.objects.filter(company=company)

    return Team.objects.filter(company=company, id__in=lead_team_ids)


def _create_team(request, company, can_manage_teams):
    # C in CRUD for Team: creates a new team for the company.
    if not can_manage_teams:
        messages.error(request, "Only company admin can create teams.")
        return redirect("teams")

    name = request.POST.get("name", "").strip()
    department = request.POST.get("department", "").strip()
    description = request.POST.get("description", "").strip()

    if not name:
        messages.error(request, "Team name is required.")
        return redirect("teams")

    Team.objects.create(
        company=company,
        name=name,
        department=department,
        description=description,
    )
    messages.success(request, "Team created successfully.")
    return redirect("teams")


def _update_team(request, company, can_manage_teams):
    # U in CRUD for Team: updates team name, department, and description.
    if not can_manage_teams:
        messages.error(request, "Only company admin can update teams.")
        return redirect("teams")

    team = Team.objects.filter(
        id=request.POST.get("team_id"),
        company=company,
    ).first()

    if not team:
        messages.error(request, "Team not found.")
        return redirect("teams")

    name = request.POST.get("name", "").strip()
    department = request.POST.get("department", "").strip()
    description = request.POST.get("description", "").strip()

    if not name:
        messages.error(request, "Team name is required.")
        return redirect("teams")

    team.name = name
    team.department = department
    team.description = description
    team.save()

    messages.success(request, "Team updated successfully.")
    return redirect("teams")


def _delete_team(request, company, can_manage_teams):
    # D in CRUD for Team: deletes a team record from the company.
    if not can_manage_teams:
        messages.error(request, "Only company admin can delete teams.")
        return redirect("teams")

    team = Team.objects.filter(
        id=request.POST.get("team_id"),
        company=company,
    ).first()

    if not team:
        messages.error(request, "Team not found.")
        return redirect("teams")

    team.delete()
    messages.success(request, "Team deleted successfully.")
    return redirect("teams")


def _get_company_user(company, user_id):
    # This keeps member CRUD inside the same company.
    company_user = CompanyMember.objects.filter(
        company=company,
        user_id=user_id,
    ).select_related("user").first()

    return company_user.user if company_user else None


def _create_team_member(request, company, manageable_teams):
    # C in CRUD for TeamMember: adds a user to a team.
    team = manageable_teams.filter(id=request.POST.get("team")).first()
    user = _get_company_user(company, request.POST.get("user"))
    role = request.POST.get("role", "member")

    if not team or not user:
        messages.error(request, "Please select a valid team and company user.")
        return redirect("teams")

    if role not in dict(TeamMember.ROLE_CHOICES):
        role = "member"

    if TeamMember.objects.filter(team=team, user=user).exists():
        messages.error(request, "This user is already in that team.")
        return redirect("teams")

    TeamMember.objects.create(team=team, user=user, role=role)
    messages.success(request, "Member added successfully.")
    return redirect("teams")


def _update_team_member(request, company, manageable_teams):
    # U in CRUD for TeamMember: changes member, team, or role.
    team_member = TeamMember.objects.filter(
        id=request.POST.get("member_id"),
        team__in=manageable_teams,
        team__company=company,
    ).first()

    new_team = manageable_teams.filter(id=request.POST.get("team")).first()
    user = _get_company_user(company, request.POST.get("user"))
    role = request.POST.get("role", "member")

    if not team_member or not new_team or not user:
        messages.error(request, "Please select a valid member, team, and user.")
        return redirect("teams")

    if role not in dict(TeamMember.ROLE_CHOICES):
        role = "member"

    duplicate_member = TeamMember.objects.filter(team=new_team, user=user).exclude(
        id=team_member.id,
    ).exists()

    if duplicate_member:
        messages.error(request, "This user is already in that team.")
        return redirect("teams")

    team_member.team = new_team
    team_member.user = user
    team_member.role = role
    team_member.save()

    messages.success(request, "Member updated successfully.")
    return redirect("teams")


def _delete_team_member(request, company, manageable_teams):
    # D in CRUD for TeamMember: removes a user from a team.
    team_member = TeamMember.objects.filter(
        id=request.POST.get("member_id"),
        team__in=manageable_teams,
        team__company=company,
    ).first()

    if not team_member:
        messages.error(request, "Team member not found.")
        return redirect("teams")

    team_member.delete()
    messages.success(request, "Member removed successfully.")
    return redirect("teams")


@login_required(login_url="sign_in")
def teams(request):
    # This section finds the logged-in user's company role.
    company_member = CompanyMember.objects.filter(
        user=request.user,
    ).select_related("company").first()

    if not company_member:
        return render(request, "teams.html", {
            "team_rows": [],
            "member_rows": [],
            "team_options": Team.objects.none(),
            "available_users": User.objects.none(),
            "role_choices": TeamMember.ROLE_CHOICES,
            "can_manage_teams": False,
            "can_manage_members": False,
        })

    company = company_member.company
    can_manage_teams = _can_manage_company_teams(company_member)
    lead_team_ids = _lead_team_ids(request.user, company)
    manageable_teams = _manageable_team_queryset(
        company,
        can_manage_teams,
        lead_team_ids,
    )
    can_manage_members = can_manage_teams or manageable_teams.exists()

    if request.method == "POST":
        form_name = request.POST.get("form_name")

        if form_name == "create_team":
            return _create_team(request, company, can_manage_teams)

        if form_name == "update_team":
            return _update_team(request, company, can_manage_teams)

        if form_name == "delete_team":
            return _delete_team(request, company, can_manage_teams)

        if form_name == "create_team_member":
            return _create_team_member(request, company, manageable_teams)

        if form_name == "update_team_member":
            return _update_team_member(request, company, manageable_teams)

        if form_name == "delete_team_member":
            return _delete_team_member(request, company, manageable_teams)

    # R in CRUD for Team: company admin sees company teams; lead/member sees own teams.
    if can_manage_teams:
        visible_teams = Team.objects.filter(company=company)
    else:
        visible_teams = Team.objects.filter(
            company=company,
            teammember__user=request.user,
        ).distinct()

    visible_teams = visible_teams.order_by("name")

    # R in CRUD for TeamMember: loads members from the teams visible to this user.
    visible_members = TeamMember.objects.filter(
        team__in=visible_teams,
    ).select_related("team", "user").order_by("team__name", "user__username")

    available_users = User.objects.filter(
        companymember__company=company,
    ).distinct().order_by("username")

    team_rows = []
    for team in visible_teams:
        member_count = TeamMember.objects.filter(team=team).count()
        active_task_count = Task.objects.filter(
            project__team=team,
        ).exclude(status="done").count()
        capacity_percent = min(active_task_count * 20, 100)

        if capacity_percent >= 80:
            dot_class = "orange"
        elif capacity_percent >= 50:
            dot_class = "blue"
        else:
            dot_class = "green"

        team_rows.append({
            "id": team.id,
            "name": team.name,
            "department": team.department or "No department",
            "department_value": team.department or "",
            "description": team.description or "No description added",
            "description_value": team.description or "",
            "member_count": member_count,
            "active_task_count": active_task_count,
            "capacity_percent": capacity_percent,
            "dot_class": dot_class,
        })

    member_rows = []
    for team_member in visible_members:
        active_task_count = Task.objects.filter(
            assigned_to=team_member.user,
            project__team=team_member.team,
        ).exclude(status="done").count()
        workload_percent = min(active_task_count * 25, 100)

        if workload_percent >= 75:
            status_label = "Busy"
            status_class = "status-progress"
        else:
            status_label = "Available"
            status_class = "status-online"

        member_rows.append({
            "id": team_member.id,
            "user_id": team_member.user.id,
            "username": team_member.user.username,
            "email": team_member.user.email or "No email added",
            "team_id": team_member.team.id,
            "team_name": team_member.team.name,
            "role_value": team_member.role,
            "role_label": team_member.get_role_display(),
            "workload_percent": workload_percent,
            "active_task_count": active_task_count,
            "status_label": status_label,
            "status_class": status_class,
        })

    context = {
        "team_rows": team_rows,
        "member_rows": member_rows,
        "team_options": manageable_teams.order_by("name"),
        "available_users": available_users,
        "role_choices": TeamMember.ROLE_CHOICES,
        "can_manage_teams": can_manage_teams,
        "can_manage_members": can_manage_members,
    }
    return render(request, "teams.html", context)
