from django.contrib.auth.models import User
from django.shortcuts import render
from django.views import View
from django.http import HttpResponse
from django.db.models import Count, Avg, Min
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
                all_tasks = Tasks.objects.filter(category=category).order_by('id')
                finished_tasks = 0
                for task in all_tasks:
                    solved = False
                    solved_tasks = Progress.objects.filter(solved=True, task=task, user=user)
                    stars = 0
                    if solved_tasks.aggregate(Count('num_tries'))["num_tries__count"] >= 1:
                        finished_tasks += 1
                        solved = True
                        user_tries = solved_tasks.aggregate(Min('num_tries'))["num_tries__min"]
                        
                        first_solution_per_user = Progress.objects.filter(solved=True, task=task).order_by('user__id', 'num_tries').distinct('user__id').only('num_tries')
                        sums = 0
                        for first_solution in first_solution_per_user:
                            sums += first_solution.num_tries

                        avg = sums / len(first_solution_per_user)

                        if user_tries < avg * 2/3 or user_tries == 1:
                            stars = 3
                        elif user_tries >= avg * 4/3:
                            stars = 1
                        else:
                            stars = 2


                    tasks.append({
                        "id": task.id,
                        "optional": task.optional,
                        "solved": solved,
                        "stars": stars
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
                solved_tasks = Progress.objects.filter(solved=True, task=task, user=user).only("id")
                chosen = all_tasks.exclude(id__in=solved_tasks)[0]
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
                "multiple_choice": task.multiple_choice,
                "placeholder_before": task.placeholder_before,
                "placeholder_after": task.placeholder_after
            }
            if task.placeholder_before == None:
                result["placeholder_before"] = ""
            if task.placeholder_after == None:
                result["placeholder_after"] = ""
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
            return HttpResponse(status=200)
        except Exception as e:
            print(e)
            return HttpResponse(status=400)


class AddSolution(APIView):
    def post(self, request, format=None, **kwargs):
        try:
            user = AuthUser.objects.get(username=request.user)
            task = Tasks.objects.get(id=request.data["task_id"])
            solved = task.solution == request.data["solution"]
            try:
                num_tries = Progress.objects.filter(user=user, task=task).order_by('-num_tries')[0].num_tries + 1
                Progress.objects.create(user=user, task=task, num_tries=num_tries, solved=solved, user_solution=request.data["user_solution"])
            except:
                progress = Progress.objects.create(user=user, task=task, num_tries=1, solved=solved, user_solution=request.data["user_solution"])

            if solved == True:
                return HttpResponse(status=220)
            
            return HttpResponse(status=200)

        except Exception as e:
            print(e)
            return HttpResponse(status=400)