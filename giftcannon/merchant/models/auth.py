"""
Endpoint: http://api.dev.giftcannon.com/api/merchant/login, Method: POST
DATA: {"merchant": {"pwd": "a", "email": "2@giftcannon.com"}}
RESULT {"status":0,"proc_name":"merchant_login","Merchant_Login":
{"id":"2","name":"WeatherSpoons admin"
    ,"Workflow":[{"name":"HISTORY","hasAccess":true}
            ,{"name":"REDEEM","hasAccess":true}
            ,{"name":"SETTINGS","hasAccess":true}]}}
"""
from jsonmapper import Mapping, TextField, BaseUnitField, IntegerField\
    , PictureField, DictField, DateTimeField, ListField, BooleanField, DecimalField
from jsonmapper.backend import RemoteProc


class Operator(Mapping):
    id = IntegerField()
    firstName = TextField()
    lastName = TextField()
    email = TextField()
    role = TextField()

class Workflow(Mapping):
  name = TextField()
  hasAccess = BooleanField()

class Merchant(Mapping):
  id = IntegerField()
  name = TextField()
  email = TextField()
  pwd = TextField()

  bankName = TextField()
  accountNumber = TextField()
  sortCode = TextField()
  holder = TextField()
  commission = DecimalField()
  def getCommissionDisplay(self):
      return "{:.1%}".format(self.commission)

  operators = ListField(DictField(Operator), name = "Operators")
  operator = DictField(Operator, name = "Operator")
  permissions = ListField(DictField(Workflow), name = "Workflow")

  def isAnon(self):
    return self.id is None


LoginProc = RemoteProc("/api/merchant/login", method = "POST", root_key = "Merchant_Login", result_cls = Merchant)
GetOperatorsProc = RemoteProc("/api/merchant/operator", method = "POST")
CreateOperatorProc = RemoteProc("/api/merchant/createoperator", method = "POST")
DeleteOperatorProc = RemoteProc("/api/merchant/deleteoperator", method = "POST")


PasswordRequestProc = RemoteProc("/api/merchant/forgotpwd", method = "POST")
PasswordTokenVerifyProc = RemoteProc("/api/merchant/token", method = "POST", root_key = "Merchant")
UpdatePasswordProc = RemoteProc("/api/merchant/resetPwd", method = "POST")
