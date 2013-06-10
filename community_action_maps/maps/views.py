from django.shortcuts import render, render_to_response
from django.template import RequestContext
from django.http import HttpResponse, HttpResponseRedirect

from .forms import UploadFileForm
from .censusmunger import DataMunger

def index(request):
    return render_to_response('base.html',
               context_instance=RequestContext(request))

def upload(request):
    if request.method == 'POST': # If the form has been submitted...
        form = UploadFileForm(request.POST, request.FILES) # A form bound to the POST data
        if form.is_valid(): # All validation rules pass
            handle_uploaded_file(request.FILES['file'])
            return HttpResponseRedirect('/') # Redirect after POST
    else:
        form = UploadFileForm() # An unbound form
    
    return render(request, 'upload.html', {
        'form': form,
    })

def handle_uploaded_file(f):
    with open('name.txt', 'wb+') as destination:
        for chunk in f.chunks():
            destination.write(chunk)
    dm = DataMunger('name.txt', 'out.csv')
    dm.dowork()
