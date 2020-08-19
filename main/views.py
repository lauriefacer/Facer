from django.shortcuts import render


def facer_home(request):
    return render(request, 'main/facer_home.html')
