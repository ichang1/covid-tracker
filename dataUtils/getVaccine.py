from jsonToFile import jsonToText
import requests
from utils.capitalize import capitalize


def getVaccine():
    url = "https://disease.sh/v3/covid-19/vaccine/coverage/countries?lastdays=all"
    places = {}
    data = requests.get(url).json()

    for p in data:
        name = p['country']
        url = f"https://disease.sh/v3/covid-19/vaccine/coverage/countries/{'%20'.join(name.split(' '))}?lastdays=all"
        places[name] = {'api': url}

    url = "https://disease.sh/v3/covid-19/vaccine/coverage/states?lastdays=all&fullData=true"
    data = requests.get(url).json()

    for place in data:
        state = place['state']
        url = f"https://disease.sh/v3/covid-19/vaccine/coverage/states/{'%20'.join(state.split(' '))}?lastdays=all&fullData=true"
        places[state] = {'api': url}

    return places


jason = getVaccine()
jsonToText('./vaccine.txt', jason)
