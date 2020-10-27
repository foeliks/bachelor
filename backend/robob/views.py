from django.contrib.auth.models import User
from django.shortcuts import render
from django.views import View
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Categories, AuthUser, Tasks, Progress
from .serializers import UserSerializer, UserSerializerWithToken, CategoriesSerializer

@api_view(['GET'])
def current_user(request):
    serializer = UserSerializer(request.user)
    return Response(serializer.data)


@permission_classes([permissions.AllowAny,])
class UserList(APIView):

    def post(self, request, format=None):
        serializer = UserSerializerWithToken(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CategoriesView(viewsets.ModelViewSet):
    serializer_class = CategoriesSerializer
    queryset = Categories.objects.all()


class CategoriesProgress(APIView):
    def get(self, request, format=None):
        result = []
        try:
            user = AuthUser.objects.get(username=request.user)
            categories = Categories.objects.all()
            # result = CategoriesSerializer(categories, many=True).data
            progress = {}

            for category in categories:
                all_tasks = Tasks.objects.filter(category=category)
                finished_tasks = 0
                for task in all_tasks:
                    if len(list(Progress.objects.filter(solved=True, task=task, user=user))) >= 1:
                        finished_tasks += 1

                progress = 100
                if(len(all_tasks) != 0):
                    progress = finished_tasks/len(all_tasks) * 100

                result.append({
                        'id': category.id,
                        'title': category.title,
                        'progress': progress
                    })

        except Exception as e:
            print(e)
        
        return Response(result)
