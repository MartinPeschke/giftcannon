from pyramid.httpexceptions import HTTPFound
from pyramid.config import Configurator
from pyramid.mako_templating import renderer_factory
from pyramid_beaker import session_factory_from_settings,set_cache_regions_from_settings
from pyramid.request import Request
from pyramid.decorator import reify
import random, os, logging
log = logging.getLogger(__name__)


### local imports
from giftcannon.lib.globals import Globals
from giftcannon.models.auth import User
from giftcannon.models.merchant import Merchant


here = os.path.abspath(os.path.join(__file__, "../.."))
VERSION_FILE = os.path.join(here, "VERSION_TOKEN")

if os.path.exists(VERSION_FILE):
  VERSION_TOKEN = open(VERSION_FILE).read().strip()
else:
  VERSION_TOKEN = random.random()
log.info("USING NEW STATIC RESOURCE TOKEN: %s", VERSION_TOKEN)

def add_renderer_globals(system):
    request = system['request']
    app_globals = request.registry.settings["g"]
    result = {
            "BINGKEY" : app_globals.BingMapsKey
            , "FBAPPID" : app_globals.FbAppID
            , "VERSION_TOKEN" : VERSION_TOKEN
            , "IS_DEBUG" : app_globals.is_debug
            , "DEPLOY_CONFIG" : app_globals.deploy_config
            , "app_globals" : app_globals
            , 'view_context' : request.context
            }
    return result

class ExtendedRequest(Request):
  _LOCALE_ = 'en'
  @reify
  def user(self):
    return self.session.get('user', User())
  @reify
  def furl(self):
    return str(self.params.get("furl") or self.path_qs)
  @reify
  def backend(self):
    return self.registry.settings["g"].backend


  def fwd_url(self, route_name, *args, **kwargs):
    app_url = self.headers.get('X-Forwarded-Proto', "http") + "://" + self.headers.get('X-Forwarded-Host', self.host)
    return self.route_url(route_name, _app_url = app_url, *args, **kwargs)
  def fwd(self, route_name, *args, **kwargs):
    raise HTTPFound(location = self.fwd_url(route_name, *args, **kwargs))

  def rld(self, *args, **kwargs):
    app_url = self.headers.get('X-Forwarded-Proto', "http") + "://" + self.headers.get('X-Forwarded-Host', self.host)
    raise HTTPFound(location = self.current_route_url(_app_url = app_url, *args, **kwargs))


def main(global_config, **settings):
    """ This function returns a Pyramid WSGI application.
    """
    settings["g"] = g = Globals(**settings)
    config = Configurator(settings=settings
              , request_factory = ExtendedRequest
              , renderer_globals_factory = add_renderer_globals
              , session_factory = session_factory_from_settings(settings))
    config.add_renderer(".html", renderer_factory)
    set_cache_regions_from_settings(settings)
    
    config.include("giftcannon.website.handlers")
    config.include("giftcannon.merchant.handlers")
    config.include("giftcannon.admin")
    config.scan()
    return config.make_wsgi_app()
