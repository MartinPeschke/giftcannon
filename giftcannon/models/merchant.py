import simplejson
from jsonmapper import Mapping, TextField, BaseUnitField, IntegerField, PictureField, DictField, DateTimeField

class Merchant(Mapping):
  id = IntegerField()
  name = TextField()
  email = TextField()
  def isAnon(self):
    return self.id is None