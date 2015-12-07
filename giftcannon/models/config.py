from jsonmapper import Mapping, TextField, BaseUnitField, IntegerField\
    , PictureField, DictField, DateTimeField, ListField, BooleanField
from jsonmapper.backend import RemoteProc

class Role(Mapping):
    name = TextField()
class Config(Mapping):
    roles = ListField(DictField(Role), name = "Role")

GetConfigProc = RemoteProc("/api/config", method = "GET", root_key = "Config", result_cls = Config)