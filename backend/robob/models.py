# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.db import models


class Answers(models.Model):
    user = models.OneToOneField('AuthUser', models.DO_NOTHING, primary_key=True)
    task = models.ForeignKey('Tasks', models.DO_NOTHING)
    solved = models.BooleanField(blank=True, null=True)
    num_tries = models.IntegerField()
    user_solution = models.TextField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'answers'
        unique_together = (('user', 'task', 'num_tries'),)


class AuthUser(models.Model):
    password = models.CharField(max_length=128)
    last_login = models.DateTimeField(blank=True, null=True)
    is_superuser = models.BooleanField()
    username = models.CharField(unique=True, max_length=150)
    first_name = models.CharField(max_length=150)
    last_name = models.CharField(max_length=150)
    email = models.CharField(unique=True, max_length=254)
    is_staff = models.BooleanField()
    is_active = models.BooleanField()
    date_joined = models.DateTimeField()
    game_mode = models.BooleanField()
    employee_rank = models.ForeignKey('EmployeeRanks', models.DO_NOTHING, blank=True, null=True)


    class Meta:
        managed = False
        db_table = 'auth_user'


class Categories(models.Model):
    title = models.TextField()

    class Meta:
        managed = False
        db_table = 'categories'


class Diary(models.Model):
    user = models.ForeignKey(AuthUser, models.DO_NOTHING)
    knowledge = models.OneToOneField('Knowledge', models.DO_NOTHING, primary_key=True)

    class Meta:
        managed = False
        db_table = 'diary'
        unique_together = (('knowledge', 'user'),)


class EmployeeRanks(models.Model):
    title = models.TextField()

    class Meta:
        managed = False
        db_table = 'employee_ranks'


class Knowledge(models.Model):
    category = models.ForeignKey(Categories, models.DO_NOTHING, blank=True, null=True)
    description = models.TextField()
    optional = models.BooleanField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'knowledge'


class Progress(models.Model):
    user = models.OneToOneField(AuthUser, models.DO_NOTHING, primary_key=True)
    task = models.ForeignKey('Tasks', models.DO_NOTHING)
    solved = models.BooleanField(blank=True, null=True)
    num_tries = models.IntegerField()

    class Meta:
        managed = False
        db_table = 'progress'
        unique_together = (('user', 'task', 'num_tries'),)


class TaskTypes(models.Model):
    description = models.TextField()

    class Meta: 
        managed = False
        db_table = 'task_types'

class Tasks(models.Model):
    category = models.ForeignKey(Categories, models.DO_NOTHING, blank=True, null=True)
    knowledge = models.ForeignKey(Knowledge, models.DO_NOTHING, blank=True, null=True)
    description = models.TextField()
    optional = models.BooleanField(blank=True, null=True)
    solution = models.TextField(blank=True, null=True)
    task_type = models.ForeignKey(TaskTypes, models.DO_NOTHING, blank=True, null=True)
    specify = models.TextField(blank=True, null=True)
    required_stars = models.IntegerField(blank=True, null=True)
    required_employee_rank = models.ForeignKey(EmployeeRanks, models.DO_NOTHING, blank=True, null=True, related_name="required_employee_rank")
    achieve_employee_rank = models.ForeignKey(EmployeeRanks, models.DO_NOTHING, blank=True, null=True, related_name="achieve_employee_rank")

    class Meta:
        managed = False
        db_table = 'tasks'

