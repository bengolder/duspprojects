from django.conf.urls import patterns, include, url

urlpatterns = patterns('',
    url(r'^$', 'projects.views.index', name='index'),
    url(r'^add/$', 'projects.views.add', name='add'),
)



