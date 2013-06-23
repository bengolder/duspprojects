from django.conf.urls import patterns, include, url
import projects

# Uncomment the next two lines to enable the admin:
from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('projects.views',
    url(r'^$', 'index', name='index'),
    url(r'^add/(?P<model>\w+)/$', 'add', name='add'),
    url(r'^edit/(?P<model>\w+)/(?P<object_id>\d+)/$', 'edit', name='edit'),
)

urlpatterns += patterns('',
    url(r'^admin/', include(admin.site.urls)),
)
