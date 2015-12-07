from pyramid.view import view_config
from pyramid.httpexceptions import HTTPFound, HTTPNotFound
from pyramid.renderers import render_to_response
import logging
log = logging.getLogger(__name__)


def notfound_view(request):
  return render_to_response('giftcannon:website/templates/404.html', {'title' : "Not Found"}, request=request)