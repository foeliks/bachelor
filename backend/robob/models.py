# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.db import models


class Categories(models.Model):
    category_id = models.AutoField(primary_key=True)
    title = models.TextField()
    description = models.TextField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'categories'


class Conversations(models.Model):
    conversation_id = models.AutoField(primary_key=True)
    content = models.TextField(blank=True, null=True)
    narrator = models.ForeignKey('Narrators', models.DO_NOTHING, db_column='narrator', blank=True, null=True)
    next = models.ForeignKey('self', models.DO_NOTHING, db_column='next', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'conversations'


class Diary(models.Model):
    user = models.ForeignKey('Users', models.DO_NOTHING)
    knowledge = models.OneToOneField('Knowledge', models.DO_NOTHING, db_column='knowledge', primary_key=True)

    class Meta:
        managed = False
        db_table = 'diary'
        unique_together = (('knowledge', 'user'),)


class Knowledge(models.Model):
    knowledge_id = models.AutoField(primary_key=True)
    category = models.ForeignKey(Categories, models.DO_NOTHING, db_column='category', blank=True, null=True)
    description = models.TextField()
    optional = models.BooleanField(blank=True, null=True)
    conversation = models.ForeignKey(Conversations, models.DO_NOTHING, db_column='conversation', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'knowledge'


class Narrators(models.Model):
    narrator_id = models.AutoField(primary_key=True)
    name = models.TextField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'narrators'


class Progress(models.Model):
    user = models.OneToOneField('Users', models.DO_NOTHING, primary_key=True)
    task = models.ForeignKey('Tasks', models.DO_NOTHING, db_column='task')
    solved = models.BooleanField(blank=True, null=True)
    num_tries = models.IntegerField()
    user_solution = models.TextField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'progress'
        unique_together = (('user', 'task', 'num_tries'),)


class Tasks(models.Model):
    task_id = models.AutoField(primary_key=True)
    category = models.ForeignKey(Categories, models.DO_NOTHING, db_column='category', blank=True, null=True)
    knowledge = models.ForeignKey(Knowledge, models.DO_NOTHING, db_column='knowledge', blank=True, null=True)
    description = models.TextField()
    optional = models.BooleanField(blank=True, null=True)
    solution = models.TextField(blank=True, null=True)
    multiple_choice = models.BooleanField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'tasks'


class Users(models.Model):
    user_id = models.AutoField(primary_key=True)
    email = models.TextField(unique=True)
    password = models.TextField()
    admin = models.BooleanField(blank=True, null=True)
    serious_game = models.BooleanField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'users'
