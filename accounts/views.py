from django.contrib.auth import authenticate, login
from django.contrib.auth.decorators import login_required
from django.shortcuts import redirect, render


@login_required(login_url='sign_in')
def profile(request):
    return render(request, 'profile.html')


def sign_in(request):
    if request.method == "POST":
        username = request.POST.get("username")
        password = request.POST.get("password")

        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)
            return redirect("dashboard")

    return render(request, 'sign_in.html')


def sign_up(request):
    return render(request, 'sign_up.html')