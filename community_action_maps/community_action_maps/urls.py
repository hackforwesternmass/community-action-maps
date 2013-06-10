from django.conf.urls import patterns, include, url
from django.conf import settings

# Uncomment the next two lines to enable the admin:
from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    # Examples:
    # url(r'^$', 'community_action_maps.views.home', name='home'),
    # url(r'^community_action_maps/', include('community_action_maps.foo.urls')),
    url(r'^$', include('maps.urls')),
    url(r'^upload/$', 'maps.views.upload', name='upload'),
    url(r'^admin/', include(admin.site.urls)),
    url(r'^static/(?P<path>.*)$', 'django.views.static.serve', {'document_root': settings.STATIC_ROOT}),
)
