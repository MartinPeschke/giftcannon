import simplejson
from decorator import decorator
from itertools import izip_longest, islice
from jsonmapper import Mapping, TextField, BaseUnitField, IntegerField, PictureField, DictField, DateTimeField, TypedField

def grouper(n, iterable, fillvalue=None):
    "grouper(3, 'ABCDEFG', 'x') --> ABC DEF Gxx"
    args = [iter(iterable)] * n
    return izip_longest(*args, fillvalue=fillvalue)

class CardDetails(Mapping):
  type = TextField()
  number = TextField(name='card_number')
  def getSavedGroupedDetails(self, no):
    self._cc_groupings = list(map("".join, grouper(4, self.number, " ")))
    return self._cc_groupings[no]

class AmexCardDetails(CardDetails):
  cvc_length = 4
  cvc_max = 9999
  cvc_hint = "4 digit code on the front of your credit card"

class CreditCardDetails(CardDetails):
  cvc_length = 3
  cvc_max = 999
  cvc_hint = "3 digit code on the back of your credit card"

class User(Mapping):
  id = IntegerField()
  name = TextField()
  picture = PictureField()
  access_token = TextField()
  user_token = TextField()
  facebook_id = TextField()
  email = TextField()
  saved_card_details = TypedField({'AMEX': AmexCardDetails, 'VISA': CreditCardDetails, 'MC': CreditCardDetails}, type_key='type', name="SavedDetails")

  def isAnon(self):
    return self.id is None

  def isMe(self, user_map):
    return (not self.isAnon()) and (self.facebook_id == user_map.get('facebook_id') or self.email == user_map.get('email'))

  def isAnonJSON(self):
      return simplejson.dumps(self.isAnon())
  def toJSON(self):
    return simplejson.dumps(self.unwrap(sparse = True))
  def hasSavedDetails(self):
    return self.saved_card_details is not None

@decorator
def login_protected(func, request, *args, **kwargs):
  if(request.user.isAnon()):
    if(request.headers['Content-Type'].startswith('application/json')):
      return {"redirect": request.route_path("login", _query = dict(furl = request.path_qs))}
    else:
      request.fwd("login", _query = dict(furl = request.path_qs))
  else: return func(request)