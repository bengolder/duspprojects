from django.shortcuts import render_to_response
from django.template import RequestContext
from dusp.config import root_url

class SimpleView():
    def __init__(self, title, template, context=None):
        self.title = title
        self.template = template
        if not context:
            context = {}
        self.context = context
        self.root_url = root_url
    def __call__(self, request):
        self.context['ROOT_URL'] = self.root_url
        self.context['page_title'] = self.title
        return render_to_response(
                self.template,
                RequestContext( request, self.context ),
                )
