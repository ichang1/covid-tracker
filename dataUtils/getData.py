import requests
from jsonToFile import jsonToText
from bs4 import BeautifulSoup


def getData():
    data = {}

    continents_res = requests.get("https://disease.sh/v3/covid-19/continents")
    for c in continents_res.json():
        continent_name = c['continent']
        url = f'https://disease.sh/v3/covid-19/continents/{continent_name}'
        api = 'Worldometers'
        lat_long = getLatLong(continent_name)
        latitude = lat_long['latitude']
        longitude = lat_long['longitude']
        area = getSize(continent_name)
        place_data = {
            'url': url,
            'api': api,
            'latitude': latitude,
            'longitude': longitude,
            'area': area
        }
        data[continent_name] = place_data

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
        state_name = s['state']
        if state_name not in states_dont_add:
            url = f"https://disease.sh/v3/covid-19/states/{state_name}"
            api = 'Worldometers'
            lat_long = getLatLong(state_name)
            latitude = lat_long['latitude']
            longitude = lat_long['longitude']
            area = getSize(state_name)
            place_data = {
                'url': url,
                'api': api,
                'latitude': latitude,
                'longitude': longitude,
                'area': area
            }
            data[state_name] = place_data

    country_res = requests.get("https://disease.sh/v3/covid-19/countries")
    for c in country_res.json():
        country_name = c['country']
        url = f"https://disease.sh/v3/covid-19/countries/{country_name}"
        api = 'Worldometers'
        if country_name == 'UK':
            country_name = 'United Kingdom'
            lat_long = getLatLong(country_name)
            latitude = lat_long['latitude']
            longitude = lat_long['longitude']
            area = getSize(country_name)
            place_data = {
                'url': url,
                'api': api,
                'latitude': latitude,
                'longitude': longitude,
                'area': area
            }
            data[country_name] = place_data
        elif 'Princess' in country_name:
            continue
        else:
            lat_long = getLatLong(country_name)
            latitude = lat_long['latitude']
            longitude = lat_long['longitude']
            area = getSize(country_name)
            place_data = {
                'url': url,
                'api': api,
                'latitude': latitude,
                'longitude': longitude,
                'area': area
            }
            data[country_name] = place_data

    province_res = requests.get("https://disease.sh/v3/covid-19/jhucsse")
    for p in province_res.json():
        country = p['country']
        province = p['province']
        api = 'JHUCSSE'
        url = 'https://disease.sh/v3/covid-19/jhucsse'
        if country != 'US' and province != None and province != 'Unknown' and 'Princess' not in province:
            lat_long = getLatLong(province)
            latitude = lat_long['latitude']
            longitude = lat_long['longitude']
            area = getSize(province)
            place_data = {
                'url': url,
                'api': api,
                'latitude': latitude,
                'longitude': longitude,
                'area': area
            }
            data[province] = place_data
    return data


def getLatLong(place):
    api_key = "ff2748c6dacc003d8c4f83e4aaba7c93"
    res = requests.get("http://api.positionstack.com/v1/forward", params={
        'access_key': api_key,
        'query': place,
        'limit': 1,
        'fields': ["results.longitude", "results.latitude"],
    })
    # position stack api is weird, sometimes empty data is returned
    # need to make the api call over and over until we get the data
    while 'data' not in res.json().keys() or len(res.json()['data'][0]) == 0:
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


def getSize(place):
    def hasDigit(s):
        digits = [str(i) for i in range(10)]
        for d in digits:
            if d in s:
                return True
        return False

    url = 'https://www.google.com/search?q=area+of'
    for p in place.split(" "):
        url += f"+{p}"
    res = requests.get(url)

    html_doc = res.content
    soup = BeautifulSoup(html_doc, 'html.parser')
    tags = soup.find_all('div')

    for tag in tags:
        text = tag.get_text()
        if 0 < len(text) < 20 and text[0] in '0123456789' and ('mi' in text or 'acres' in text):
            text = ' '.join(text.split())
            parts = text.split(" ")
            if len(parts) > 2:
                area = float(''.join(parts[0].split(','))) * 1000000
            else:
                area = float(''.join(parts[0].split(',')))

            assert(area > 0)
            return area
    return 0


jason = getData()
jsonToText('./data.txt', jason)
