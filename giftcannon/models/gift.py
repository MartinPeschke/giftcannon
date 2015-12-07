import simplejson
from datetime import timedelta, datetime
from jsonmapper import Mapping, TextField, BaseUnitField, IntegerField, PictureField, DictField, DateTimeField, BooleanField, FloatField
from jsonmapper.backend import RemoteProc

class Merchant(Mapping):
  id = IntegerField()
  name = TextField()

class Product(Mapping):
  id = IntegerField()
  name = TextField()
  description = TextField()
  price = BaseUnitField()
  picture = PictureField()

class Venue(Mapping):
  id = IntegerField()
  name = TextField()
  description = TextField()
  line1 = TextField()
  post_code = TextField()
  url = TextField()
  city = TextField()
  area = TextField()
  longitude = FloatField()
  latitude = FloatField()
  picture = PictureField()
  merchant = DictField(Merchant, "Merchant")

class User(Mapping):
  id = IntegerField()
  name = TextField()
  picture = PictureField()
  facebook_id = TextField()
  email = TextField()



    
class Gift(Mapping):
  id = IntegerField()
  token = TextField()
  message = TextField()
  thankyou = TextField()
  status = TextField()
  created = DateTimeField()
  issued = DateTimeField()
  redeemed = DateTimeField()
  anonymous = BooleanField()
  expiry = IntegerField()
  quantity = IntegerField(default = 1)
  sender = DictField(User, "Sender")
  recipient = DictField(User, "Recipient")
  venue = DictField(Venue, "Venue")
  product = DictField(Product, "Product")
  netamount = BaseUnitField(name="netAmount")


  def getSenderPicture(self, request):
      if(self.anonymous):
          return "/static/img/sprites/default_profile_picture.png"
      else:
          return self.sender.picture.getPath(request)
        
  def getSenderDisplayName(self):
      if(self.anonymous):
          return "Anonymous"
      else:
          return self.sender.name

  def isOpen(self):
      return self.status == 'OPEN'
  def isIssued(self):
      return self.status == 'ISSUED'
  def isRedeemed(self):
      return self.status == 'REDEEMED'
  def isExpired(self):
    return self.expiry > 0

  def expiresOn(self):
      return (datetime.now() + timedelta(-1*self.expiry)).strftime("%d/%m/%Y")

  def expiresIn(self):
    expiry = -1*self.expiry
    if expiry:
      if expiry == 1:
        return '1 day'
      if expiry < 7:
        return '{} days'.format(expiry)
      if expiry < 31:
        return "{} weeks".format(expiry/7)
      if expiry < 365:
        return "{} months".format(expiry/30)
      return "{} years".format(expiry/365)
  def showExpiry(self):
      return 14 > (-1*self.expiry)

  def getProductNameAndQuantity(self):
    return u"{} x {}".format(self.quantity, self.product.name)
  
  
  def getItemPrice(self):
      return self.product.price
  def getTotalPrice(self):
      return self.product.price * self.quantity
  def getTotalNetPrice(self):
      return self.netamount

  def isForMeId(self, user_id):
    return self.recipient.id == user_id 
  def isForMe(self, user):
    return self.recipient.id == user.id 
  def isValidForMe(self, user):
      return self.isForMe(user) and not self.isRedeemed()
  def isFromMe(self, user):
    return self.sender.id == user.id
  def hasThankYou(self):
    return self.thankyou is not None
  def toJSON(self):
    return simplejson.dumps(self.unwrap())
      

class PaymentResult(Mapping):
    success = BooleanField()
    message = TextField()
    giftToken = TextField()

GetGiftFromToken = RemoteProc("/api/gift/view", method = "POST", root_key = "Gift", result_cls = Gift)
GetGiftFromActionLink = RemoteProc("/api/gift/stub", method = "POST", root_key = "Gift", result_cls = Gift)
GetPaymentResult= RemoteProc("/api/paypal/notice", method = "POST", root_key = "Payment_Result", result_cls = PaymentResult)