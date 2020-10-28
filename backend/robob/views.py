from django.contrib.auth.models import User
from django.shortcuts import render
from django.views import View
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Categories, AuthUser, Tasks, Progress
from .serializers import UserSerializer, UserSerializerWithToken

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


class CategoriesProgress(APIView):
    def get(self, request, format=None):
        result = []
        try:
            user = AuthUser.objects.get(username=request.user)
            categories = Categories.objects.all()
            progress = {}

            for category in categories:
                tasks = []
                all_tasks = Tasks.objects.filter(category=category)
                finished_tasks = 0
                for task in all_tasks:
                    solved = False
                    if len(list(Progress.objects.filter(solved=True, task=task, user=user))) >= 1:
                        finished_tasks += 1
                        solved = True

                    tasks.append({
                        "id": task.id,
                        "optional": task.optional,
                        "solved": solved
                    })

                progress = 100
                if(len(all_tasks) != 0):
                    progress = finished_tasks/len(all_tasks) * 100

                result.append({
                        'id': category.id,
                        'title': category.title,
                        'progress': progress,
                        'tasks': tasks
                    })

        except Exception as e:
            print(e)
        
        return Response(result)

class TaskView(APIView):
    def get(self, request, format=None, **kwargs):
        user = AuthUser.objects.get(username=request.user)
        category_id = kwargs["category_id"]
        result = {}
        try:
            category = Categories.objects.get(id=category_id)
            all_tasks = Tasks.objects.filter(category=category)
            for task in all_tasks:
                solved_tasks = map(lambda x: x.task.id, list(Progress.objects.filter(solved=True, task=task, user=user)))
                all_tasks.exclude(id__in=solved_tasks)
                if len(all_tasks) > 0:
                    chosen = all_tasks[0]
                    result = {
                        "id": chosen.id,
                        "description": chosen.description,
                        "optional": chosen.optional,
                        "multiple_choice": chosen.multiple_choice
                    }
        except Exception as e:
            print(e)

        return Response(result)