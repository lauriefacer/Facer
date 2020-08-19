from django.shortcuts import render
from django.contrib.auth.decorators import login_required


@login_required
def mmt_home(request):
    return render(request, 'mmt/mmt_home.html')
