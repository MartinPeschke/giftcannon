from pyramid.view import view_config
from pyramid.httpexceptions import HTTPNotFound
from operator import attrgetter
from itertools import ifilter, imap
from beaker.cache import cache_region
import logging, simplejson, formencode
log = logging.getLogger(__name__)

### jsonmapper imports
from jsonmapper.backend import DBMessage

### local imports
from giftcannon.models.auth import login_protected
from giftcannon.models.gift import Gift, GetGiftFromToken, GetPaymentResult, GetGiftFromActionLink



def is_logged_in(req):
  return req.session.get("user") is not None

class WorkFlowFlashItem(object):
    def __init__(self, type):
        self.type = type

class PresetWorkItem(object):
    def __init__(self, payload):
        self.payload = payload
  

def getCatalog(g):
  def f(prod, cat):
      prod['quantity'] = 1
      prod['category_id'] = cat['id']
      return prod
  catalog = g.backend("Category", url="/api/product/catalog")
  highlighted_products = [f(p, cat) for cat in catalog for p in cat.get("Product", []) if p['highlight']]
  count = len(highlighted_products)-1

  for i,c in enumerate(highlighted_products):
      c['picture_url'] = g.getStaticUrl(c['picture'])
      c['is_last'] = (count == i)
      
  return highlighted_products



@view_config(route_name='payment_success')
@login_protected
def payment_success(request):
  request.session.flash(WorkFlowFlashItem("payment_success"), "workflow")
  request.fwd('gift_coupon',**request.matchdict)

@view_config(route_name='gift_coupon', renderer='giftcannon:website/templates/gift/gift_coupon.html')
def gift_coupon(request):
    token = request.matchdict['token']
    g = request.registry.settings["g"]
    try:
      gift = GetGiftFromToken(request.backend, {"token":token})
    except DBMessage, e:
      log.error(e)
      raise HTTPNotFound()
    
    is_payment_success = len(filter(lambda x: x.type=='payment_success', request.session.peek_flash("workflow"))) > 0 
    if(is_payment_success):request.session.pop_flash("workflow")
    
    highlighted_products = getCatalog(g)
    return {'title':'GiftCannon - Give a Gift',  'values' : {}, 'token': token, "gift":gift, "is_payment_success":is_payment_success, "highlighted_products":highlighted_products}



@view_config(route_name='gift', renderer='giftcannon:website/templates/gift/gift.html')
def gift(request):
  g = request.registry.settings["g"]
  preset = request.session.pop_flash("preset_gift")
  has_preset = len(preset) > 0
  if(has_preset):
    preset = preset[0].payload
  return {'title':'GiftCannon - Give a Gift',  'values' : {}, 'pre_filled' : has_preset, "preset":preset}


@view_config(route_name='preset_gift', renderer='giftcannon:website/templates/gift/gift.html')
def preset_gift(request):
    actionlink = request.matchdict['actionlink']
    g = request.registry.settings["g"]
    try:
      gift = GetGiftFromActionLink(request.backend, {"actionlink":  {"actionlink": actionlink }})
    except DBMessage, e:
      log.error(e)
      raise HTTPNotFound()
    request.session.pop_flash("preset_gift")
    request.session.flash(PresetWorkItem(gift.unwrap()), "preset_gift")
    request.fwd('gift')

@view_config(route_name='preset_recipient', request_method="POST", request_param="rcpt")
def preset_recipient(request):
    gift = simplejson.loads(request.POST['rcpt'])
    request.session.pop_flash("preset_gift")
    request.session.flash(PresetWorkItem(gift), "preset_gift")
    request.fwd('gift')


@view_config(route_name='paypal_result', request_method="GET", request_param="merchantReference")
def paypal_result(request):
  result = {}
  for k,v in request.params.iteritems():
    result[k] = v
  try:
    result = GetPaymentResult(request.backend, result)
  except DBMessage, e:
    request.fwd('gift', _anchor="send/failed")
  else:
    if result.success:
      request.session.flash(WorkFlowFlashItem("payment_success"), "workflow")
      request.fwd('gift_coupon',token = result.giftToken)
    else:
      request.fwd('gift', _anchor="send/failed")