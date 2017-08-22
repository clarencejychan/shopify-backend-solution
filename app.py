from flask import *
import requests, json

app = Flask(__name__)

@app.route('/')
def index():
    return render_template("index.html")

@app.route('/', methods=['POST'])
def returnInfo():
    if request.method == "POST":
        url = request.form['url']
        customerInfoJSON = requests.get(url)
        if customerInfoJSON.status_code == 404:
            return "Error"
        else:
            customerInfo = customerInfoJSON.json()
            validationInfo = customerInfo['validations']
            print (customerInfo)
            print (validationInfo)
            return "hello"

if __name__ == "__main__":
	app.run(port=4040, debug=True);
