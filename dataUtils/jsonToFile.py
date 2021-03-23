import json


def jsonToText(file, jason):
    s = json.dumps(jason)
    with open(file, 'w') as f:
        f.write(s)
    f.close()
