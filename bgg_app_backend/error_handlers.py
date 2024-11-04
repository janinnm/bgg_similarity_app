from flask import jsonify
from werkzeug.exceptions import HTTPException



def handle_not_found(e):
    return jsonify(error="Resource not found"), 404

def handle_internal_error(e):
    return jsonify(error="An internal error occurred"), 500

def handle_bad_request(error):
    return jsonify(error.description), 400

def handle_http_exception(e):
    response = jsonify(e.to_dict())
    response.status_code = e.status_code
    return response

def register_error_handlers(app):
    app.register_error_handler(404, handle_not_found)
    app.register_error_handler(500, handle_internal_error)
    app.register_error_handler(400, handle_bad_request)
    app.register_error_handler(HTTPException, handle_http_exception)
