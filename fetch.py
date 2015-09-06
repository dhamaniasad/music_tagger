import requests
import urllib
import json

def search(term):
    r = requests.get(itunes_search_url + urllib.quote(term)).json()
    print r['results'][0]['trackName']

name = raw_input('Please enter the name of the song(e.g. "Rocket Man Elton John): ')
itunes_search_url = "https://itunes.apple.com/search?term="
search(name)
