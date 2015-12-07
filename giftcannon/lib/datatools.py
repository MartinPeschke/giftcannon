import datetime

def chainF(f1, f2):
    return lambda x: f2(f1(x))
def parseTime(val):
  return datetime.datetime.strptime(val.rsplit('.',1)[0], '%Y-%m-%dT%H:%M:%S')
def getMonthPrefix(datet):
  return datetime.datetime(datet.year, datet.month,1)