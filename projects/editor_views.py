from pprint import pprint


from django.shortcuts import render_to_response
from django.template import RequestContext
from django.http import HttpResponse, HttpResponseRedirect

from dusp.config import root_url
from projects.models import (
        Topic, Person, Project, Country, City,
        PersonForm, ProjectForm, TopicForm,
        qsetToList,
        )
from projects.serializers import (
        EditingIndexSerializer,
        )

model_lookup = {
        "person":(Person, PersonForm),
        "project":(Project, ProjectForm),
        "topic":(Topic, TopicForm),
        }

def add_root():
    """adds the root url for this project from settings for template
    rendering"""
    return {"root_url":root_url}

def add_jsons():
    """This is a set of json lists, not python objects.
    """
    d = {
            "jsons": {
                # get the autocomplete stuff
                "topics":qsetToList(Topic.objects.all()),
                "people":qsetToList(Person.objects.all()),
                "countries":qsetToList(Country.objects.all()),
                "cities":qsetToList(City.objects.all()),
                }
            }
    return d

def index(request):
    if not request.user.is_authenticated():
        return HttpResponseRedirect('/')
    """This is the editing page. It is auth dependent. There should be three
    levels of authentication:
        1. Admin - Eran & I - edit anything
        2. Faculty - Edit their own, add new, and see others
    """
    c = {
            "page_title": "DUSP Projects Explorer Index Page",
            }
    # go get everything
    if request.user.is_superuser:
        for k in model_lookup:
            c[k] = model_lookup[k][0].objects.all()
            c[k] = [n.to_json_format(True) for n in c[k]]
        c['profile'] = request.user
        c['projects'] = c.pop('project')
        print request.user.username
    else:
        user = EditingIndexSerializer( request.user )
        c['profile'] = user.data['profile'][0]
        print c['profile']['full_name']
        c['projects'] = c['profile']['projects']
    c.update(add_root())
    return render_to_response(
            'index.html',
            RequestContext(request, c),
            )

def edit(request, model, object_id ):
    # get the lists of people, topics, countries, and cities
    print "in edit view"
    if request.method == "POST":
        form = model_lookup[model][1](request.POST)
        if form.is_valid():
            print form.cleaned_data
        else:
            print "not valid"
        return HttpResponse( "<pre>%s</pre>" % str(vars(form)) )
    else:
        m = model_lookup[model][0].objects.get(id=int(object_id))
        d = m.to_json_format(natural=True)

        pprint(d)
        if 'interests' in d:
            d['interests'] = ', '.join(d['interests'])
        form = model_lookup[model][1](initial=d)
        c = {
                "action": "edit",
                "page_title": "Edit %s" % m.__unicode__(),
                "%sform" % model: form,
                "object_id": object_id,
            }
        c.update(add_jsons())
        c.update(add_root())
        return render_to_response(
                'edit_%s.html' % model,
                RequestContext(request, c),
                )

def add(request, model="person"):
    """Add"""
    # get the lists of people, topics, countries, and cities
    if request.method == "POST":
        print "add post for %s" % model
    c = {
            "action": "add",
            "page_title": "Add a new %s to DUSP Explorer" % model,
            "%sform" % model: model_lookup[model][1](),
        }
    c.update(add_jsons())
    c.update(add_root())
    return render_to_response(
            'add_%s.html' % model,
            RequestContext(request, c),
    )

