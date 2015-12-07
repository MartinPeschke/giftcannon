from collections import OrderedDict
from operator import attrgetter
from pyramid.view import view_config, view_defaults
from pyramid.httpexceptions import HTTPNotFound
import logging, simplejson, formencode, datetime
log = logging.getLogger(__name__)

### jsonmapper imports
from jsonmapper.backend import DBMessage, DBException
from jsonmapper.messages import GenericSuccessMessage,GenericErrorMessage
from jsonmapper.basehandlers import FullValidatedFormHandler, OneOfState

### local imports
from dashboard import mlogin
from ..models.auth import CreateOperatorProc, DeleteOperatorProc
from giftcannon.lib.baseview import BaseForm



@view_config(route_name='merchant_settings', renderer='giftcannon:merchant/templates/settings/settings.html')
def settings(context, request):
  return {'title':'GiftCannon - merchant area', 'errors':{}, 'values':context.merchant.unwrap()}

@view_defaults(route_name='merchant_settings_operators', renderer='giftcannon:merchant/templates/settings/operators.html')
class MerchantOperators(FullValidatedFormHandler):
                class CreateMerchantOperatorForm(BaseForm):
                  form_id = "create"
                  form_order = ['role', 'firstName', 'lastName', 'email', 'pwd']
                  html_classes = "success-validated"


                  role = OneOfState(stateKey = 'context.oproles', getValue = attrgetter("name"), getKey = attrgetter("name")\
                    ,hideList = True, required=True, not_empty=True, html_type='select', html_label="Role")
                  firstName = formencode.validators.String(required=True, not_empty=True, min=2
                                                          , html_type='text', html_label="First name")
                  lastName = formencode.validators.String(required=True, not_empty=True, min=2
                                                          , html_type='text', html_label="Last name")

                  email = formencode.validators.Email(required=True, not_empty=True, resolve_domain=False, min=3
                                                      , html_type='email', html_label="Email")

                  pwd = formencode.validators.String(required=True, not_empty=True, min=4
                                                          , html_type='password', html_label="Password")

                  def on_success(self, request, values):
                    try:
                        CreateOperatorProc(request.backend, {"merchant":{"id":request.context.merchant.id, \
                                                                     "Operator":values}})
                    except DBMessage, e:
                        if e.message == 'EMAIL_ALREADY_TAKEN':
                           return {'values':values, 'errors': {'email' : 'Email already taken'}}
                        else: raise e
                    request.session.flash(GenericSuccessMessage("Operator has been created successfully."), "generic_messages")
                    request.fwd("merchant_settings_operators")

                schemas = OrderedDict([(cls.form_id, cls) for cls in [CreateMerchantOperatorForm]])


@view_config(route_name='merchant_settings_operator_delete')
def merchant_operator_delete(context, request):
    try:
        DeleteOperatorProc(request.backend, {key:request.matchdict[key] for key in ['id']})
    except (DBMessage, DBException), e:
        request.session.flash(GenericErrorMessage("Operator could not be deleted successfully."), "generic_messages")
    else:
        request.session.flash(GenericSuccessMessage("Operator has been deleted successfully."), "generic_messages")
    request.fwd("merchant_settings_operators")