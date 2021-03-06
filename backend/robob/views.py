from django.contrib.auth.models import User
from django.shortcuts import render
from django.views import View
from django.http import HttpResponse
from django.db.models import Count, Avg, Min
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Categories, AuthUser, Tasks, Progress, Diary, Knowledge, Answers
from .serializers import UserSerializer, UserSerializerWithToken

def get_stars(username, task, best=True):
    user_tries = list(map(lambda progress: progress.num_tries, Progress.objects.filter(solved=True, task=task, user__username=username).order_by("num_tries").only("num_tries")))
    least_tries = 5
    if best:
        for index in range(len(user_tries)):
            if index == 0:
                tries = user_tries[0]
            else:
                tries = user_tries[index] - user_tries[index - 1]

            if tries < least_tries:
                least_tries = tries
    else:
        if len(user_tries) > 1:
            least_tries = user_tries[len(user_tries) -1] - user_tries[len(user_tries) - 2]
        else:
            least_tries = user_tries[0]

    if least_tries <= 2:
        return 3
    elif least_tries <= 4:
        return 2

    return 1
    


@api_view(['GET'])
def current_user(request):
    user = AuthUser.objects.get(username=request.user)
    result = {
        'username': user.username,
        'game_mode': user.game_mode,
        'employee_rank': {
            "id": 0, 
            "title": None
        }
    }
    if user.employee_rank:
        result['employee_rank'] = {
            "id": user.employee_rank.id, 
            "title": user.employee_rank.title
        } 
    return Response(result)


@permission_classes([permissions.AllowAny,])
class UserList(APIView):

    def post(self, request):
        serializer = UserSerializerWithToken(data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class NextTaskView(APIView):
    def get(self, request, **kwargs):
        result = {
            "task_with_optional": 0,
            "task_without_optional": 0
            }

        try:
            solved_tasks = list(map(lambda progress: progress.task.id, Progress.objects.filter(user__username=request.user, solved=True).order_by("task_id").distinct("task_id").only("task_id")))

            not_solved_tasks = Tasks.objects.all().exclude(id__in=solved_tasks).order_by("id")
            if not_solved_tasks.exists():
                result["task_with_optional"] = not_solved_tasks[0].id

            if not_solved_tasks.filter(optional=False).exists():
                result["task_without_optional"] = not_solved_tasks.filter(optional=False)[0].id

            return Response(result)

        except Exception as e:
            print(e)

        return Response(result)


class TaskView(APIView):
    def get(self, request, **kwargs):
        result = {}

        try:
            task = Tasks.objects.get(id=kwargs["task_id"])

            required_employee_rank = None
            achieve_employee_rank = None

            if task.required_employee_rank:
                required_employee_rank = {
                    "id": task.required_employee_rank.id, 
                    "title": task.required_employee_rank.title
                } 
            if task.achieve_employee_rank:
                achieve_employee_rank = {
                    "id": task.achieve_employee_rank.id, 
                    "title": task.achieve_employee_rank.title
                }

            result = {
                "id": task.id,
                "category_id": task.category.id,
                "description": task.description,
                "optional": task.optional,
                "type": task.task_type.description,
                "specify": task.specify,
                "required_stars": task.required_stars,
                "required_employee_rank": required_employee_rank,
                "achieve_employee_rank": achieve_employee_rank
            }

            if task.knowledge != None:
                result["knowledge"] = task.knowledge.description

                if Diary.objects.filter(user__username=request.user, knowledge=task.knowledge).exists() == False:
                    user = AuthUser.objects.get(username=request.user)
                    Diary.objects.create(user=user, knowledge=task.knowledge)

            progress = Progress.objects.filter(user__username=request.user, task=task).order_by("num_tries")

            if progress.exists():
                if progress.filter(solved=True).exists():
                    result["tries"] = progress.last().num_tries - progress.filter(solved=True).last().num_tries
                    result["stars"] = get_stars(request.user, task)
                else:
                    result["tries"] = progress.last().num_tries
            else:
                result["stars"] = 0

        except Exception as e:
            print(e)

        return Response(result)


    def post(self, request, **kwargs):
        result = {}
        try:
            user = AuthUser.objects.get(username=request.user)
            task = Tasks.objects.get(id=request.data["task_id"])
            solved = task.solution == request.data["solution"]
            progress = Progress.objects.filter(user=user, task=task).order_by('-num_tries')

            if progress.exists():
                num_tries = progress[0].num_tries + 1
                if Progress.objects.filter(user__username=request.user, task=task, solved=True).order_by("num_tries").exists():
                    result["tries"] = num_tries - Progress.objects.filter(user__username=request.user, task=task, solved=True).order_by("num_tries").last().num_tries
                else:
                    result["tries"] = num_tries
                Progress.objects.create(user=user, task=task, num_tries=num_tries, solved=solved)
                Answers.objects.create(user=user, task=task, num_tries=num_tries, solved=solved, user_solution=request.data["user_solution"])
            else:
                progress = Progress.objects.create(user=user, task=task, num_tries=1, solved=solved)
                Answers.objects.create(user=user, task=task, num_tries=1, solved=solved, user_solution=request.data["user_solution"])
                result["tries"] = 1
                
            if solved == True:
                result["solved_stars"] = get_stars(user.username, task, False)
                Progress.objects.filter(user=user, task=task, solved=False).delete()
                solved_tasks = list(map(lambda progress: progress.task.id, Progress.objects.filter(user__username=request.user, solved=True).order_by("task_id").distinct("task_id").only("task_id")))

                result["task_with_optional"] = 0
                result["task_without_optional"] = 0
                not_solved_tasks = Tasks.objects.all().exclude(id__in=solved_tasks).order_by("id")

                if not_solved_tasks.exists():
                    result["task_with_optional"] = not_solved_tasks[0].id

                if not_solved_tasks.filter(optional=False).exists():
                    result["task_without_optional"] = not_solved_tasks.filter(optional=False)[0].id

                if task.achieve_employee_rank and (not user.employee_rank or user.employee_rank.id < task.achieve_employee_rank.id):
                    user.employee_rank = task.achieve_employee_rank
                    user.save()

                return Response(result, status=status.HTTP_202_ACCEPTED)
            
            return Response(result, status=status.HTTP_200_OK)

        except Exception as e:
            print(e)
            return HttpResponse(status=400)


class ChangeGameMode(APIView):
    def post(self, request, **kwargs):
        try:
            user = AuthUser.objects.get(username=request.user)

            if kwargs["game_mode"] != user.game_mode:
                user.game_mode = kwargs["game_mode"]
                user.save()

            return HttpResponse(status=200)

        except Exception as e:
            print(e)
            return HttpResponse(status=400)


class RankingView(APIView):
    def get(self, request):
        result = []
        try:
            for user in AuthUser.objects.all().only('username'):
                tasks = map(lambda progress: progress.task, Progress.objects.filter(user__username = user.username, solved=True).order_by('task', 'num_tries').distinct('task').only('task'))
                stars = 0

                for task in tasks:
                    stars += get_stars(user.username, task)

                employee_rank = "-"

                if user.employee_rank:
                    employee_rank = user.employee_rank.title

                result.append({
                    "username": user.username, 
                    "stars": stars,
                    "employee_rank": employee_rank
                })

            result.sort(key=lambda entry: entry["stars"], reverse=True)
            place = 1
            
            last_entry = result[0]
            for entry in result:
                if last_entry["stars"] > entry["stars"]:
                    place += 1

                entry["place"] = place
                last_entry = entry

        except Exception as e:
            print(e)

        return Response(result)


class ProgressDependingView(APIView):
    def get(self, request):
        result = {
            "sum_stars": 0,
            'employee_rank': {
                "id": 0, 
                "title": None
            },
            "categories": [],
            "diary": []
        }

        try:
            categories = Categories.objects.all()
            progress = {}
            user = AuthUser.objects.get(username=request.user)

            if user.employee_rank:
                result['employee_rank'] = {
                    "id": user.employee_rank.id, 
                    "title": user.employee_rank.title
                } 

            for category in categories:
                result["diary"].append({
                    "id": category.id,
                    "title": category.title,
                    "knowledge": map(
                        lambda entry: {
                            "id": entry.knowledge.id,
                            "description": entry.knowledge.description
                        }, 
                        list(Diary.objects.filter(user=user, knowledge__category=category).only("knowledge")))
                })


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
                        stars = get_stars(request.user,task)
                    
                    required_employee_rank = None
                    achieve_employee_rank = None

                    if task.required_employee_rank:
                        required_employee_rank = {
                            "id": task.required_employee_rank.id, 
                            "title": task.required_employee_rank.title
                        } 
                    if task.achieve_employee_rank:
                        achieve_employee_rank = {
                            "id": task.achieve_employee_rank.id, 
                            "title": task.achieve_employee_rank.title
                        }

                    tasks.append({
                        "id": task.id,
                        "category_id": task.category.id,
                        "optional": task.optional,
                        "solved": solved,
                        "stars": stars,
                        "required_stars": task.required_stars,
                        "required_employee_rank": required_employee_rank,
                        "achieve_employee_rank": achieve_employee_rank
                    })
                    result["sum_stars"] += stars

                progress = 100

                if(len(all_tasks) != 0):
                    progress = finished_tasks/len(all_tasks) * 100

                result["categories"].append({
                        'id': category.id,
                        'title': category.title,
                        'progress': progress,
                        'tasks': tasks
                    })

        except Exception as e:
            print(e)
        
        return Response(result)