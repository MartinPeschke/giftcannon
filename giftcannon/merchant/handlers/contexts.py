from pyramid.httpexceptions import HTTPForbidden
from pyramid.decorator import reify

### jsonmapper imports
from jsonmapper.messages import GenericErrorMessage, GenericBlockMessage
from jsonmapper.backend import DBMessage
### local imports
from ..models.auth import Merchant, GetOperatorsProc, PasswordTokenVerifyProc
from giftcannon.models.config import GetConfigProc

class MerchantRootContext(object):
  static_prefix= '/merchant'
  def __init__(self, request):
    self.merchant = request.session.get('merchant', Merchant())
    self.user = self.merchant.operator
    self.backend = request.backend
    if self.merchant.isAnon():
        self.perms = set()
    else:
        self.perms = perms = set([perm.name for perm in self.merchant.permissions if perm.hasAccess])
  def hasPerm(self, perm):
      return perm in self.perms

class AnonymousRequiredContext(MerchantRootContext):
    def __init__(self, request):
      super(AnonymousRequiredContext, self).__init__(request)
      if not self.merchant.isAnon():
        request.fwd("merchant_dashboard")



class OperatorMixin(object):
  @reify
  def operators(self):
    result = GetOperatorsProc(self.backend, {"id":self.merchant.id})
    merchant = Merchant.wrap(result['Merchant'][0]) # BAD, list of one merchant, API needs to change
    return merchant.operators
  @reify
  def oproles(self):
      result = GetConfigProc(self.backend)
      return result.roles


def merchantAuthedContextFactory(label):
  class WorkflowMerchantAuthedContext(MerchantRootContext, OperatorMixin):
    workflow_label = label
    def __init__(self, request):
      super(WorkflowMerchantAuthedContext, self).__init__(request)
      self.perms = perms = set([perm.name for perm in self.merchant.permissions if perm.hasAccess])
      if self.merchant.isAnon():
        request.session.flash(GenericBlockMessage("Please log in first!"), "generic_messages")
        request.fwd("merchant_login")
      if not self.workflow_label in perms:
        request.session.flash(GenericErrorMessage("Insufficient privileges!"), "generic_messages")
        request.fwd("merchant_login")
    def hasPerm(self, perm):
      return perm in self.perms
  return WorkflowMerchantAuthedContext



class MerchantResetPasswordContext(MerchantRootContext):
  def __init__(self, request):
    super(MerchantResetPasswordContext, self).__init__( request)
    self.token = request.matchdict['token']
    try:
        tmp_merchant = Merchant.wrap(PasswordTokenVerifyProc(self.backend, {'token':self.token})[0])
    except DBMessage, e:
        if e.message == 'NO_MERCHANT_FOUND':
            request.session.flash(GenericErrorMessage("Invalid link. If you want to reset your password, plese request another reset email."), "generic_messages")
            request.fwd("merchant_login", _anchor="password-tab")
        else:
            raise e
    else:
        self.user_id = tmp_merchant.operator.id

  def hasPerm(self, perm):
    return False