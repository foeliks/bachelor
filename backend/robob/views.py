from django.contrib.auth.models import User
from django.shortcuts import render
from django.views import View
from django.http import HttpResponse
from django.db.models import Count, Avg, Min
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Categories, AuthUser, Tasks, Progress, Diary, Knowledge
from .serializers import UserSerializer, UserSerializerWithToken

def get_stars(username, task):
    user_tries = Progress.objects.filter(solved=True, task=task, user__username=username).aggregate(Min('num_tries'))["num_tries__min"]
    first_solution_per_user = Progress.objects.filter(solved=True, task=task).order_by('user__id', 'num_tries').distinct('user__id').only('num_tries')
    sums = 0

    for first_solution in first_solution_per_user:
        sums += first_solution.num_tries

    avg = sums / len(first_solution_per_user)

    if user_tries < avg * 2/3 or user_tries == 1:
        return 3
    elif user_tries >= avg * 4/3:
        return 1
    
    return 2


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
            categories = Categories.objects.all()
            progress = {}

            for category in categories:
                tasks = []
                all_tasks = Tasks.objects.filter(category=category).order_by('id')
                finished_tasks = 0

                for task in all_tasks:
                    solved = False
                    solved_tasks = Progress.objects.filter(solved=True, task=task, user__username=request.user)
                    stars = 0

                    if solved_tasks.aggregate(Count('num_tries'))["num_tries__count"] >= 1:
                        finished_tasks += 1
                        solved = True
                        user_tries = solved_tasks.aggregate(Min('num_tries'))["num_tries__min"]
                        stars = get_stars(request.user,task)

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


class NextTask(APIView):
    def get(self, request, format=None, **kwargs):
        result = {
            "task_with_optional": 0,
            "task_without_optional": 0
            }

        try:
            all_tasks = Tasks.objects.all()

            for task in all_tasks:
                solved_tasks = Progress.objects.filter(solved=True, task=task, user__username=request.user).only("id")
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

            if task.knowledge != None:
                result["knowledge"] = task.knowledge.description

                if Diary.objects.filter(user__username=request.user, knowledge=task.knowledge).exists() == False:
                    user = AuthUser.objects.get(username=request.user)
                    Diary.objects.create(user=user, knowledge=task.knowledge, post_it=False)

            if Progress.objects.filter(user__username=request.user, task=task, solved=True).exists():
                result["stars"] = get_stars(request.user, task)
            else:
                result["stars"] = 0

        except Exception as e:
            print(e)

        return Response(result)


class DiaryView(APIView):
    def get(self, request, format=None, **kwargs):
        result = {}
        
        try:
            categories = Categories.objects.all()

            for category in categories:
                
                result[category.id] = {
                    "title": category.title,
                    "knowledge": map(
                        lambda entry: {
                            "id": entry.knowledge.id,
                            "description": entry.knowledge.description
                        }, 
                        list(Diary.objects.filter(user__username=request.user, knowledge__category=category).only("knowledge")))
                }

        except Exception as e:
            print(e)

        return Response(result)


class ChangeGameMode(APIView):
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
            progress = Progress.objects.filter(user=user, task=task).order_by('-num_tries')

            if progress.exists():
                num_tries = progress[0].num_tries + 1
                Progress.objects.create(user=user, task=task, num_tries=num_tries, solved=solved, user_solution=request.data["user_solution"])
            else:
                progress = Progress.objects.create(user=user, task=task, num_tries=1, solved=solved, user_solution=request.data["user_solution"])

            if solved == True:
                result = {
                    "stars": get_stars(user.username, task)
                }
                return Response(result, status=status.HTTP_202_ACCEPTED)
            
            return HttpResponse(status=200)

        except Exception as e:
            print(e)
            return HttpResponse(status=400)