from django.shortcuts import render


def profile(request):
    return render(request, 'profile.html')


def sign_in(request):
    return render(request, 'sign_in.html')


def sign_up(request):
    return render(request, 'sign_up.html')
