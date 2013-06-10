from django.conf.urls import patterns, url

from maps import views

urlpatterns = patterns('',
    url(r'^upload/$', views.upload, name='upload'),
    url(r'^$', views.index, name='index'),
)
