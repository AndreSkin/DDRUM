import logging
    # app.logger.warning('testing warning log')
    # app.logger.error('testing error log')
    # app.logger.info('testing info log')
from flask import Flask, render_template, request, jsonify
import requests
import json

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')


@app.route('/submit', methods=['POST'])
def submit():
    try:


        # Extract data from the request
        data = request.data
        args = json.loads(data)

        sparql_query = queryBuilder(args)

        # Define the endpoint URL
        endpoint = 'http://localhost:3030/DDRUM/query' 

        payload = {'query': sparql_query}

        # Set the headers
        headers = {'Content-Type': 'application/x-www-form-urlencoded'}

        # Make the POST request
        response = requests.post(endpoint, data=payload, headers=headers)

        result = response.json() if response.status_code == 200 else {'error': 'Failed to get a valid response'}

        # Return JSON response
        return jsonify(result)

    except Exception as e:
        # Log any exceptions
        logging.error(f"An error occurred: {str(e)}")
        return jsonify({'error': 'An error occurred'})


def queryBuilder(args):
    query_type = args.get('type_of_request')

    prefix = """
        PREFIX schema: <https://schema.org/>
        PREFIX mesh: <https://www.ncbi.nlm.nih.gov/mesh/?term=>
        PREFIX drug: <https://drugcentral.org/drugcard/>
        PREFIX file: <https://clinicaltrials.gov/ct2/show/>
    """

    if query_type == 'Mdrug_cond':
        condition = args.get('condition1')
        num_results = args.get('num_res')
        query = f"""
            {prefix}
            SELECT ?drugName ?drug (COUNT(?study) as ?studyCount)
            WHERE {{
                ?drug schema:study ?study ;
                      schema:name ?drugName ;
                      schema:usedFor mesh:{condition} .
            }}
            GROUP BY ?drug ?drugName
            ORDER BY DESC(?studyCount)
            LIMIT {num_results}
        """
    elif query_type == 'drug_cond':
        condition = args.get('condition2')
        num_results = args.get('num_res')
        query = f"""
            {prefix}
            SELECT ?drugName ?drug
            WHERE {{
                ?drug schema:usedToTreat mesh:{condition} ;
                      schema:name ?drugName .
            }}
            LIMIT {num_results}
        """
    elif query_type == 'Pstud_drug':
        phase = args.get('phase')
        drug = args.get('drug1')
        num_results = args.get('num_res')
        query = f"""
            {prefix}
            SELECT ?study
            WHERE {{
                ?study schema:citesDrug drug:{drug} ;
                       schema:phase "{phase}" .
            }}
            LIMIT {num_results}
        """
    elif query_type == 'Pstud_cond':
        phase = args.get('phase')
        condition = args.get('condition3')
        num_results = args.get('num_res')
        query = f"""
            {prefix}
            SELECT ?study
            WHERE {{
                ?study schema:citesCondition mesh:{condition} ;
                       schema:phase "{phase}" .
            }}
            LIMIT {num_results}
        """
    elif query_type == 'stud_drug':
        drug = args.get('drug2')
        num_results = args.get('num_res')
        query = f"""
            {prefix}
            SELECT ?study
            WHERE {{
                ?study schema:citesDrug drug:{drug} .
            }}
            LIMIT {num_results}
        """
    elif query_type == 'stud_cond':
        condition = args.get('condition4')
        num_results = args.get('num_res')
        query = f"""
            {prefix}
            SELECT ?study
            WHERE {{
                ?study schema:citesCondition mesh:{condition} .
            }}
            LIMIT {num_results}
        """
    else:
        return None

    # Log the generated query
    logging.info(f"Generated SPARQL query: {query}")

    return query


if __name__ == '__main__':
    app.run(debug=True)
