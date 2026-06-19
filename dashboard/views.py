from datetime import timedelta

from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.shortcuts import redirect, render
from django.utils import timezone

from companies.models import CompanyMember
from projects.models import Project
from tasks.models import Task
from teams.models import TeamMember


def _status_badge_class(status):
    # This function decides which CSS class should be used for each task status.
    status_classes = {
        "todo": "status-todo",
        "in_progress": "status-progress",
        "done": "status-done",
    }
    return status_classes.get(status, "status-todo")


def _priority_badge_class(priority):
    # This function decides which CSS class should be used for each task priority.
    priority_classes = {
        "low": "status-done",
        "medium": "status-review",
        "high": "status-high",
    }
    return priority_classes.get(priority, "status-review")


def _create_task_for_lead(request, lead_team_member):
    # This function creates a new task only inside the lead's own team.
    if not lead_team_member:
        messages.error(request, "You must be a team lead before assigning tasks.")
        return redirect("dashboard")

    title = request.POST.get("title", "").strip()
    description = request.POST.get("description", "").strip()
    project_id = request.POST.get("project")
    assigned_to_id = request.POST.get("assigned_to")
    status = request.POST.get("status", "todo")
    priority = request.POST.get("priority", "medium")
    due_date = request.POST.get("due_date") or None

    project = Project.objects.filter(
        id=project_id,
        team=lead_team_member.team,
    ).first()
    assigned_member = TeamMember.objects.filter(
        team=lead_team_member.team,
        user_id=assigned_to_id,
    ).first()

    if not title or not project or not assigned_member:
        messages.error(request, "Please add a title, project, and team member.")
        return redirect("dashboard")

    Task.objects.create(
        project=project,
        assigned_to=assigned_member.user,
        title=title,
        description=description,
        status=status,
        priority=priority,
        due_date=due_date,
    )
    messages.success(request, "Task assigned successfully.")
    return redirect("dashboard")


@login_required(login_url="sign_in")
def dashboard(request):
    # This section finds the logged-in user's company role.
    company_member = CompanyMember.objects.filter(user=request.user).first()

    if company_member:
        if company_member.role == "company_admin":
            return render(request, "role_dashboards/company_admin_dashboard.html")

        if company_member.role == "lead":
            # This section finds the team where the logged-in user is the lead.
            lead_team_member = TeamMember.objects.filter(
                user=request.user,
                role="lead",
            ).select_related("team").first()

            if request.method == "POST" and request.POST.get("form_name") == "assign_task":
                return _create_task_for_lead(request, lead_team_member)

            # This section prepares empty values, so the page will not break if no team is found.
            team = lead_team_member.team if lead_team_member else None
            team_members = TeamMember.objects.none()
            available_projects = Project.objects.none()
            team_tasks = Task.objects.none()

            if team:
                # This section loads the lead's team members, projects, and tasks from the database.
                team_members = TeamMember.objects.filter(team=team).select_related("user")
                available_projects = Project.objects.filter(team=team).order_by("name")
                team_tasks = Task.objects.filter(project__team=team).select_related(
                    "assigned_to",
                    "project",
                ).order_by("due_date", "-updated_at")

            # This section prepares the four number cards at the top of the lead dashboard.
            team_member_count = team_members.count()
            assigned_task_count = team_tasks.count()
            in_progress_task_count = team_tasks.filter(status="in_progress").count()
            high_priority_task_count = team_tasks.filter(priority="high").exclude(status="done").count()

            # This section prepares the Team Work block.
            team_work_data = []
            for member in team_members:
                active_task = team_tasks.filter(
                    assigned_to=member.user,
                ).exclude(status="done").order_by("due_date", "-updated_at").first()
                team_work_data.append({
                    "member_name": member.user.username,
                    "member_role": member.get_role_display(),
                    "task_title": active_task.title if active_task else "No active task",
                    "task_status": active_task.get_status_display() if active_task else "Free",
                    "status_class": _status_badge_class(active_task.status) if active_task else "status-done",
                })

            # This section prepares the Team Task Board table.
            team_task_rows = []
            for task in team_tasks:
                team_task_rows.append({
                    "title": task.title,
                    "description": task.description or "No description added",
                    "project_name": task.project.name,
                    "member_name": task.assigned_to.username,
                    "task_status": task.get_status_display(),
                    "status_class": _status_badge_class(task.status),
                    "task_priority": task.get_priority_display(),
                    "priority_class": _priority_badge_class(task.priority),
                    "task_due_date": task.due_date,
                })

            # This section prepares the Lead Review Queue block.
            today = timezone.localdate()
            review_due_limit = today + timedelta(days=3)
            lead_review_tasks = []
            review_tasks = team_tasks.exclude(status="done")

            for task in review_tasks:
                reason = ""
                badge_text = "Review"
                badge_class = "badge-orange"

                if task.priority == "high":
                    reason = "High priority task needs lead attention."
                    badge_text = "High"
                    badge_class = "badge-orange"
                elif task.due_date and task.due_date < today:
                    reason = "This task is overdue."
                    badge_text = "Overdue"
                    badge_class = "badge-orange"
                elif task.due_date and task.due_date <= review_due_limit:
                    reason = "This task is due soon."
                    badge_text = "Due Soon"
                    badge_class = "badge-blue"
                elif task.status == "in_progress":
                    reason = "Check progress and remove blockers if needed."
                    badge_text = "Progress"
                    badge_class = "badge-blue"

                if reason:
                    lead_review_tasks.append({
                        "badge_text": badge_text,
                        "badge_class": badge_class,
                        "title": task.title,
                        "reason": reason,
                        "member_name": task.assigned_to.username,
                        "due_date": task.due_date,
                    })

            context = {
                "team_name": team.name if team else "No Team Assigned",
                "team_members": team_members,
                "available_projects": available_projects,
                "team_member_count": team_member_count,
                "assigned_task_count": assigned_task_count,
                "in_progress_task_count": in_progress_task_count,
                "high_priority_task_count": high_priority_task_count,
                "team_work_data": team_work_data,
                "team_task_rows": team_task_rows,
                "lead_review_tasks": lead_review_tasks[:5],
            }
            return render(request, "role_dashboards/lead_dashboard.html", context)

        if company_member.role == "member":
            return render(request, "role_dashboards/member_dashboard.html")

    return render(request, "dashboard.html")
