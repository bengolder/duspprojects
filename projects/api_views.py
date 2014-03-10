from django.contrib.auth.models import User

from rest_framework import status
from rest_framework import permissions
from rest_framework.views import APIView
from rest_framework.generics import ListAPIView, RetrieveAPIView
from rest_framework.response import Response

from projects.models import (
        Topic, Person, Project, Country, City,
        )

from projects.permissions import (
        OwnProfileToEdit,
        IsListedInPeopleOrReadOnly,
        )

from projects.serializers import (
        ProjectSerializer, PersonSerializer,
        TopicSerializer, UserSerializer,
        CountrySerializer,
        SimpleProjectSerializer,
        TopicSearchSerializer,
        )

class ProjectsView(APIView):
    """
    List all the projects, or create a new project
    """
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,
           IsListedInPeopleOrReadOnly, )

    def get(self, request, format=None):
        projects = Project.objects.all()
        serializer = SimpleProjectSerializer(projects, many=True)
        return Response(serializer.data)

    def post(self, request, format=None):
        serializer = SimpleProjectSerializer(data=request.DATA)
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
    serializer_class = TopicSearchSerializer

class TopicView(ListAPIView):
    """
    Get a single topic
    """
    queryset = Topic.objects.all()
    serializer_class = TopicSearchSerializer

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


