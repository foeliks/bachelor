from django.contrib.auth.models import User
from django.shortcuts import render
from django.views import View
from django.http import HttpResponse
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Categories, AuthUser, Tasks, Progress
from .serializers import UserSerializer, UserSerializerWithToken

@api_view(['GET'])
def current_user(request):
    user = AuthUser.objects.get(username=request.user)
    return Response({
        'username': user.username,
        'game_mode': user.game_mode
    })


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

class NextTaskView(APIView):
    def get(self, request, format=None, **kwargs):
        result = {
            "task_with_optional": 0,
            "task_without_optional": 0
            }
        try:
            user = AuthUser.objects.get(username=request.user)
            all_tasks = Tasks.objects.all()
            for task in all_tasks:
                solved_tasks = map(lambda x: x.task.id, list(Progress.objects.filter(solved=True, task=task, user=user)))
                all_tasks = all_tasks.exclude(id__in=solved_tasks)
                if len(all_tasks) > 0:
                    chosen = all_tasks[0]
                    if(result ["task_with_optional"] == 0):
                        result["task_with_optional"] = chosen.id
                    if chosen.optional == False:
                        result["task_without_optional"] = chosen.id
                        return Response(result)
                    

        except Exception as e:
            print(e)

        return Response(result)

class TaskView(APIView):
    def get(self, request, format=None, **kwargs):
        result = {}
        try:
            task = Tasks.objects.get(id=kwargs["task_id"])
            result = {
                "id": task.id,
                "description": task.description,
                "optional": task.optional,
                "multiple_choice": task.multiple_choice
            }
        except Exception as e:
            print(e)

        return Response(result)

class ChangeGameModeView(APIView):
    def post(self, request, format=None, **kwargs):
        try:
            user = AuthUser.objects.get(username=request.user)
            if kwargs["game_mode"] != user.game_mode:
                user.game_mode = kwargs["game_mode"]
                user.save()
            return HttpResponse(200)
        except Exception as e:
            print(e)
            return HttpResponse(400)


class AddSolution(APIView):
    def post(self, request, format=None, **kwargs):
        try:
            user = AuthUser.objects.get(username=request.user)
            task = Tasks.objects.get(id=request.data["task_id"])
            print(request.data)
            print(request.data["solution"])
            print(task.solution)
            print(request.data["solution"] == task.solution)
            solved = task.solution == request.data["solution"]
            try:
                num_tries = Progress.objects.filter(user=user, task=task).order_by('-num_tries')[0].num_tries + 1
                Progress.objects.create(user=user, task=task, num_tries=num_tries, solved=solved, user_solution=request.data["user_solution"])
                return HttpResponse(200)
            except:
                progress = Progress.objects.create(user=user, task=task, num_tries=1, solved=solved, user_solution=request.data["user_solution"])
                return HttpResponse(200)
        except Exception as e:
            print(e)
            return HttpResponse(400)