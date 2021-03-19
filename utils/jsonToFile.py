import json
from getGeoData import getAllGeoData


def jsonToFile(file, jason):
    s = json.dumps(jason)
    with open(file, 'w') as f:
        f.write(s)
    f.close()


jason = getAllGeoData()

# jason = {'a': {'b': 1}}
jsonToFile('./out2.txt', jason)
