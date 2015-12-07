import simplejson

from collections import namedtuple
Type = namedtuple("Type", ['type', 'default', 'required'])
AnnotatedType = namedtuple("AnnotatedType", ['type', 'default', 'required', 'annotation'])


class Base(object):
  private_attrs = []
  do_not_show_attrs = []
  input_map = {int:'number', 'operator.email':'email'}

  _include_root = False

  def getPictureUrl(self, req):
      g = req.registry.settings["g"]
      return g.getStaticUrl(self.picture)
  def hasPicture(self):
    return 'picture' in dict(self.spec)

  def __init__(self, params):
    for k,s in self.spec:
      if(s.required):
        value = params[k]
      else:
        value = params.get(k) or s.default
      if value is not None:
        if(type(value) == list):
          setattr(self, k.lower(), map(s.type, filter(None, value)))
        else:
          try:
            setattr(self, k.lower(), s.type(value))
          except ValueError, e:
            raise ValueError("Invalid value '{}' for '{}', ({})".format(value, k, unicode(e)))
      else:
         setattr(self, k.lower(), None)
    
  def getAll(self):
      return [(k,getattr(self, k, None), s.required) for k,s in self.spec if k != 'id']
  def toJSON(self):
    return dict(self.getAll())

  @classmethod
  def getHTMLInput(cls, name, t):
    return cls.input_map.get(name, cls.input_map.get(t.type, 'text'))


  @classmethod
  def getDataTypeAnnotation(cls, name, t):
    if isinstance(t, AnnotatedType):
        return 'data-type="{}"'.format(t.annotation)
    else:
        return ""
  

  @classmethod
  def getHTMLSpec(cls):
    result = [] 
    for k,v in cls.spec:
      if k not in cls.private_attrs and k not in cls.do_not_show_attrs:
        k = "{}{}".format(cls.getJSONRoot(), k)

        if(type(v.type) == type and issubclass(v.type, Base)):
          params = v.type.getHTMLSpec()
          result.extend([("{}.{}".format(k.lower(),key), t) for key,t in params])
        else:
          result.append((k,v))
    return result
  def getMinimalJSON(self):
      return '{}'
  
  @classmethod
  def getDisplayName(cls):
    return getattr(cls, "_name", cls.__name__)
  @classmethod
  def getEntityName(cls):
    return getattr(cls, "_entity_name", cls.__name__)
  @classmethod
  def getJSONRoot(cls):
    return "{}.".format(cls.__name__).lower() if cls._include_root else ""
  @classmethod
  def wrap(cls, obj):
    return obj


class Merchant(Base):
  private_attrs = ['id']
  do_not_show_attrs = ['picture']
  spec = [('id',     Type(int, None, True))
          ,('name',     Type(unicode, None, False))
          ,('bankName',     Type(unicode, None, False))
          ,('accountNumber',     Type(unicode, None, False))
          ,('commission',     Type(float, None, False))
          ,('sortCode',     Type(unicode, None, False))
          ,('holder',     Type(unicode, None, False))
          ]
  def getDeleteJSON(self):
      return simplejson.dumps({'query':{'merchant':{'id':self.id}}, 'key':'merchant', 'url':'/merchant/admin/deletemerchant'})
  def getUpdateJSON(self):
      return simplejson.dumps({'query':{'merchant':{'id':self.id, 'name':self.name}}, 'key':'merchant', 'url':'/merchant/admin/updatemerchant'})
  def getCommissionDisplay(self, with_percentage = True):
      return "{}{}".format(self.commission*100, " %" if with_percentage else "")
class Product(Base):
  private_attrs = ['id']
  do_not_show_attrs = ['picture']
  spec = [('id',     Type(int, None, True))
          ,('name',         Type(unicode, "", True))
          ,('description',  Type(unicode, "", True))
          ,('highlight',    Type(bool, "", True))
          ,('picture',      Type(str, "", True))
         ]
  def getDeleteJSON(self):
      return simplejson.dumps({'query':{'product':{'id':self.id}}, 'key':'product', 'url':'/merchant/admin/deleteproduct'})
  def getUpdateJSON(self):
      return simplejson.dumps({'query':{'product':{'id':self.id}}, 'key':'product', 'url':'/merchant/admin/updateproduct'})


class MProduct(Base):
  private_attrs = ['id']
  spec = [('id',     Type(int, None, True))
          ,('name',         Type(unicode, "", True))
          ,('description', Type(unicode, "", True))
          ,('picture',     Type(str, "", True))
          ,('price',     Type(int, "", True))
         ]

class Category(Base):
  private_attrs = ['id', 'name']
  spec = [('id',     Type(int, None, True))
          , ('name', Type(unicode, "", False))
          , ('picture', Type(str, "", False))
          , ('sort', Type(int, 0, False))
          , ("Product", Type(Product, [], False))
          ]
  def getDeleteJSON(self):
      return simplejson.dumps({'query':{'category':{'id':self.id}}, 'key':'category', 'url':'/merchant/admin/deletecategory'})
  def getUpdateJSON(self):
      return simplejson.dumps({'query':{'category':{'id':self.id}}, 'key':'category', 'url':'/merchant/admin/updatecategory'})


class Venue(Base):
  private_attrs = ['id']
  do_not_show_attrs = ['picture']
  spec = [("id",           Type(int, None, False))
          ,("name",        Type(unicode, "", True))
          ,("line1",       Type(unicode, "", True))
          ,("post_code",   Type(unicode, "", True))
          ,("city",        Type(unicode, "", True))
          ,("area",        Type(unicode, "", True))
          ,("longitude",   Type(float, None, False))
          ,("latitude",    Type(float, None, False))
          ,('picture',     Type(str, "", True))
          ,('url',         Type(str, "", True))
          ,('description', Type(unicode, "", True))]
  def getDeleteJSON(self, merchant_id = None):
      return simplejson.dumps({'query':{'venue':{'id':self.id}}, 'key':'venue', 'url':'/merchant/admin/deletevenue'})
  def getUpdateJSON(self, merchant_id = None):
      return simplejson.dumps({'query':{'venue':{'id':self.id}}, 'key':'venue', 'url':'/merchant/admin/updatevenue'})

class MerchantDetails(Base):
  spec = [("Product",    Type(MProduct, [], False))
          , ("Venue",    Type(Venue, [], False))
          , ("Merchant", Type(Merchant, None, False))]
  def getProductMap(self):
    result = getattr(self, "productmap", None)
    if result is None:
      result = dict([(p.id, p) for p in self.product])
      setattr(self, "productmap", result)
    return result
  
  def containsProduct(self, product):
    return product.id in self.getProductMap()
  def getProductPrice(self, product):
    price = getattr(self.getProductMap().get(product.id), 'price', "")
    if price: price = "%.2f" % (float(price)/100)
    return price




class Operator(Base):
  _name = "Operator"
  _entity_name = "Operator"
  spec = [("firstName",    Type(unicode, None, True))
          , ("lastName",    Type(unicode, None, True))
          , ("pwd",    Type(unicode, None, True))
          , ("email", Type(str, None, True))]
class CreateMerchant(Base):
  _name = "Merchant"
  _entity_name = "Merchant"
  spec = [("name",    Type(unicode, None, True))
          , ("Operator", Type(Operator, None, False))
          , ("commission",    AnnotatedType(float, None, True, 'percentage'))
          ]




from jsonmapper import Mapping, IntegerField
from jsonmapper.backend import RemoteProc

UpdateMerchantDetails = RemoteProc(method="POST", remote_path="/merchant/admin/updatemerchant")
BankDetailsDetails = RemoteProc(method="POST", remote_path="/merchant/admin/bankdetails")