from django import forms
from django.contrib import admin

from projects.models import *

admin.site.register(Person)
admin.site.register(Topic)
admin.site.register(Project)
admin.site.register(Country)
admin.site.register(City)


