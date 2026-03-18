from django.contrib import admin
from django.urls import path, include
from api import views as api_views

urlpatterns = [
    path('', api_views.api_root, name='root'),
    path('health/', api_views.health_check, name='health-check'),
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
]
