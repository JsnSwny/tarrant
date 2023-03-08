from django.urls import path
from . import views

urlpatterns = [
    path('get_action/', views.get_action, name='get_action'),
]