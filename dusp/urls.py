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
