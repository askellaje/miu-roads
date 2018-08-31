import requests
import time

# request the app every 5 mins
while True:
    req = requests.get('http://miu-roads.herokuapp.com/')
    print (req.status_code)
    time.sleep(60 * 5)