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

from django.contrib.auth.models import User

from rest_framework import status
from rest_framework import permissions
from rest_framework.views import APIView
from rest_framework.generics import ListAPIView, RetrieveAPIView
from rest_framework.response import Response


from dusp.config import root_url
from projects.models import (
        Topic, Person, Project, Country, City,
        PersonForm, ProjectForm, TopicForm,
        qsetToList,
        )
from projects.serializers import (
        ProjectSerializer, PersonSerializer,
        TopicSerializer, UserSerializer,
        CountrySerializer,
        EditingIndexSerializer,
        )
from projects.permissions import (
        OwnProfileToEdit,
        IsListedInPeopleOrReadOnly,
        )


def get_user_person(request):
    print "Looking for that user"
    user = UserSerializer( request.user )
    return user.data


class ProjectsView(APIView):
    """
    List all the projects, or create a new project
    """
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,
           IsListedInPeopleOrReadOnly, )

    def get(self, request, format=None):
        projects = Project.objects.all()
        serializer = ProjectSerializer(projects, many=True)
        return Response(serializer.data)

    def post(self, request, format=None):
        serializer = ProjectSerializer(data=request.DATA)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors,
                    status=status.HTTP_400_BAD_REQUEST)

class ProjectView(APIView):
    """
    Retrieve, update, or delete a project
    """
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,
           IsListedInPeopleOrReadOnly, )

    def get_object(self, pk):
        try:
            return Project.objects.get(pk=pk)
        except Project.DoesNotExist:
            raise Http404

    def get(self, request, pk, format=None):
        project = self.get_object(pk)
        serializer = ProjectSerializer(project)
        return Response(serializer.data)

    def put(self, request, pk, format=None):
        project = self.get_object(pk)
        serializer  = ProjectSerializer(project, data=request.DATA)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data) # why no status
        else:
            return Response(serializer.errors,
                    status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk, format=None):
        project = self.get_object(pk)
        project.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    #def pre_save(self, obj):
        #obj.account = self.request.user

class PeopleView(ListAPIView):
    """
    Get people as a list
    """
    queryset = Person.objects.all()
    serializer_class = PersonSerializer

class PersonView(RetrieveAPIView):
    """
    Get a single person
    """
    queryset = Person.objects.all()
    serializer_class = PersonSerializer

class TopicsView(ListAPIView):
    """
    Get the topics
    """
    queryset = Topic.objects.all()
    serializer_class = TopicSerializer

class TopicView(ListAPIView):
    """
    Get a single topic
    """
    queryset = Topic.objects.all()
    serializer_class = TopicSerializer

class UserList(ListAPIView):
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)
    queryset = User.objects.all()
    serializer_class = UserSerializer

class UserDetail(RetrieveAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer

class CountriesView(ListAPIView):
    queryset = Country.objects.all()
    serializer_class = CountrySerializer

def d(obj):
    for k in vars(obj):
        print '"%s": %s' % (k, obj[k])

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

model_lookup = {
        "person":(Person, PersonForm),
        "project":(Project, ProjectForm),
        "topic":(Topic, TopicForm),
        }

def explorer(request):
    c = {
            "page_title": "DUSP Explorer",
            "ROOT_URL": root_url,
            }
    # go get everything
    return render_to_response(
            'explorer.html',
            RequestContext(request, c),
            )

def read(request, model, object_id ):
    """ This is for ajax calls to just grab a json of a single object"""
    m = model_lookup[model][0]
    jFormat = m.to_json_format(natural=True)
    json = json.dumps(jFormat)
    return HttpResponse(json, mimetype='application/json')

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

def update(request, model, object_id ):
    """This is for ajax calls to update a single object"""
    m = model_lookup[model][0].objects.get(id=int(object_id))
    jFormat = m.to_json_format(natural=True)
    json = json.dumps(jFormat)
    return HttpResponse(json, mimetype='application/json')

def delete(request, model, object_id ):
    """This is for ajax calls to delete a single object"""
    m = model_lookup[model][0].objects.get(id=int(object_id))
    name = m.__unicode__()
    m.delete()
    response = {
            "message": name,
            }
    return HttpResponse(json, mimetype='application/json')


