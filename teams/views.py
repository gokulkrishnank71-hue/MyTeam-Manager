from django.contrib.auth.decorators import login_required
from django.shortcuts import render


@login_required(login_url='sign_in')
def teams(request):
    return render(request, 'teams.html')