from django.contrib.auth.decorators import login_required
from django.shortcuts import render


@login_required(login_url='sign_in')
def notifications(request):
    return render(request, 'notifications.html')