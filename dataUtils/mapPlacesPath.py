import requests
from jsonToFile import jsonToText


def getMapPlacesPath():
    places_path = {}
    continents_res = requests.get("https://disease.sh/v3/covid-19/continents")
    for c in continents_res.json():
        continent_name = c['continent']
        places_path[continent_name] = {
            'api': 'Worldometers',
            'path': f'https://disease.sh/v3/covid-19/continents/{continent_name}'
        }
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
            state_name = s['state']
            places_path[state_name] = {
                'api': 'Worldometers',
                'path': f"https://disease.sh/v3/covid-19/states/{state_name}"
            }
    country_res = requests.get("https://disease.sh/v3/covid-19/countries")
    for c in country_res.json():
        country_name = c['country']
        if country_name == 'UK':
            places_path[
                'United Kingdom'] = {
                    'api': 'Worldometers',
                    'path': f"https://disease.sh/v3/covid-19/countries/{country_name}"}
        elif 'Princess' in c['country']:
            continue
        else:
            places_path[country_name] = {
                'api': 'Worldometers',
                'path': f"https://disease.sh/v3/covid-19/countries/{country_name}"
            }
    province_res = requests.get("https://disease.sh/v3/covid-19/jhucsse")
    for p in province_res.json():
        country = p['country']
        province = p['province']
        if country != 'US' and province != None and province != 'Unknown' and 'Princess' not in province:
            places_path[province] = {
                'api': 'JHUCSSE',
                'path': "https://disease.sh/v3/covid-19/jhucsse"
            }
    return places_path


jason = getMapPlacesPath()

jsonToText('./mapPlacesPath.txt', jason)
