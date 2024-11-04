import numpy as np
from flask import Flask, request, render_template, jsonify
import requests
import xmltodict
from flask_cors import CORS
from sklearn.metrics.pairwise import cosine_similarity
from error_handlers import register_error_handlers   
from constants import top_boardgames_ids
from collections import Counter
import logging

app = Flask(__name__)
register_error_handlers(app)
CORS(app)

def fetch_data(api_url):
    try:
        response = requests.get(api_url)
        data = xmltodict.parse(response.content)
        return data

    except requests.exceptions.RequestException as e:
        return ({'error': 'Failed to fetch data', 'message': str(e)}), 500

def extract_fields(json_data):
    my_dict = {}

    if json_data['items']['@totalitems'] == '0':
        return my_dict
    
    for col in json_data['items']['item']:
        bg_id = col['@objectid']
        rating = col['stats']['rating']['@value']
        my_dict[bg_id] = rating

    return my_dict

def similarity_score(ratings_a, ratings_b):

    ratings_a = {k: v for k, v in ratings_a.items() if k in top_boardgames_ids}
    ratings_b= {k: v for k, v in ratings_b.items() if k in top_boardgames_ids}


    common_keys = set(ratings_a.keys()).intersection(ratings_b.keys())
    sorted_common_keys = sorted(common_keys)

    print(sorted_common_keys)

    # All unrated should be turned to 0
    # Reference: https://grouplens.org/blog/similarity-functions-for-user-user-collaborative-filtering/
    ratings_a = {k: (0 if v == "N/A" else v) for k, v in ratings_a.items()}
    ratings_b = {k: (0 if v == "N/A" else v) for k, v in ratings_b.items()}

    print(ratings_a)
    print(ratings_b)

    a = [ratings_a[key] for key in sorted_common_keys]
    b = [ratings_b[key] for key in sorted_common_keys]

    a = np.array(a, dtype=float)
    b = np.array(b, dtype=float)

    a = a.reshape(1, -1)
    b = b.reshape(1, -1)

    similarity = cosine_similarity(a, b)
    print(similarity[0][0])

    return np.round(similarity[0][0], 2)

def check_errors(response):
    message = response.get('message', 'none') 

    if message != "none":
        return jsonify({'message': message}), 202
    
    errors = response.get('errors', {})

    error_messages = []
    for key, value in errors.items():
        if isinstance(value, dict) and 'message' in value:
            error_messages.append(value['message'])

    if error_messages:
        return jsonify({'error_messages': error_messages}), 400
        

@app.route("/compare", methods=["POST"])
def compare():
    data = request.json
    username1 = data.get('name1')
    username2 = data.get('name2')

    api_url= "https://boardgamegeek.com/xmlapi/collection/{username1}".format(username1 = username1)
    app.logger.info(f"Accessing: {api_url}")
    response = fetch_data(api_url)
    error_response = check_errors(response) 

    if error_response:
        return error_response

    ratings_a = extract_fields(response)

    api_url= "https://boardgamegeek.com/xmlapi/collection/{username2}".format(username2 = username2)
    app.logger.info(f"Accessing: {api_url}")
    response = fetch_data(api_url)
    error_response = check_errors(response)

    if error_response:
        return error_response
    
    ratings_b = extract_fields(response)

    score = similarity_score(ratings_a, ratings_b)

    response = {
        "result": {
            "score": score,
            "name1": username1,
            "name2": username2
        }
    }

    return jsonify(response), 200 

def get_temporary_users(response, ratings_dict, name):

    matching_usernames = {}
    all_usernames = []
    for boardgame in response['boardgames']['boardgame']:
        boardgame_id = boardgame['@objectid']
    
    if boardgame_id in ratings_dict:
        target_rating = ratings_dict[boardgame_id]
        usernames = set()
        
        comments = boardgame.get('comment', [])
        if isinstance(comments, dict):
            comments = [comments]
        
        for comment in comments:
            user_check = comment.get('@username')
            other_user_rating = comment.get('@rating')
            if other_user_rating == "N/A":
                other_user_rating = 0
            if user_check != name:
                usernames.add(user_check)
                all_usernames.append(user_check)
        
        if usernames:
            matching_usernames[boardgame_id] = usernames
        
    return all_usernames


# Function to create a dictionary of user counts
def create_user_count_dict(data):
    item_count = dict(Counter(data))

    sorted_item_count = dict(sorted(item_count.items(), key=lambda x: x[1], reverse=True))

    top_10_items = dict(list(sorted_item_count.items())[:10])

    return top_10_items

@app.route("/users", methods=["POST"])
def similar_users():
    data = request.json
    name = data.get('name')

    print(name)

    api_url= "https://boardgamegeek.com/xmlapi/collection/{name}".format(name = name)
    response = fetch_data(api_url)
    error_response = check_errors(response) 

    if error_response:
        return error_response

    # relevant boardgames of user
    ratings = extract_fields(response)
    ratings = {k: v for k, v in ratings.items() if k in top_boardgames_ids}
    ratings = {k: (0 if v == "N/A" else v) for k, v in ratings.items()}

    ids_string = list(ratings.keys())
    all_abc = []
    for i in range(0, len(ids_string), 20):
        batch = ids_string[i:i + 20]
        batch_string = ','.join(batch)
        api_url = f"https://boardgamegeek.com/xmlapi/boardgame/{batch_string}?comments=1"
        app.logger.info(f"Accessing: {api_url}")
        response = fetch_data(api_url)
        abc = get_temporary_users(response, ratings, name)
        all_abc.append(abc)

    flattened_list = [item for sublist in all_abc for item in sublist]
    top_10_items = create_user_count_dict(flattened_list)

    return jsonify(top_10_items), 200

if __name__ == "__main__":
    app.run(debug=True, port=5000)