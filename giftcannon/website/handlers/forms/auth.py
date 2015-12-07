import formencode
_ = lambda x:x

class LoginForm(formencode.Schema):
  allow_extra_fields = True
  filter_extra_fields = True
  email = formencode.validators.Email(not_empty=True, min=5, max = 255, resolve_domain=False, messages={'empty': _('Please enter an email !')})
  pwd = formencode.validators.String(not_empty=True, messages={'empty': _('Please enter a password !')})
    
class SignupForm(formencode.Schema):
  allow_extra_fields = True
  filter_extra_fields = False
  name = formencode.validators.String(not_empty=True, messages={'empty': _('Please enter a name!')})
  email = formencode.validators.Email(not_empty=True, min=5, max = 255, resolve_domain=True, messages={'empty': _('Please enter an email !')})
  pwd = formencode.validators.String(not_empty=True, min=6, max = 255, messages={'empty': _('Please enter a password !')})
  agreeTOS = formencode.validators.Int(not_empty=True)
  picture = formencode.validators.String(not_empty=True)
  facebook_id = formencode.validators.String(not_empty=True)
  access_token = formencode.validators.String(not_empty=True)
