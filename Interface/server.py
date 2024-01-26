import logging
from flask import Flask, render_template, request, jsonify
import requests

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/submit', methods=['POST'])
def submit():
    data = request.form['input_data']

    # Assuming data is the query you want to send
    query = """
        PREFIX schema: <https://schema.org/>

        SELECT ?drugName ?drug (COUNT(?study) as ?studyCount)
        WHERE {
          ?drug schema:study ?study .
          ?drug schema:name ?drugName .
        }
        GROUP BY ?drug ?drugName
        ORDER BY DESC(?studyCount)
        LIMIT 1
    """

    # Define the endpoint URL
    endpoint = 'http://localhost:3030/DDRUM/query' 

    # Prepare the payload
    payload = {'query': query}

    # Set the headers
    headers = {'Content-Type': 'application/x-www-form-urlencoded'}

    try:
        # Make the POST request
        response = requests.post(endpoint, data=payload, headers=headers)

        # Process the response as needed
        result = response.json() if response.status_code == 200 else {'error': 'Failed to get a valid response'}

        # Return JSON response
        return jsonify(result)

    except Exception as e:
        # Log any exceptions
        logging.error(f"An error occurred: {str(e)}")
        return jsonify({'error': 'An error occurred'})

if __name__ == '__main__':
    app.run(debug=True)
