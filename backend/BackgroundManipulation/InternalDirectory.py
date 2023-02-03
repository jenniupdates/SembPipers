import os
from flask_jwt_extended import jwt_required, JWTManager
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask import Flask, request, jsonify
from datetime import timedelta
from dotenv import load_dotenv

import re
from itertools import repeat
from sys import intern
import pandas as pd


from TopSorter import topo_sort
app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'
app.config["JWT_SECRET_KEY"] = "very-secret-key-for-now"
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=1)
jwt = JWTManager(app)

DB_USER = os.environ.get('DB_USER')
DB_PASSWORD = os.environ.get('DB_PASSWORD')
DB_ENDPOINT = os.environ.get('DB_ENDPOINT')

app.config["SQLALCHEMY_DATABASE_URI"] = f"mysql+mysqlconnector://{DB_USER}:{DB_PASSWORD}@localhost:3306/{DB_ENDPOINT}"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)

class InternalDirectory(db.Model):

    __tablename__ = 'internal_directory'

    internal_name = db.Column(db.String(64), primary_key=True)
    internal_type = db.Column(db.String(16))

    def __init__(self, internal_name, internal_type):
        self.internal_name = internal_name
        self.internal_type = internal_type
    
    def json(self):
        return {
            "internal_name": self.internal_name,
            "internal_type": self.internal_type
        }

class InternalTag(db.Model):

    __tablename__ = 'internal_tag'

    internal_name = db.Column(db.String(64), primary_key=True)
    tag = db.Column(db.String(64)) # need to see how to change to float

    def __init__(self, internal_name, tag):
        self.internal_name = internal_name
        self.tag = tag
    
    def json(self):
        return {
            "internal_name": self.internal_name,
            "tag": self.tag
        }

@app.route('/getFormulaColInfo', methods=["GET"])
def get_formula_cols_info():
    try:
        response = InternalDirectory.query.filter(InternalDirectory.internal_type.in_(('Tag', 'Formula')))
        internal_names = [row.internal_name for row in response]
        return jsonify({
            "internal_names": internal_names
        })
    
    except Exception as e:
        return jsonify({
            "message": f"Retrieval of formula internal names failed. {e.args[0]}"
        }), 500

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5010, debug=True)