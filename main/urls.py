from django.urls import path, include
from . import views

urlpatterns = [
    path('',views.facer_home,name='facer_home'),
    path('mmt/',include('mmt.urls')),
    path('blog/',include('blog.urls')),
    path('theories/', include('theories.urls')),
]