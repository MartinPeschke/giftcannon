from collections import deque
from pyramid.view import view_config
from jsonmapper.backend import DBMessage
from giftcannon.models.auth import login_protected
from giftcannon.models.gift import Gift
from operator import attrgetter, methodcaller, itemgetter
from itertools import ifilter, imap
import logging, simplejson, formencode
log = logging.getLogger(__name__)

def is_logged_in(req):
  return req.session.get("user") is not None




def split_gifts(gifts, me):
  gifts_holder = { True:{True:[], False:[]} , False: {True:[], False:[]} }
  
  rcvd_gifts = []
  sent_gifts = []
  
  for gift in sorted(gifts, key = itemgetter("created"), reverse = True):
    g = Gift.wrap(gift)
    gifts_holder[g.isForMeId(me)][g.isRedeemed()].append(g)

  return   dict(rcvd_gifts_new = gifts_holder[True][False]
              , rcvd_gifts_history = gifts_holder[True][True]
              , sent_gifts_new = gifts_holder[False][False]
              , sent_gifts_history = gifts_holder[False][True]
              )


@view_config(route_name='me_gifts', renderer='giftcannon:website/templates/me/gifts.html')
@login_protected
def me_gifts(request):
  g = request.registry.settings["g"]
  mygifts = g.backend("User", method="POST", url="/api/user/mygifts", data = {"user":{"id":request.user.id}}).get("Gift", [])
  gifts = split_gifts(mygifts, request.user.id)
  gifts.update({'title':'GiftCannon - My Gifts'})
  return gifts