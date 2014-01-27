import json

from django.db import models
from django.forms import ModelForm
from django import forms
from django.db.models import Q

from django.contrib.auth.models import User


from datertots.models import DataModel

people_types = (
        ("fac", "Faculty"),
        ("phd", "Ph.D"),
        ("psd", "Post Doc"),
        ("vsc", "Visiting Scholar"),
        ("vfa", "Visiting Faculty"),
        ("gst", "Graduate Student"),
        ("ust", "Undergraduate Student"),
        ("stf", "Staff"),
        )

topic_sets = (
        ("a","a"),
        ("b","b"),
        ("c","c"),
        )

class Person(DataModel):
    account = models.ForeignKey(User, blank=True, null=True, related_name="profile")
    full_name = models.CharField(max_length=400)
    official_title = models.CharField(max_length=500)
    status = models.CharField(max_length=100, default="fac", choices=people_types)
    picture = models.ImageField(upload_to="images/people", blank=True, null=True)
    home_page = models.URLField(blank=True, null=True)
    # process the bio with markdown
    bio = models.TextField(blank=True, null=True)
    interests = models.ManyToManyField('Topic', blank=True, null=True)
    interests.help_text = ''
    email = models.EmailField(blank=True, null=True)

    def __unicode__(self):
        return self.full_name

    def to_json_format(self, *args, **kwargs):
        data = super(Person, self).to_json_format(*args, **kwargs)
        if data['interests']:
            data['interests'] = ', '.join(data['interests'])
        else:
            data['interests'] = ''
        return data

    def natural_key(self):
        return self.full_name



class Topic(DataModel):
    title = models.CharField(max_length=200)
    collection = models.CharField(max_length=2, default='a',
                                    choices=topic_sets)
    # process this with markdown
    description = models.TextField(blank=True, null=True)
    def __unicode__(self):
        return self.title
    def natural_key(self):
        return self.__unicode__()

class Project(DataModel):
    title = models.CharField(max_length=500)
    people = models.ManyToManyField('Person', related_name='projects')
    people.help_text = ''
    type = models.CharField(max_length=100, null=True, blank=True)
    website = models.URLField(blank=True, null=True)
    # process this with markdown
    description = models.TextField(blank=True, null=True)
    partners = models.TextField(blank=True, null=True)
    # let people know that countries may be added automatically by entering
    # cities, they don't need to enter both for the same location
    # it's just so that we can accommodate nationa-level projects
    cities = models.ManyToManyField('City', blank=True, null=True)
    cities.help_text = ''
    countries = models.ManyToManyField('Country', blank=True, null=True)
    countries.help_text = ''
    topics = models.ManyToManyField('Topic', blank=True, null=True,
            related_name="projects")
    topics.help_text = ''
    start_year = models.IntegerField(blank=True, null=True)
    end_year = models.IntegerField(blank=True, null=True)
    def __unicode__(self):
        return self.title

    def to_json_format(self, *args, **kwargs):
        # get the basic form from the DataModel class
        data = super(Project, self).to_json_format(*args, **kwargs)
        for f in ('people', 'cities', 'countries', 'topics'):
            if data[f]:
                data[f] = ', '.join(data[f])
            else:
                data[f] = ''
        return data

class Publication(DataModel):
    article_id = models.IntegerField()
    doi = models.CharField( max_length=50 )
    title = models.CharField( max_length=300 )
    journal_name = models.CharField( max_length=200 )
    year = models.IntegerField()
    vol = models.IntegerField()
    iss = models.IntegerField()
    start_page = models.IntegerField()
    end_page = models.IntegerField()
    full_name = models.CharField( max_length=100 )
    first_name = models.CharField( max_length=50 )
    middle_name = models.CharField( max_length=50 )
    last_name = models.CharField( max_length=50 )
    nice_name = models.CharField( max_length=500 )
    mit_id = models.IntegerField()
    source = models.CharField( max_length=50 )
    abstract = models.TextField()


class City(DataModel):
    name = models.CharField(max_length=400)
    official_name = models.CharField(max_length=500, null=True, blank=True)
    country = models.ForeignKey('Country')
    # store the city location here
    lat = models.FloatField()
    lng = models.FloatField()
    def __unicode__(self):
        return self.name

class Country(DataModel):
    name = models.CharField(max_length=400)
    official_name = models.CharField(max_length=500, null=True, blank=True)
    # no geometry will be stored, but this id can be used to lookup a polygon
    country_id = models.CharField(max_length=50, null=True, blank=True)
    def __unicode__(self):
        return self.name
    def natural_key(self):
        return self.__unicode__()



##### FORMS

class PersonForm(ModelForm):
    class Meta:
        model = Person
        fields = ("full_name", "official_title", "status","picture",
        "home_page", "bio", "interests", "email",
                )
        widgets = {
                "interests": forms.TextInput(),
                }

class ProjectForm(ModelForm):
    class Meta:
        model = Project
        fields = ("title", "type", "description", "people",
                "partners", "website", "start_year", "end_year",
                "cities", "countries", "topics",
                )
        widgets = {
                "people": forms.TextInput(),
                "cities": forms.TextInput(),
                "countries": forms.TextInput(),
                "topics": forms.TextInput(),
                }



class TopicForm(ModelForm):
    class Meta:
        model = Topic
        fields = ("title", "description", "collection")

def qsetToList(qset):
    return json.dumps([n.__unicode__() for n in qset])

def stringsToQset(strs, model, field):
    q = None
    for s in strs:
        d = {field+"__iexact":s }
        if not q:
            q = Q(**d)
        else:
            q = q | Q(**d)
    return model.objects.get(q)

