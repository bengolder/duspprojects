from django.conf.urls import patterns, include, url
from rest_framework.urlpatterns import format_suffix_patterns
import projects
from projects import views

# Uncomment the next two lines to enable the admin:
from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('projects.views',

    url(r'^$', 'explorer', name='explorer'),

    url(r'^index/$', 'index', name='index'),
    url(r'^add/(?P<model>\w+)/$', 'add', name='add'),
    url(r'^edit/(?P<model>\w+)/(?P<object_id>\d+)/$', 'edit', name='edit'),

    # api views
    url(r'^api-auth/', include('rest_framework.urls',
                            namespace='rest_framework')),

    url(r'^projects/$', views.ProjectsView.as_view()),
    url(r'^project/(?P<pk>[0-9]+)/$', views.ProjectView.as_view()),

    url(r'^people/$', views.PeopleView.as_view()),
    url(r'^person/(?P<pk>[0-9]+)/$', views.PersonView.as_view()),

    url(r'^topics/$', views.TopicsView.as_view()),
    url(r'^topic/(?P<pk>[0-9]+)/$', views.TopicView.as_view()),
    url(r'^countries/$', views.CountriesView.as_view()),
    url(r'^users/$', views.UserList.as_view()),
    url(r'^user/(?P<pk>[0-9]+)/$', views.UserDetail.as_view()),
)

urlpatterns += patterns('',
    url(r'^admin/', include(admin.site.urls)),
)

urlpatterns = format_suffix_patterns(urlpatterns)
