from decorator import decorator
from pyramid.view import view_config, view_defaults
from operator import attrgetter
from collections import OrderedDict
import logging, simplejson, formencode, datetime, itertools
log = logging.getLogger(__name__)

### jsonmapper imports
from jsonmapper.backend import DBMessage
from jsonmapper.basehandlers import FullValidatedFormHandler
from jsonmapper.messages import GenericSuccessMessage, GenericErrorMessage

### local imports
from giftcannon.lib.datatools import parseTime, getMonthPrefix, chainF
from giftcannon.models.gift import Gift
from ..models.auth import Merchant, LoginProc, PasswordRequestProc, UpdatePasswordProc
from giftcannon.lib.baseview import BaseForm

#@view_config(route_name='merchant_signup', renderer='giftcannon:merchant/templates/signup.html')
#def signup(context, request):
#  return {'title':'GiftCannon - merchant sign up'}

def mlogin(request, merchant):
    if isinstance(merchant, dict):
        merchant = Merchant.wrap(merchant)
    request.session['merchant'] = merchant
    return request.session['merchant']



@view_defaults(route_name='merchant_login_password', renderer = "giftcannon:merchant/templates/password_reset.html")
class MerchantLoginPasswordReset(FullValidatedFormHandler):
                class PasswordResetForm(BaseForm):
                  form_id = "pwdreset"
                  form_order = ['pwd', 'pwdconfirm']
                  pwd = formencode.validators.String(required=True, not_empty=True, min=2
                                                          , html_type='password', html_label="New password")

                  pwdconfirm = formencode.validators.String(required=True, not_empty=True, min=2
                                                          , html_type='password', html_label="Confirm password")

                  chained_validators = [formencode.validators.FieldsMatch('pwd', 'pwdconfirm')]

                  def on_success(self, request, values):
                    
                    try:
                        UpdatePasswordProc(request.backend, {"operator":{'id':request.context.user_id, 'pwd':values['pwd']}})
                    except DBMessage, e:
                        raise e
                    request.session.flash(GenericSuccessMessage("Your password has been updated. You can now login with your new password."), "generic_messages")
                    request.fwd("merchant_login",_anchor="login")
                schemas = OrderedDict([(cls.form_id, cls) for cls in [PasswordResetForm]])


@view_defaults(route_name='merchant_login', renderer='giftcannon:merchant/templates/login.html')
class MerchantLogin(FullValidatedFormHandler):
                class LoginForm(BaseForm):
                    form_id = "login"
                    form_order = ['email', 'pwd']
                    email = formencode.validators.Email(required=True, not_empty=True, resolve_domain=True, min=3
                                                        , html_type='email', html_label="email")

                    pwd = formencode.validators.String(required=True, not_empty=True, min=1
                                                        , html_type='password', html_label="password")

                    def on_success(self, request, values):
                        try:
                            merchant = LoginProc(request.backend, {k:values[k] for k in ['email', 'pwd']})
                        except DBMessage, e:
                            return {'values': values, 'errors': {'email':'Unknown Email'}}
                        else:
                            merchant.email = values["email"]
                            merchant.pwd = values["pwd"]
                            mlogin(request, merchant)
                            request.fwd("merchant_dashboard")

                class PasswordResetForm(BaseForm):
                  form_id = "password"
                  form_order = ['email']
                  email = formencode.validators.Email(required=True, not_empty=True, resolve_domain=False, min=3
                                                      , html_type='email', html_label="email")
                  def on_success(self, request, values):
                    values['activationLink'] = request.fwd_url("merchant_login_password_wo")
                    try:
                        PasswordRequestProc(request.backend, {"operator":values})
                    except DBMessage, e:
                      if e.message == 'NO_MERCHANT_WITH_THIS_EMAIL':
                        errors = {"email": "Unknown email"}
                        return {'values' : values, 'errors':errors}
                      elif e.message == "TOKEN_SET_IN_LAST_24_HOURS":
                        request.session.flash(GenericErrorMessage("An email with a password reset link had already been sent out in the last 24 hours. Please check your inbox."), "generic_messages")
                        request.fwd("merchant_login", _anchor="login")
                      else: raise e
                    request.session.flash(GenericSuccessMessage("An email with a password reset link has been sent out. Please check your inbox."), "generic_messages")
                    request.fwd("merchant_login", _anchor="login")
                schemas = OrderedDict([(cls.form_id, cls) for cls in [LoginForm, PasswordResetForm]])


@view_config(route_name='merchant_logout')
def logout(context, request):
  if("merchant" in request.session):
    del request.session['merchant']
  request.fwd("merchant_login")


@view_config(route_name='merchant_dashboard', renderer='giftcannon:merchant/templates/dashboard/dashboard.html')
def merchant_dashboard(context, request):
  return {'title':'GiftCannon - merchant area'}

@view_config(route_name='merchant_code_validate', renderer='json')
def code_validate(context, request):
  params = request.json_body
  params['merchant_id'] = context.merchant.id
  g = request.registry.settings["g"]
  try:
    result_map = g.backend("Gift", method="POST", url="/api/merchant/validate", data = {"code" : params})
  except DBMessage, e:
    return {"success": False, "error": "Invalid Coupon Code"}
  else:
    return result_map


@view_config(route_name='merchant_code_redeem', renderer='json')
def code_redeem(context, request):
  params = request.json_body
  params['merchant_id'] = context.merchant.id
  g = request.registry.settings["g"]
  try:
    result_map = g.backend("Gift", method="POST", url="/api/merchant/redeem", data = {"code" : params})
  except DBMessage, e:
    return {"success": False, "error": "Invalid Coupon Code"}
  else:
    return result_map



@view_config(route_name='merchant_dashboard_history', renderer='giftcannon:merchant/templates/dashboard/history.html')
def merchant_dashboard_history(context, request):
  history_by_month = {}
  g = request.registry.settings["g"]
  result = g.backend('MerchantGift', method="POST", url="/api/merchant/history", data = {"merchant" : {'id':context.merchant.id}})
  if(result.get('Gift')):
    
    history = sorted(map(Gift.wrap, result['Gift']), key = attrgetter("redeemed"), reverse = True)
    history_by_month = itertools.groupby(history, key = lambda x: getMonthPrefix(x.redeemed))


  return {'title':'GiftCannon - merchant area', 'history': history_by_month}

@view_config(route_name='merchant_support', renderer='giftcannon:merchant/templates/support.html')
def merchant_support(context, request):
  return {'title':'GiftCannon - Merchant Support'}