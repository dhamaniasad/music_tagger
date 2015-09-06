import requests
import urllib
import arrow

def search(term):
    r = requests.get(itunes_search_url + urllib.quote(term)).json()
    results = r['results']
    print results[0]['trackName']
    print results[0]['artistName']
    released = arrow.get(results[0]['releaseDate'])
    print released.format('MMMM, YYYY')

name = raw_input('Please enter the name of the song(e.g. "Rocket Man Elton John): ')
itunes_search_url = "https://itunes.apple.com/search?term="
search(name)
