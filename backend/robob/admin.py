from django.contrib import admin
from .models import Categories

# Register your models here.
class CategoriesAdmin(admin.ModelAdmin):
    list_display = ('id','title')

admin.site.register(Categories, CategoriesAdmin)