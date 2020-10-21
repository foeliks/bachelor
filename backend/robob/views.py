from django.http import HttpResponse
from django.shortcuts import render
from rest_framework import viewsets
from .serializers import CategoriesSerializer
from .models import Categories

def index(request):
    return HttpResponse("Hello world!")

class CategoriesView(viewsets.ModelViewSet):
    serializer_class = CategoriesSerializer
    queryset = Categories.objects.all()