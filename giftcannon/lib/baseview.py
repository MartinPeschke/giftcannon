import formencode

class GenericMessage(object):
  types = ['success', 'info', 'block', 'error', 'danger'] 
  def __init__(self, body, heading= None):
    self.heading = heading
    self.body= body
class GenericSuccessMessage(GenericMessage):
  type = 'success'
class GenericInfoMessage(GenericMessage):
  type = 'info'
class GenericBlockMessage(GenericMessage):
  type = 'block'
class GenericErrorMessage(GenericMessage):
  type = 'error'
class GenericDangerMessage(GenericMessage):
  type = 'danger'


class EmbeddedForm(formencode.Schema):
  allow_extra_fields = True
  filter_extra_fields = True

class BaseForm(EmbeddedForm):
  allow_extra_fields = True
  filter_extra_fields = True
  default_furl_route_name = "home"
  @classmethod
  def getFURL(cls, request):
    return request.params.get('furl') or request.fwd_url(cls.default_furl_route_name)

class BaseHandler(object):
  def __init__(self, context, request):
      self.request = request
      self.context = context
