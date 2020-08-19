from django import forms
from .models import Concepts
from django.db import connection

class ConceptForm(forms.Form):
    concept_name = forms.CharField(label='Concept name', max_length=500)
    concept_description = forms.CharField(label='Concept Description')
    theory_id = forms.IntegerField(widget=forms.HiddenInput)

class ComponentForm(forms.Form):
    concept_name = forms.CharField(label='Concept name', max_length=500)
    concept_description = forms.CharField(label='Concept Description')
    concept_id = forms.IntegerField(widget=forms.HiddenInput)


class LinkConceptForm(forms.Form):
    concept = forms.ChoiceField(choices=[
        (concept.pk, concept.concept) for concept in Concepts.objects.all()
        ])

class TreeViewForm(forms.Form):
    father = forms.CharField(label='Father',max_length=50)
    parent = forms.CharField(label='Parent',max_length=50)
    id = forms.IntegerField(label='id')
    concept = forms.CharField(label='Concept')
    theory= forms.CharField(label='Theory',max_length=50)
    level = forms.IntegerField(label='Level')