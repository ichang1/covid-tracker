import requests
from jsonToFile import jsonToText
from utils.capitalize import capitalize


def getTimeSeries():
    places = {}
    url = "https://disease.sh/v3/covid-19/historical?lastdays=all"
    data = requests.get(url).json()
    for place in data:
        country = place['country']
        province = place['province']
        if country and province:
            province = " ".join([capitalize(w) for w in province.split(" ")])
            places[province] = {'api': url, 'US': False}
        elif country:
            country = " ".join([capitalize(w) for w in country.split(" ")])
            places[country] = {'api': url, 'US': False}
        else:
            continue

    states = [
        "alabama",
        "alaska",
        "american samoa",
        "arizona",
        "arkansas",
        "california",
        "colorado",
        "connecticut",
        "delaware",
        "district of columbia",
        "florida",
        "georgia",
        "guam",
        "hawaii",
        "idaho",
        "illinois",
        "indiana",
        "iowa",
        "kansas",
        "kentucky",
        "louisiana",
        "maine",
        "maryland",
        "massachusetts",
        "michigan",
        "minnesota",
        "mississippi",
        "missouri",
        "montana",
        "nebraska",
        "nevada",
        "new hampshire",
        "new jersey",
        "new mexico",
        "new york",
        "north carolina",
        "north dakota",
        "northern mariana islands",
        "ohio",
        "oklahoma",
        "oregon",
        "pennsylvania",
        "puerto rico",
        "rhode island",
        "south carolina",
        "south dakota",
        "tennessee",
        "texas",
        "utah",
        "vermont",
        "virgin islands",
        "virginia",
        "washington",
        "west virginia",
        "wisconsin",
        "wyoming"
    ]

    for s in states:
        url = f"https://disease.sh/v3/covid-19/historical/usacounties/{'%20'.join(s.split(' '))}?lastdays=all"
        if s == "district of columbia":
            places["Washington D.C"] = {'api': url, 'US': True}
        else:
            state = " ".join([capitalize(w) for w in s.split(" ")])
            places[state] = {'api': url, 'US': True}

    return places


jason = getTimeSeries()
jsonToText('./timeSeries.txt', jason)
