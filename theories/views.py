from django.shortcuts import render, reverse, redirect, get_object_or_404
from django.http import HttpResponse, JsonResponse, HttpResponseRedirect
from django.template.loader import render_to_string
from django.contrib.auth.decorators import login_required
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.views.generic import (ListView,
                                  CreateView,
                                  DetailView,
                                  DeleteView,
                                  UpdateView
                                  )
from .forms import ConceptForm, LinkConceptForm, ComponentForm, TreeViewForm
from .models import Theories, Concepts, TheoryConcepts, Components, TreeViewModel
from django.views.decorators.csrf import csrf_exempt
from django.db import connection
from django.contrib.auth.models import User
from .apiViews import ManageBreadCrumbs
import docx
import tkinter as tk
from tkinter import filedialog
import os
import win32com.client as win32


#def readtxt(filename):
#    doc = docx.Document(filename)
#    fullText = []
#    for para in doc.paragraphs:
#        fullText.append(para.text)
#    return '\n'.join(fullText)

def word_test():
    root = tk.Tk()
    root.withdraw()
    file_path = filedialog.askopenfilename()
    print(f"Path: {file_path}")
    word = win32.gencache.EnsureDispatch('Word.Application')
    word.Visible = True
    doc = word.Documents.Open(file_path)
    _ = input("Press enter to close Excel")
    word.Application.Quit()


class TreeListView(ListView):
    template_name = 'theories/treeview.html'
    theory = 0

    def test_func(self):
        return True

    def get_queryset(self,**kwargs):
        TreeViewModel.objects.all().delete()
        sql = "WITH RECURSIVE concepts AS (" \
              "select '' as father, 0 as father_id," \
              " c.concept as parent, c.id as id, c.concept as concept," \
              " t.theory as theory, t.id as theory_id, ROW_NUMBER() OVER(ORDER BY c.concept)*100 as level" \
              " from theories_concepts c" \
              " inner join theories_theoryconcepts tc on tc.concept_id = c.id" \
              " inner join theories_theories t on t.id = tc.theory_id" \
              " where t.id = {}" \
              " UNION ALL" \
              " select c3.parent, c3.id, c4.concept, c2.id, c2.concept, '', c3.theory_id, c3.level + 1" \
              " from concepts c3" \
              " left join theories_components comp on comp.concept_id = c3.id" \
              " inner join theories_concepts c2 on c2.id = comp.component_id" \
              " inner join theories_concepts c4 on c4.id = comp.concept_id" \
              ")" \
              "select * from concepts order by level".format(self.theory)
        with connection.cursor() as cursor:
            cursor.execute(sql)
            x = cursor.fetchall()
        for row in x:
            tree = TreeViewModel(father=row[0],
                                 father_id=row[1],
                                 parent=row[2],
                                 parent_id=0,
                                 concept=row[4],
                                 concept_id=row[3],
                                 theory=row[5],
                                 theory_id=row[6],
                                 level=row[7],
                                 action=0,
                                 depth=0
                                 )
            tree.save()
        x = TreeViewModel.objects.all()
        ch1 = 'A'
        for row in x:
            if not row.father:
                row.sequence = ch1
                ch1 = chr(ord(ch1) + 1)
        ch1 = 'A'
        father = ''
        for row in x:
            if row.father == row.parent:
                for row2 in x:
                    if row2.parent == row.father:
                        sequence = row2.sequence
                        break
                row.sequence = sequence + ch1
                ch1 = chr(ord(ch1) + 1)
                father = row.father
        ch1 = 'A'
        for row in x:
            if row.father:
                if row.father != row.parent:
                    for row2 in x:
                        if row.parent == row2.concept:
                            sequence = row2.sequence
                    row.sequence = sequence + ch1
                    ch1 = chr(ord(ch1) + 1)
        TreeViewModel.objects.all().delete()
        for row in x:
            depth = len(row.sequence)
            tree = TreeViewModel(father=row.father,
                                 father_id=row.father_id,
                                 parent=row.parent,
                                 parent_id=row.parent_id,
                                 concept=row.concept,
                                 concept_id=row.concept_id,
                                 theory=row.theory,
                                 theory_id = row.theory_id,
                                 level = row.level,
                                 action = row.action,
                                 depth = depth,
                                 sequence = row.sequence)
            tree.save()
        sql = "select * from theories_treeviewmodel t inner join theories_concepts tc on tc.id = t.concept_id order by t.sequence"
        #x = TreeViewModel.objects.all().order_by('sequence')
        x = TreeViewModel.objects.raw(sql)

        prev_depth = 0
        level = 0
        next = 0
        prev = -1
        for row in x:
            next += 1
            if next < len(x):
                if row.depth < x[next].depth:
                    row.action = 1
                elif row.depth > x[next].depth:
                    row.action = 0
                else:
                    row.action = 0
            else:
                row.depth = 0
            if next == 1:
                row.level = 0
            else:
                if len(row.sequence) < len(x[prev].sequence):
                    row.level = len(x[prev].sequence) - len(row.sequence) + 1
                else:
                    row.level = 0
            prev += 1
        return x

    def dispatch(self, request, *args, **kwargs):
        user = self.request.user
        crumb = request.path
        ManageBreadCrumbs.add_crumb(user, crumb)
        self.theory = kwargs['pk']
        return super().dispatch(request, *args, **kwargs)

@login_required
def theories_home(request):
    return render(request, 'theories/theories_home.html')

class TheoriesListView(ListView):
    model = Theories
    template_name = 'theories/theories_home.html'
    fields = ['theory','description']
    ordering=['theory']

    def get_queryset(self):
        sql = 'select id as id,'\
              ' theory as theory,'\
              ' Substr(description,1,100)'\
              ' as description_short, description as description_long'\
              ' from theories_theories'
        x = Theories.objects.raw(sql)
        return x

    def dispatch(self,request,*args,**kwargs):
        user =  self.request.user
        crumb = request.path
        ManageBreadCrumbs.initial_crumb(user,crumb)
        return super().dispatch(request, *args, **kwargs)


class TheoryCreateView(LoginRequiredMixin,CreateView):
    model = Theories
    fields = ['theory','description']

    def get_success_url(self):
        return reverse('theories_home')


@csrf_exempt
def theory_concept(request,pk):
    theory = Theories.objects.filter(theory=pk)
    if request.method == 'POST':
        form = ConceptForm(request.POST)
        if form.is_valid():
            name = form.cleaned_data['concept_name']
            description = form.cleaned_data['concept_description']
            concept = Concepts(concept=name, concept_description=description)
            concept.save()
            #create link to theory
            theory = TheoryConcepts(theory_id=pk,concept_id=concept.id)
            theory.save()
            return redirect('theories_detail',pk)
    else:
        form = ConceptForm(initial={'theory_id': pk})
    return render(request, 'theories/concepts_form.html', {'form':form})

class TheoryConceptCreate(LoginRequiredMixin,CreateView):
    model = Concepts
    fields = ['concept','concept_description','url_link']
    theory = 0

    def get_success_url(self):
        url_name = '/theories/{}'.format(self.theory)
        return HttpResponseRedirect(url_name)

    def dispatch(self,request,*args,**kwargs):
        self.theory = kwargs['pk']
        return super().dispatch(request, *args, **kwargs)

    def form_valid(self, form):
        name = form.cleaned_data['concept']
        description = form.cleaned_data['concept_description']
        concept = Concepts(concept=name, concept_description=description)
        concept.save()
        # create link to theory
        theory = TheoryConcepts(theory_id=self.theory, concept_id=concept.id)
        theory.save()
        url_name = '/theories/{}'.format(self.theory)
        return HttpResponseRedirect(url_name)

def link_concepts(request,pk):
    theory = Theories.objects.filter(theory=pk)
    if request.method == 'POST':
        form = LinkConceptForm(request.POST)
        if form.is_valid():
            concept_id = form.cleaned_data['concept']
            # create link to theory
            theory = TheoryConcepts(theory_id=pk, concept_id=concept_id)
            theory.save()
            return redirect('theories_detail', pk)
    else:
        form = LinkConceptForm(initial={'theory_id': pk})
    return render(request, 'theories/concepts_form.html', {'form': form})

class TheoryDetailView(ListView):
    model = Theories
    template_name = 'theories/theories_detail.html'

    def dispatch(self,request,*args,**kwargs):
        print(f"{request.path}")
        return super().dispatch(request, *args, **kwargs)

    def get_queryset(self):
        theory_id = self.kwargs['pk']
        sql = 'select distinct t.id as id, t.theory as theory, t.description as theory_description'\
              ',tc.concept_id as concept_id, tc.theory_id as theory_id'\
              ',tc.id as link_id, c.concept as concept'\
              ',Substr(c.concept_description,1,50) as concept_description_short' \
              ',c.concept_description as concept_description_long'\
              ' from theories_theories t'\
              ' left join theories_theoryconcepts tc on tc.theory_id = t.id '\
              ' left join theories_concepts c on c.id = tc.concept_id'\
              ' where t.id = {}'.format(theory_id)
        x = Theories.objects.raw(sql)
        return x

    def dispatch(self, request, *args, **kwargs):
        user = self.request.user
        crumb = request.path
        ManageBreadCrumbs.add_crumb(user, crumb)
        return super().dispatch(request, *args, **kwargs)

class TheoryUpdateView(LoginRequiredMixin, UserPassesTestMixin, UpdateView):
    model = Theories
    fields = ['theory', 'description', 'url_link']

    def test_func(self):
        return True

    def get_success_url(self):
        theory = self.get_object()
        return '/facer/theories/{}/'.format(theory.id)

class TheoriesDeleteView(LoginRequiredMixin,UserPassesTestMixin,DeleteView):
    model = Theories
    success_url = '/facer/theories/'

    def test_func(self):
        return True

class ConceptCreateView(LoginRequiredMixin,CreateView):
    model = Concepts
    fields = ['concept','concept_description']

    def get_theory_id(self,**kwargs):
        return True

    def get_success_url(self,**kwargs):
        return reverse('theories_home')

class ConceptUpdateView(LoginRequiredMixin, UserPassesTestMixin, UpdateView):
    model = Concepts
    fields = ['concept', 'concept_description', 'url_link']
    theory = 0

    def test_func(self):
        return True

    def dispatch(self,request,*args,**kwargs):
        y = kwargs['theory']
        self.theory = y
        user = self.request.user
        crumb = request.path
        ManageBreadCrumbs.add_crumb(user, crumb)
        return super().dispatch(request, *args, **kwargs)

    def get_success_url(self):
        request = self.request
        prev_url = ManageBreadCrumbs.get_success_url(request)
        return prev_url
        #return reverse('theories_detail',args=[self.theory])

class ConceptLinkDeleteView(LoginRequiredMixin, UserPassesTestMixin, DeleteView):
    model = TheoryConcepts
    fields = ['theory_id', 'concept_id']
    theory = 0
    concept = 0
    delete_record = False

    def test_func(self):
        return True

    def dispatch(self,request,*args,**kwargs):
        y = kwargs['theory']
        self.theory = kwargs['theory']
        self.concept = kwargs['pk']
        return super().dispatch(request, *args, **kwargs)

    def get_object(self):
        x = self.model.objects.filter(theory_id=self.theory)\
                    .filter(concept_id=self.concept)\
                    .select_related("concept")\
                    .select_related("theory")
        id = x[0].id
        y = x[0].concept
        z = x[0].theory
        context= {'id':id, 'theory_id': self.theory, 'concept_id': self.concept,\
                  'concept_name':y.concept, 'theory_name':z.theory}
        return context

    def delete(self,request,*args,**kwargs):
        self.delete_record = True
        x = TheoryConcepts.objects.filter(theory=self.theory).filter(concept=self.concept)
        id = x[0].id
        TheoryConcepts.objects.filter(id=id).delete()
        return HttpResponseRedirect(reverse('theories_detail',kwargs={'pk': self.theory}))

    def get_success_url(self):
        concept = self.get_object()
        return reverse('theories_detail',args=[self.theory])

class ConceptsListView(LoginRequiredMixin, UserPassesTestMixin, ListView):
    theory_id = 0
    model = Concepts
    template_name = 'theories/concepts_detail.html'
    paginate_by = 10

    def test_func(self):
        return True

    def dispatch(self,request,*args,**kwargs):
        self.theory_id = kwargs['pk']
        return super().dispatch(request, *args, **kwargs)

    def get_queryset(self,**kwargs):
        theory = Theories.objects.filter(id=self.theory_id)
        theory_name = theory[0].theory
        sql = 'select id, concept, Substr(concept_description,1,50) as concept_description, {} theory_id, "{}" theory_name from theories_concepts tc '\
                'where tc.id not in '\
                '(select concept_id from '\
                'theories_theoryconcepts ttc '\
                'where ttc.theory_id = {}) '\
                'order by concept'.format(self.theory_id,theory_name,self.theory_id)
        x = Concepts.objects.raw(sql)
        return x

class ConceptComponent(ListView):
    model = Concepts
    template_name = 'theories/components_detail.html'
    paginate_by = 10

    def get_queryset(self):
        concept_id = self.kwargs['pk']
        theory_id = self.kwargs['theory']
        sql = 'select tc.id as id, '\
                'tc.concept as concept_name,'\
                'tc.concept_description as concept_description,'\
                'tc2.id as component_id,'\
                'tc2.concept as component_name,'\
                'substr(tc2.concept_description,1,50) as component_description_short, ' \
                'tc2.concept_description as component_description_long, ' \
                '{} theory_id '\
                'from theories_concepts tc '\
                'left join theories_components comp on tc.id = comp.concept_id '\
                'left join theories_concepts tc2 on tc2.id = comp.component_id '\
                'where tc.id = {}'.format(theory_id, concept_id)
        x = Concepts.objects.raw(sql)
        return x

    def dispatch(self,request,*args,**kwargs):
        user =  self.request.user
        crumb = request.path
        ManageBreadCrumbs.add_crumb(user,crumb)
        return super().dispatch(request, *args, **kwargs)


class ComponentsListView(LoginRequiredMixin, UserPassesTestMixin, ListView):
    concept_id = 0
    theory_id = 0
    model = Concepts
    template_name = 'theories/components_list.html'
    paginate_by = 10

    def test_func(self):
        return True

    def dispatch(self,request,*args,**kwargs):
        self.concept_id = kwargs['pk']
        self.theory_id = kwargs['theory']
        return super().dispatch(request, *args, **kwargs)

    def get_queryset(self,**kwargs):
        concept = Concepts.objects.filter(id=self.concept_id)
        concept_name = concept[0].concept
        sql = 'select id, concept as component_name, '\
                'Substr(concept_description,1,50) as component_description, '\
                'id as component_id, '\
                '{} concept_id, "{}" concept_name, '\
                '{} theory_id '\
                'from theories_concepts tc '\
                'where tc.id not in '\
                '(select component_id from '\
                'theories_components ttc '\
                'where ttc.concept_id = {}) '\
                'order by concept'.format(self.concept_id, concept_name, self.theory_id ,self.concept_id)
        print(f"SQL {sql}")
        x = Concepts.objects.raw(sql)
        return x

class ComponentLinkDeleteView(LoginRequiredMixin, UserPassesTestMixin, DeleteView):
    model = Components
    fields = ['concpet_id', 'component_id']
    concept = 0
    component = 0
    theory = 0
    delete_record = False

    def test_func(self):
        return True

    def dispatch(self,request,*args,**kwargs):
        self.concept = kwargs['pk']
        self.component = kwargs['component']
        self.theory = kwargs['theory']
        return super().dispatch(request, *args, **kwargs)

    def get_object(self):
        x = self.model.objects.filter(concept_id=self.concept)\
                    .filter(component_id=self.component)\
                    .select_related("concept")\
                    .select_related("component")
        id = x[0].id
        y = x[0].concept
        z = x[0].component
        context= {'id':id, 'concept_id': self.concept, 'component_id': self.component,\
                  'concept_name':y.concept, 'component_name':z.concept,'theory':self.theory}
        return context

    def delete(self,request,*args,**kwargs):
        print(f"Theory: {self.theory}")
        self.delete_record = True
        x = Components.objects.filter(concept_id=self.concept).filter(component_id=self.component)
        id = x[0].id
        Components.objects.filter(id=id).delete()
        return_url = '/theories/components/{}/{}/'.format(self.concept, self.theory)
        return HttpResponseRedirect(return_url)

    def get_success_url(self):
        concept = self.get_object()
        return_url = '/theories/components/{}/{}/'.format(self.concept, self.theory)
        return HttpResponseRedirect(return_url)

class ComponentUpdateView(LoginRequiredMixin, UserPassesTestMixin, UpdateView):
    model = Concepts
    fields = ['concept', 'concept_description','url_link']
    concept = 0
    theory = 0


    def test_func(self):
        return True

    def dispatch(self,request,*args,**kwargs):
        y = kwargs['concept']
        self.concept = y
        self.theory = kwargs['theory']
        user = self.request.user
        crumb = request.path
        ManageBreadCrumbs.add_crumb(user, crumb)
        return super().dispatch(request, *args, **kwargs)

    def get_success_url(self):
        request = self.request
        prev_url = ManageBreadCrumbs.get_success_url(request)
        return prev_url
        #return reverse('components_detail',args=[self.concept,self.theory])


class ConceptComponentCreate(LoginRequiredMixin,CreateView):
    model = Concepts
    fields = ['concept','concept_description','url_link']
    theory = 0
    concept = 0

    def get_success_url(self):
        url_name = '/theories/components/{}/{}'.format(self.concept, self.theory)
        return HttpResponseRedirect(url_name)

    def dispatch(self,request,*args,**kwargs):
        self.concept = kwargs['pk']
        self.theory = kwargs['theory']
        return super().dispatch(request, *args, **kwargs)

    def form_valid(self, form):
        name = form.cleaned_data['concept']
        description = form.cleaned_data['concept_description']
        concept = Concepts(concept=name, concept_description=description)
        concept.save()
        # create link to theory
        link = Components(concept_id=self.concept, component_id=concept.id)
        link.save()
        url_name = '/theories/components/{}/{}'.format(self.concept,self.theory)
        return HttpResponseRedirect(url_name)


class ConceptsListAllView(ListView):
    model = Concepts
    template_name = 'theories/concepts_list.html'
    paginate_by = 10

    def get_queryset(self):
        sql = 'select id, concept, substr(concept_description,1,50) as concept_description, '\
              ' concept_description as description_long '\
              ' from theories_concepts order by concept'
        x = Concepts.objects.raw(sql)
        return x

    def dispatch(self,request,*args,**kwargs):
        user =  self.request.user
        crumb = request.path
        ManageBreadCrumbs.add_crumb(user,crumb)
        return super().dispatch(request, *args, **kwargs)

class ConceptsDeleteView(LoginRequiredMixin,UserPassesTestMixin,DeleteView):
    model = Concepts
    success_url = '/theories/concepts_list/'

    def test_func(self):
        return True

class ConceptReferencedView(ListView):
    model = Concepts
    template_name = 'theories/concept_referenced.html'

    def get_queryset(self):
        concept_id = self.kwargs['pk']
        sql = 'select c.id as id, c.concept as concept_name, '\
              ' c.concept_description as description, '\
              ' c2.concept as component_name, c2.concept_description as component_description'\
              ', t.theory as theory_name, t.description as theory_description'\
              ', 1 display_theory'\
              ' from theories_concepts c'\
              ' left join theories_components comp on comp.component_id = c.id'\
              ' left join theories_concepts c2 on comp.concept_id = c2.id'\
              ' left join theories_theoryconcepts tc on tc.concept_id = c.id'\
              ' left join theories_theories t on t.id = tc.theory_id'\
              ' where c.id = {}'\
              ' order by concept_name, theory_name'.format(concept_id)
        x = Concepts.objects.raw(sql)
        theory = ''
        for row in x:
            if row.theory_name == theory:
                row.display_theory = 0
            else:
                row.display_theory = 1
                theory = row.theory_name
        return x

    def dispatch(self,request,*args,**kwargs):
        user =  self.request.user
        crumb = request.path
        ManageBreadCrumbs.add_crumb(user,crumb)
        return super().dispatch(request, *args, **kwargs)