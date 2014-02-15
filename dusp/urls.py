from django.conf.urls import patterns, include, url
from rest_framework.urlpatterns import format_suffix_patterns
import projects
from projects import api_views

# Uncomment the next two lines to enable the admin:
from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('projects.views',

    url(r'^explorer/$', 'explorer', name='explorer'),

    url(r'^$', 'topic_explorer', name='topic_explorer'),

)

urlpatterns += patterns('projects.editor_views',
    # admin
    url(r'^index/$', 'index', name='index'),
    url(r'^add/(?P<model>\w+)/$', 'add', name='add'),
    url(r'^edit/(?P<model>\w+)/(?P<object_id>\d+)/$', 'edit', name='edit'),
)

urlpatterns += patterns('projects.api_views',
    # api views
    url(r'^api-auth/', include('rest_framework.urls',
                            namespace='rest_framework')),

    url(r'^projects/$', api_views.ProjectsView.as_view()),
    url(r'^project/(?P<pk>[0-9]+)/$', api_views.ProjectView.as_view()),

    url(r'^people/$', api_views.PeopleView.as_view()),
    url(r'^person/(?P<pk>[0-9]+)/$', api_views.PersonView.as_view()),

    url(r'^topics/$', api_views.TopicsView.as_view()),
    url(r'^topic/(?P<pk>[0-9]+)/$', api_views.TopicView.as_view()),
    url(r'^countries/$', api_views.CountriesView.as_view()),
    url(r'^users/$', api_views.UserList.as_view()),
    url(r'^user/(?P<pk>[0-9]+)/$', api_views.UserDetail.as_view()),
)

urlpatterns += patterns('',
    url(r'^admin/', include(admin.site.urls)),
)

urlpatterns += patterns('',

        url(r'^login/', 'django.contrib.auth.views.login'),
        url(r'^logout/', 'django.contrib.auth.views.logout'),

        # this view allows a user to input an email, then sends an email.
        url(r'^password_reset/', 'django.contrib.auth.views.password_reset'),

        # this tells the use that the password reset email has been sent
        url(r'^password_reset_done/',
            'django.contrib.auth.views.password_reset_done'),

        # this offers a form to input a new password
        url(r'^password_reset_confirm/(?P<uidb36>[0-9A-Za-z]+)-(?P<token>.+)/$',
            'django.contrib.auth.views.password_reset_confirm'),

        # this announces that the password reset process is complete
        url(r'^password_reset_complete/',
            'django.contrib.auth.views.password_reset_complete'),

        url(r'^password_change/', 'django.contrib.auth.views.password_change'),
        url(r'^password_change_done/',
            'django.contrib.auth.views.password_change_done'),
)

urlpatterns = format_suffix_patterns(urlpatterns)
