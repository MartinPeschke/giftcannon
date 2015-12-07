from jsonmapper.backend import Backend
import logging, simplejson
log = logging.getLogger(__name__)


class Globals(object):
  def __init__ (self, **settings):
    self.is_debug = settings.get('pyramid.debug_javascript', 'false') == 'true'
    self.backend = Backend(settings['backend.api.url'])
    self.FbAppID =  settings['fbappid']
    self.FbApiSecret =  settings['fbapisecret']
    self.BingMapsKey = settings['bingmapskey']
    self.GATrackingCode =  settings['ga_tracking_code']
    self.deploy_config = simplejson.dumps({"resource_host":settings['backend.resource.host']})
    self.resource_host = settings['backend.resource.host']


  def getStaticUrl(self, path):
      if(not path.startswith("/")):
          path = "/{}".format(path)
      return '//{}{}'.format(self.resource_host, path)