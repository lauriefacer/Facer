from django.urls import path, include
from . import views as mmt_views


urlpatterns = [
    path('',mmt_views.mmt_home,name='mmt_home'),
    path('banks/',include('banks.urls')),
         ]