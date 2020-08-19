from django.db import models
import sqlite3
from django.contrib.auth.models import User

class Theories(models.Model):
    theory = models.CharField(max_length=50)
    description = models.TextField(default='')


class Concepts(models.Model):
    concept = models.CharField(max_length=50)
    description = models.TextField(default='',name='concept_description')
    url_link = models.CharField(max_length=200,default='',blank=True)

class TheoryConcepts(models.Model):
    theory = models.ForeignKey(Theories, on_delete=models.CASCADE)
    concept = models.ForeignKey(Concepts, on_delete=models.CASCADE)
    url_link = models.CharField(max_length=200,default='')

class Components(models.Model):
    concept = models.ForeignKey(Concepts, on_delete=models.CASCADE,related_name='conceptcomponent')
    component = models.ForeignKey(Concepts, on_delete=models.CASCADE, related_name='component')

class Actions(models.Model):
    action = models.CharField(max_length=20)

class Binders(models.Model):
    component = models.ForeignKey(Components, on_delete=models.CASCADE, related_name='component_concept')
    action = models.ForeignKey(Actions, on_delete=models.CASCADE)

class Connections(models.Model):
    metaTheory = models.ForeignKey(Theories, on_delete=models.CASCADE)
    subTheory = models.ForeignKey(Theories, on_delete=models.CASCADE, related_name='subTheory')

class TreeViewModel(models.Model):
    father = models.CharField(max_length=50)
    father_id = models.IntegerField()
    parent = models.CharField(max_length=50)
    parent_id = models.IntegerField()
    concept = models.CharField(max_length=50)
    concept_id = models.IntegerField()
    theory = models.CharField(max_length=50)
    theory_id = models.IntegerField()
    level = models.IntegerField()
    action = models.IntegerField()
    depth = models.IntegerField()
    sequence = models.CharField(max_length=10,default='')

class BreadCrumbs(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    crumb = models.CharField(max_length=200,default='')
