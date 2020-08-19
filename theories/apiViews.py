from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from .models import TheoryConcepts, Theories, Components, BreadCrumbs
from django.shortcuts import reverse


@csrf_exempt
def link_theory_concept_create(request):
    concept_id = request.POST.get("concept_id","")
    theory_id = request.POST.get("theory_id","")
    link = TheoryConcepts
    link.objects.create(theory_id=theory_id,
                        concept_id=concept_id)
    return JsonResponse({"success": "/facer/theories/"})

@csrf_exempt
def link_concept_component_create(request, pk):
    concept_id = request.POST.get("concept_id")
    component_id = request.POST.get("component_id")
    link = Components
    link.objects.create(concept_id=concept_id,
                        component_id=component_id)
    return JsonResponse({"success": "updated"})

@csrf_exempt
class ManageBreadCrumbs:

    def initial_crumb(user, crumb):
        ManageBreadCrumbs.delete_crumbs(user)
        x = BreadCrumbs(user=user,
                        crumb=crumb)
        x.save()
        x = BreadCrumbs(user=user,
                        crumb=crumb)
        x.save()

    def delete_crumbs(user):
        BreadCrumbs.objects.filter(user=user).delete()
        return True

    def add_crumb(user, crumb):
        prev_crumb = BreadCrumbs.objects.filter(user=user).last()
        if prev_crumb.crumb != crumb:
            x = BreadCrumbs(user=user,
                            crumb=crumb)
            x.save()
        return True

    def get_success_url(request):
        user = request.user
        BreadCrumbs.objects.filter(user=user)
        x = BreadCrumbs.objects.filter(user=user).last()
        BreadCrumbs.objects.filter(id=x.id).delete()
        crumb = BreadCrumbs.objects.filter(user=user).last()
        print(f"Last Crumb Found: {crumb.crumb}")
        return crumb.crumb

    @csrf_exempt
    def get_prev_crumb(request):
        user = request.user
        BreadCrumbs.objects.filter(user=user)
        x = BreadCrumbs.objects.filter(user=user).last()
        BreadCrumbs.objects.filter(id=x.id).delete()
        crumb = BreadCrumbs.objects.filter(user=user).last()
        print(f"Last Crumb Found: {crumb.crumb}")
        return JsonResponse({"success": crumb.crumb})

