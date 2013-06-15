from django.conf.urls import patterns, include, url

urlpatterns = patterns('',
    url(r'^$', 'projects.views.home', name='home'),
    url(r'^add/$', 'projects.views.add', name='add'),
)



