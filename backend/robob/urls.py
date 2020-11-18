from django.urls import path
from .views import current_user, UserList, CategoriesProgressView, NextTaskView, TaskView, ChangeGameMode, AddSolution, DiaryView, RankingView

urlpatterns = [
    path('current_user/', current_user),
    path('users/', UserList.as_view()),
    path('category-progress/', CategoriesProgressView.as_view()),
    path('next-task/', NextTaskView.as_view()),
    path('task/<int:task_id>', TaskView.as_view()),
    path('game-mode/<int:game_mode>', ChangeGameMode.as_view()),
    path('add-solution/', AddSolution.as_view()),
    path('diary/', DiaryView.as_view()),
    path('ranking/', RankingView.as_view())
]