import logging
    # app.logger.warning('testing warning log')
    # app.logger.error('testing error log')
    # app.logger.info('testing info log')
from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/submit', methods=['POST'])
def submit():
    data = request.form['input_data']
    # Process the data as needed

    # Return JSON response
    return jsonify({'result': data})

if __name__ == '__main__':
    app.run(debug=True)
