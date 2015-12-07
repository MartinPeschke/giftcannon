from pyramid.httpexceptions import HTTPFound
from pyramid.view import view_config, view_defaults
from collections import OrderedDict
import formencode
from views import get_globals, findMerchant

### jsonmapper imports
from jsonmapper.basehandlers import FullValidatedFormHandler, DecimalValidator
from jsonmapper.messages import GenericErrorMessage, GenericSuccessMessage
###local imports
from giftcannon.admin.models.merchant import Merchant, Product, Venue, MerchantDetails, CreateMerchant, Category
from giftcannon.admin.models import merchant
from .models.merchant import UpdateMerchantDetails, BankDetailsDetails


@view_defaults(route_name='admin_bank_details', renderer='giftcannon:admin/templates/details.html')
class AdminBankDetails(FullValidatedFormHandler):
                """merchant/admin/bankdetails  expect merchant{id, bankName, accountNumber, sortCode, holder}"""
                
                class DetailsForm(formencode.Schema):
                  form_id = "merchant"
                  form_order = ['name', 'commission']
                  allow_extra_fields = True
                  filter_extra_fields = True

                  @classmethod
                  def getFURL(cls, request):
                    return request.params.get('furl') or request.route_path("home")

                  name = formencode.validators.String(required=True, not_empty=True, min=2
                                                          , html_type='text', html_label="merchant name")
                  commission = DecimalValidator(min=0, if_missing=0, if_empty=0, max = 99.99
                                                          , html_type='number', html_label="commission")
                  def on_success(self, request, values):
                    values['id'] = request.matchdict['id']
                    values['commission'] = float(values['commission'])/100
                    
                    UpdateMerchantDetails(request.backend, values)
                    request.session.flash(GenericSuccessMessage("Merchant Details saved!"), "generic_messages")
                    request.rld()                
                
                
                class BankForm(formencode.Schema):
                  form_id = "bank"
                  form_order = ['holder', 'accountNumber', 'bankName', 'sortCode']
                  allow_extra_fields = True
                  filter_extra_fields = True

                  @classmethod
                  def getFURL(cls, request):
                    return request.params.get('furl') or request.route_path("home")

                  bankName = formencode.validators.String(required=True, not_empty=True, min=2
                                                          , html_type='text', html_label="bank name")
                  accountNumber = formencode.validators.String(required=True, not_empty=True, min=2
                                                          , html_type='text', html_label="account number")
                  sortCode = formencode.validators.String(required=True, not_empty=True, min=2
                                                          , html_type='text', html_label="sort code")
                  holder = formencode.validators.String(required=True, not_empty=True, min=2
                                                          , html_type='text', html_label="account holder")

                  def on_success(self, request, values):
                    values['id'] = request.matchdict['id']
                    BankDetailsDetails(request.backend, values)
                    request.session.flash(GenericSuccessMessage("Bank Details saved!"), "generic_messages")
                    request.rld()
                schemas = OrderedDict([(cls.form_id, cls) for cls in [DetailsForm, BankForm]])
                def add_globals(self, request, values):
                    g = request.registry.settings["g"]
                    mid = int(request.matchdict['id'])
                    values.update( get_globals(request) )
                    values['merchant'] = findMerchant(mid, values)
                    values['md'] = MerchantDetails(g.backend("Merchant_Details", method="POST", url="/merchant/admin/merchantdetails", data = {"merchant": {"id":mid}}))
                    values['title'] = 'GiftCannon - Admin Area'
                    return values

                def pre_fill_values(self, request, values):
                  values['values']['merchant']['name'] = values['merchant'].name or ""
                  values['values']['bank']['sortCode'] = values['md'].merchant.sortcode or ""
                  values['values']['bank']['bankName'] = values['md'].merchant.bankname or ""
                  values['values']['bank']['accountNumber'] = values['md'].merchant.accountnumber or ""
                  values['values']['bank']['holder'] = values['md'].merchant.holder or ""
                  values['values']['merchant']['commission'] = values['md'].merchant.getCommissionDisplay(False) or ""
                  return values
