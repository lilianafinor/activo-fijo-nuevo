from django.contrib import admin
from django.urls import path
from graphene_django.views import GraphQLView
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
from django.conf.urls.static import static
from activo.views import upload_pdf

urlpatterns = [
    path('admin/', admin.site.urls),
    path('graphql/', csrf_exempt(GraphQLView.as_view(graphiql=True))),
    path('upload/', csrf_exempt(upload_pdf), name='upload_pdf'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)