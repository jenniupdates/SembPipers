import os
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import timedelta
from flask import Flask, request, jsonify
from dotenv import load_dotenv
from datetime import timedelta
import requests
import logging
load_dotenv()

app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

DB_USER = os.environ.get('DB_USER')
DB_PASSWORD = os.environ.get('DB_PASSWORD')
DB_ENDPOINT = os.environ.get('DB_ENDPOINT')

app.config["SQLALCHEMY_DATABASE_URI"] = f"mysql+mysqlconnector://{DB_USER}:{DB_PASSWORD}@localhost:3306/{DB_ENDPOINT}"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)

logger = logging.getLogger('werkzeug')
handler = logging.FileHandler('terminal.log')
logger.addHandler(handler)

class GenericFunctions(db.Model):
    __tablename__ = 'generic_functions'
    
    id = db.Column(db.Integer, primary_key=True)
    function_name = db.Column(db.String(50), nullable=False)
    function_params = db.Column(db.String(100), nullable=False)
    num_params = db.Column(db.Integer, nullable=False)
    function_description = db.Column(db.String(500), nullable=False)
    function_code = db.Column(db.String(500), nullable=False)
    
    def __init__(self, function_name,function_params,num_params,function_description,function_code):
        self.function_name = function_name
        self.function_params = function_params
        self.num_params = num_params
        self.function_description = function_description
        self.function_code = function_code

    def json(self):
        return {
            "id": self.id,
            "function_name": self.function_name,
            "function_params": self.get_params(),
            "num_params": self.num_params,
            "function_description": self.function_description,
            "function_code": self.function_code
        }
        
    def get_params(self):
        # returns the parameters of a functions as a list of strings
        return self.function_params.split(",")
    
@app.route("/getFunctionColInfo", methods=["GET"])
def get_table_col_info():
    table = "generic_functions"
    try:
        response = db.engine.execute(f"DESCRIBE {table}")
        columns_detail = []
        primary_keys = []
        for col in response:
            columns_detail.append((col[0], col[1].decode("utf-8"), col[3]))
            if col[3] == "PRI":
                primary_keys.append(col[0])

        logger.info(f"{os.path.basename(__file__)} : Column(s) retrieval successful.")
        return jsonify({
            "message": "Column(s) retrieval successful.",
            "columns": columns_detail,
            "primary_keys": primary_keys
        })
    except Exception as e:
        logger.error(f"{os.path.basename(__file__)} : Column(s) retrieval failed. {e.args[0]}")
        return jsonify({
            "message": f"Column(s) retrieval failed. {e.args[0]}"
        }), 500

@app.route("/getFunctionRows", methods=["GET"])
def get_table_rows():
    try:
        rows = GenericFunctions.query.all()
        logger.info(f"{os.path.basename(__file__)} : Row(s) retrieval successful.")
        return jsonify({
            "rows": [row.json() for row in rows]
        }), 200
    except Exception as e:
        logger.error(f"{os.path.basename(__file__)} : Row(s) retrieval failed. {e.args[0]}")
        return jsonify({
            "message": f"Row(s) retrieval failed. {e.args[0]}"
        }), 500

@app.route("/getFunctionRowsByParamCount/<string:count>",methods=["GET"])
def get_rows_by_count(count):
    try:
        rows = GenericFunctions.query.filter_by(num_params=count)
        logger.info(f"{os.path.basename(__file__)} : Row(s) retrieval successful.")
        return jsonify({
            "rows": [row.json() for row in rows]
        })
    except Exception as e:
        logger.error(f"{os.path.basename(__file__)} : Row(s) retrieval failed. {e.args[0]}")
        return jsonify({
            "message": f"Row(s) retrieval failed. {e.args[0]}"
        }), 500

@app.route("/getFunctionRow/<string:id>", methods=["GET"])
def get_table_row(id):
    try:
        row = GenericFunctions.query.filter_by(id=id).first()
        if not row:
            logger.error(f"{os.path.basename(__file__)} : Row does not exist")
            return jsonify({
                "message": "Row does not exist"
            }), 404
        logger.info(f"{os.path.basename(__file__)} : Row(s) retrieval successful.")
        return jsonify({
            "function": row.json()
        }), 200
    except Exception as e:
        logger.error(f"{os.path.basename(__file__)} : Row(s) retrieval failed. {e.args[0]}")
        return jsonify({
            "message": f"Row(s) retrieval failed. {e.args[0]}"
        }), 500
        
@app.route("/getFunctionByName/<string:function_name>", methods=["GET"])
def get_table_row_by_name(function_name):
    try:
        row = GenericFunctions.query.filter_by(function_name=function_name).first()
        if not row:
            logger.error(f"{os.path.basename(__file__)} : Row does not exist")
            return jsonify({
                "message": "Row does not exist"
            }), 404
        logger.info(f"{os.path.basename(__file__)} : Row retrieval successful.")
        return jsonify({
            "function": row.json()
        }), 200
    except Exception as e:
        logger.error(f"{os.path.basename(__file__)} : Row retrieval failed. {e.args[0]}")
        return jsonify({
            "message": f"Row retrieval failed. {e.args[0]}"
        }), 500

@app.route("/deleteFunctions", methods=["DELETE"])
def delete_function():
    try:
        ids = request.get_json()["ids"]
        for id in ids:
            GenericFunctions.query.filter_by(id=id).delete()
            db.session.commit()
        logger.info(f"{os.path.basename(__file__)} : Delete successful")
        return jsonify({
            "message": "Delete successful!"
        }), 200
        
    except Exception as e:
        logger.error(f"{os.path.basename(__file__)} : Delete failed. {e.args[0]}")
        return jsonify({
            "message": f"Delete failed. {e.args[0]}"
        }), 500

@app.route("/insertFunction", methods=["POST"])
def insert_function():
    function_name = request.get_json()["function_name"]
    function_params = request.get_json()["function_params"]
    function_description = request.get_json()["function_description"]
    function_code = request.get_json()["function_code"]
    try:
        row = GenericFunctions(function_name,function_params,len(function_params.split(",")),function_description,function_code)
        db.session.add(row)
        db.session.commit()
        logger.info(f"{os.path.basename(__file__)} : Function Insert successful!")
        return jsonify({
            "message": "Function Insert successful!"
        }), 201

    except Exception as e:
        logger.error(f"{os.path.basename(__file__)} : An error occurred while adding function. {e.args[0]}")
        return jsonify({
            "message": f"An error occurred while adding function. {e.args[0]}"
        }), 500
        
@app.route("/processFunction", methods=["POST"])
def process_function():
    try:
        variable_dict = request.get_json()["variable_dict"]
        function_id = request.get_json()["function_id"]
        func = GenericFunctions.query.filter_by(id=function_id).first()
        function_code_string = func.json()["function_code"]
        value_string = ""
        for key in variable_dict:
            value_string += variable_dict[key] + ","
        function_code_string += "global result; result = " + func.function_name + "(" + value_string[:-1] + ")"
        def call_exec(command):
            exec(command, globals())
        call_exec(function_code_string)
        logger.info(f"{os.path.basename(__file__)} : Output processed successfully!")
        return jsonify({
            "output": result
        }), 200
    except Exception as e:
        logger.error(f"{os.path.basename(__file__)} : Error occurred with output")
        return jsonify({
            "output": f"Error: " + repr(e)
        }), 200

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5007, debug=True)