import requests
from jsonToFile import jsonToText
from bs4 import BeautifulSoup

continents = set()
countries = set()
states_provinces = set()


def getAllGeoData(places):
    geodata = []
    for place in places:
        placeData = {}
        placeData['place'] = place
        geoData = getGeoData(place)
        placeData['latitude'] = geoData['latitude']
        placeData['longitude'] = geoData['longitude']
        res = requests.get(f'https://en.wikipedia.org/wiki/{place}')
        html = res.content
        geodata.append(placeData)
    print(len(places), len(geodata))
    return geodata


def getAllPlaces():
    places = []
    continents_res = requests.get("https://disease.sh/v3/covid-19/continents")
    for c in continents_res.json():
        places.append(c['continent'])
        continents.add(c['continent'])
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
            states_provinces.add(s['state'])
    country_res = requests.get("https://disease.sh/v3/covid-19/countries")
    for c in country_res.json():
        if c['country'] == 'UK':
            places.append('United Kingdom')
            countries.add('United Kingdom')
        elif 'Princess' in c['country']:
            continue
        else:
            places.append(c['country'])
            countries.add(c['country'])
    province_res = requests.get("https://disease.sh/v3/covid-19/jhucsse")
    for p in province_res.json():
        country = p['country']
        province = p['province']
        if country != 'US' and province != None and province != 'Unknown' and 'Princess' not in province:
            places.append(p['province'])
            states_provinces.add(p['province'])
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


jason = {'geoData': getAllGeoData(getAllPlaces())}

jsonToText('./placesGeodata.txt', jason)
