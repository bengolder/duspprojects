import os
import shutil
import random
import json
import datetime
import urllib
from pprint import pprint

from django.shortcuts import render_to_response, get_object_or_404
#from django.contrib.auth.models import User
from django.template import RequestContext
from django.core import serializers
from django.http import HttpResponse, Http404, HttpResponseRedirect
from django.views.decorators.csrf import csrf_exempt
from django.core.mail import send_mail, get_connection

from projects.models import (
        Topic, Person, Project, Country, City,
        PersonForm, ProjectForm, TopicForm,
        qsetToList,
        )

"""
For each porject or person:
    Browse
    Read
    Edit
    Add
    Delete
"""

def d(obj):
    for k in vars(obj):
        print '"%s": %s' % (k, obj[k])

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

def home(request):
    """ Browse """
    c = {
            "page_title": "FORMS MIT DUSP",
            "personform": PersonForm(),
            "projectform": ProjectForm(),
            "topicform": TopicForm(),
            }
    return render_to_response(
            'home.html',
            RequestContext(request, c),
            )

model_lookup = {
        "person":(Person, PersonForm),
        "project":(Project, ProjectForm),
        "topic":(Topic, TopicForm),
        }

def add(request, model="person"):
    """ Browse """
    # get the lists of people, topics, countries, and cities
    if request.method == "POST":
        print request
    c = {
            "page_title": "Add a new %s to DUSP Explorer" % model,
            "%sform" % model: model_lookup[model][1](),
        }
    c.update(autocomplete_lists())
    return render_to_response(
            'add_%s.html' % model,
            RequestContext(request, c),
            )

def browse(request, model="project"):
    m = model_lookup[model][0]
    objects = m.objects.all()
    c = {
            "page_title": "Browse %ss" % model,
            model + "list": objects,
        }
    return render_to_response(
            'browse_%s.html' % model,
            RequestContext(request, c),
            )

def read(request, model, object_id ):
    """ This is for ajax calls to just grab a json of a single object"""
    m = model_lookup[model][0]
    jFormat = m.to_json_format(natural=True)
    json = json.dumps(jFormat)
    return HttpResponse(json, mimetype='application/json')

def update(request, model, object_id ):
    """ This is for ajax calls to update a single object"""
    m = model_lookup[model][0]
    jFormat = m.to_json_format(natural=True)
    json = json.dumps(jFormat)
    return HttpResponse(json, mimetype='application/json')

def edit(request, model, object_id ):
    # get the lists of people, topics, countries, and cities
    if request.method == "POST":
        print request
    m = model_lookup[model][0].objects.get(id=int(object_id))
    d = m.to_json_format(natural=True)
    pprint(d)
    if 'interests' in d:
        d['interests'] = ', '.join(d['interests'])
    form = model_lookup[model][1](initial=d)
    c = {
            "page_title": "Edit %s" % m.__unicode__(),
            "%sform" % model: form,
        }
    c.update(add_jsons())
    return render_to_response(
            'add_%s.html' % model,
            RequestContext(request, c),
            )


