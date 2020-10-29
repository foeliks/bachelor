from django.urls import path
from .views import current_user, UserList, CategoriesProgress, TaskView, ChangeGameModeView, AddSolution

from . import views

urlpatterns = [
    path('current_user/', current_user),
    path('users/', UserList.as_view()),
    path('category-progress/', CategoriesProgress.as_view()),
    path('task/<int:category_id>', TaskView.as_view()),
    path('game-mode/<int:game_mode>', ChangeGameModeView.as_view()),
    path('add-solution/', AddSolution.as_view())
]