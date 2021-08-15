import requests
from jsonToFile import jsonToText
from bs4 import BeautifulSoup
from places import places, states, countries, provinces
from slugify import slugify
import sys

def getLatLongAndFlag(place):
    api_key = "ff2748c6dacc003d8c4f83e4aaba7c93"
    res = requests.get("http://api.positionstack.com/v1/forward", params={
        'access_key': api_key,
        'query': place,
        'limit': 1,
        'country_module': 1,
        'fields': ["results.longitude", "results.latitude"],
    })
    # position stack api is weird, sometimes empty data is returned
    # need to make the api call over and over until we get the data
    while 'data' not in res.json().keys() or len(res.json()['data'][0]) == 0:
        res = requests.get("http://api.positionstack.com/v1/forward", params={
            'access_key': api_key,
            'query': place,
            'country_module': 1,
            'limit': 1,
            'fields': ["results.longitude", "results.latitude"],
        })
    latitude = res.json()['data'][0]['latitude']
    longitude = res.json()['data'][0]['longitude']
    flag = res.json()['data'][0]['country_module']['flag']
    data = {'latitude': latitude, 'longitude': longitude, 'flag':flag}
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

if __name__ == '__main__':
    data = {}
    state_set = set(states)
    country_set = set(countries)
    province_set = set(provinces)
    for place in places:
        try:
            print(f'Adding {place}')
            place_data = {
                'slugs': [
                    slugify(place)
                ],
                **getLatLongAndFlag(place)
            }
            # place_data['size'] = getSize(place)
            if place in state_set:
                place_data['place_type'] = 'state'
            elif place in country_set:
                place_data['place_type'] = 'country'
            elif place in province_set:
                place_data['place_type'] = 'province'
            else:
                raise Exception(f'{place} is not a state, country or province')
            data[place] = place_data
            print(f'Finished {place}\n')
        except:
            try:
                print(f'Retry Adding {place}')
                place_data = {
                    'slugs': [
                        slugify(place)
                    ],
                    **getLatLongAndFlag(place)
                }
                # place_data['size'] = getSize(place)
                if place in state_set:
                    place_data['place_type'] = 'state'
                elif place in country_set:
                    place_data['place_type'] = 'country'
                elif place in province_set:
                    place_data['place_type'] = 'province'
                else:
                    raise Exception(f'{place} is not a state, country or province')
                data[place] = place_data
                print(f'Finished retry {place}\n')
            except (KeyboardInterrupt):
                sys.exit(0)
    jsonToText('./data.txt', data)


