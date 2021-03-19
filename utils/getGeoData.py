import requests
from jsonToFile import jsonToText


def getAllGeoData(places):
    geodata = {}
    for place in places:
        geodata[f'{place}'] = getGeoData(place)
    print(len(places), len(geodata))
    return geodata


def getAllPlaces():
    places = []
    continents_res = requests.get("https://disease.sh/v3/covid-19/continents")
    for c in continents_res.json():
        places.append(c['continent'])
    states_res = requests.get("https://disease.sh/v3/covid-19/states")
    states_dont_add = [
        "US Military",
        "Veteran Affairs",
        "Federal Prisons",
        "Grand Princess Ship",
        "Wuhan Repatriated",
        "Diamond Princess Ship",
    ]
    for s in states_res.json():
        if s['state'] not in states_dont_add:
            places.append(s['state'])
    country_res = requests.get("https://disease.sh/v3/covid-19/countries")
    for c in country_res.json():
        if c['country'] == 'UK':
            places.append('United Kingdom')
        elif 'Princess' in c['country']:
            continue
        else:
            places.append(c['country'])
    province_res = requests.get("https://disease.sh/v3/covid-19/jhucsse")
    for p in province_res.json():
        country = p['country']
        province = p['province']
        if country != 'US' and province != None and province != 'Unknown' and 'Princess' not in province:
            places.append(p['province'])
    return places


def getGeoData(place):
    api_key = "ff2748c6dacc003d8c4f83e4aaba7c93"
    res = requests.get("http://api.positionstack.com/v1/forward", params={
        'access_key': api_key,
        'query': place,
        'limit': 1,
        'fields': ["results.longitude", "results.latitude"],
    })
    # position stack api is weird, sometimes empty data is returned
    # need to make the api call over and over until we get the data
    while len(res.json()['data'][0]) == 0:
        res = requests.get("http://api.positionstack.com/v1/forward", params={
            'access_key': api_key,
            'query': place,
            'limit': 1,
            'fields': ["results.longitude", "results.latitude"],
        })

    latitude = res.json()['data'][0]['latitude']
    longitude = res.json()['data'][0]['longitude']
    data = {'latitude': latitude, 'longitude': longitude}
    return data


jason = getAllGeoData()

jsonToText('./placesGeodata.txt', jason)
