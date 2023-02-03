import os
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

class ValidationRulesTable(db.Model):
    __tablename__ = 'validation_rules'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    rule_name = db.Column(db.String(100), primary_key = True)
    rule_description = db.Column(db.String(100))
    rule_variables = db.Column(db.String(80))
    rule_code = db.Column(db.String(150))

    def __init__(self, rule_name, rule_description, rule_variables, rule_code):
        self.rule_name = rule_name
        self.rule_description = rule_description
        self.rule_variables = rule_variables
        self.rule_code = rule_code
        
    def json(self):
        return {
            "id": self.id,
            "rule_name": self.rule_name,
            "rule_description": self.rule_description,
            "rule_variables": self.rule_variables,
            "rule_code": self.rule_code
        }
        
class ValidationRuleFunctions(db.Model):
    __tablename__ = 'validation_rules_functions'
    
    rule_id = db.Column(db.Integer, primary_key=True, nullable=False)
    function_name = db.Column(db.String(50), primary_key=True, nullable=False)
    num_parameters = db.Column(db.Integer, nullable=False)
    
    def __init__(self,rule_id,function_name,num_parameters):
        self.rule_id = rule_id
        self.function_name = function_name
        self.num_parameters = num_parameters
    
    def json(self):
        return {
            "id": self.rule_id,
            "function_name": self.function_name,
            "num_parameters": self.num_parameters
        }

@app.route("/getFunctionNameAndCount/<string:rule_name>", methods=["GET"])
def get_functions(rule_name):
    try:
        validation_rule = ValidationRulesTable.query.filter_by(rule_name=rule_name).first()
        functions = ValidationRuleFunctions.query.filter_by(rule_id=validation_rule.id)
        return_list = []
        for func in functions:
            function_name = func.json()["function_name"]
            num_params = func.json()["num_parameters"]
            function_response = requests.get("http://localhost:5007/getFunctionRowsByParamCount/" + str(num_params))
            if not function_response.ok:
                logger.error(f"{os.path.basename(__file__)} : There was an error communicating with the GenericFunctions microservice.")
                return jsonify({
                    "message": "There was an error communicating with the GenericFunctions microservice."
                }), 500
            return_list.append( (function_name,num_params,function_response.json()["rows"]) )
        
        logger.info(f"{os.path.basename(__file__)} : Function(s) retrieval successful.")
        return jsonify({
            "functions": return_list
        }), 200
    except Exception as e:
        logger.error(f"{os.path.basename(__file__)} : An error occurred while retrieving functions. {e.args[0]}")
        return jsonify({
            "message": f"An error occurred while retrieving functions. {e.args[0]}"
        }), 500
        
    
@app.route("/insertValidationRule", methods=["POST"])
def insert_validation_rule():
    # Takes in validation rule parameters
    values = request.get_json()["values"]
    try:
        # Check for duplicate
        is_duplicate = ValidationRulesTable.query.filter_by(rule_name=values[0]).first()
        if is_duplicate:
            logger.error(f"{os.path.basename(__file__)} : There is already an existing rule with that name.")
            return jsonify({
                "message": "There is already an existing rule with that name."
            }),500
        row = ValidationRulesTable(values[0], values[1], values[2],values[4])
        db.session.add(row)
        db.session.commit()

        if values[3]:
            functions = values[3].split(",")
            is_all_func_in_code = True
            for func in functions:
                if func not in values[4]:
                    is_all_func_in_code = False

            if not is_all_func_in_code:
                ValidationRulesTable.query.filter_by(rule_name=values[0]).delete()
                db.session.commit()
                logger.error(f"{os.path.basename(__file__)} : Declared functions not used in code.")
                return jsonify({
                    "message": "Please ensure that your declared functions are used in your code!"
                }), 500

            code_split_list = values[4].split("(")
            print(code_split_list)
            for func in functions:
                print(func)
                for i, code in enumerate(code_split_list):
                    print(i)
                    print(code)
                    if func in code:
                        func_params = code_split_list[i+1].split(")")[0]
                        func_params_list = func_params.split(",")
                        print("func_params_list",func_params_list)
                        row2 = ValidationRuleFunctions(row.id, func, len(func_params_list))
                        db.session.add(row2)
                        db.session.commit()
                        
        logger.info(f"{os.path.basename(__file__)} : Rule Insert successful!")
        return jsonify({
            "message": "Rule Insert successful!"
        }), 201
    except Exception as e:
        ValidationRulesTable.query.filter_by(rule_name=values[0]).delete()
        db.session.commit()
        logger.error(f"{os.path.basename(__file__)} : An error occurred while adding rule. {e.args[0]}")
        return jsonify({
            "message": f"An error occurred while adding rule. {e.args[0]}"
        }), 500
        
@app.route("/getValidationTableColInfo", methods=["GET"])
def get_table_col_info():
    table = "validation_rules"
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
        
@app.route("/getValidationRows", methods=["GET"])
def get_table_rows():
    try:
        rows = ValidationRulesTable.query.all()
        logger.info(f"{os.path.basename(__file__)} : Row(s) retrieval successful.")
        return jsonify({
        "rows": [row.json() for row in rows]
        }), 200
    except Exception as e:
        logger.error(f"{os.path.basename(__file__)} : Row(s) retrieval failed. {e.args[0]}")
        return jsonify({
            "message": f"Row(s) retrieval failed. {e.args[0]}"
        }), 500
        
@app.route("/getRuleByName/<string:rule_name>", methods=["GET"])
def get_rule_by_name(rule_name):
    try:
        rule = ValidationRulesTable.query.filter_by(rule_name=rule_name).first()
        functions = ValidationRuleFunctions.query.filter_by(rule_id=rule.id)
        logger.info(f"{os.path.basename(__file__)} : Rule(s) retrieval successful.")
        return jsonify({
            "rule": rule.json(),
            "functions": [func.json() for func in functions]
        }),200
    except Exception as e:
        logger.error(f"{os.path.basename(__file__)} : Rule retrieval failed. {e.args[0]}")
        return jsonify({
            "message": f"Rule retrieval failed. {e.args[0]}"
        }), 500
        
@app.route("/getRuleNames", methods=["GET"])
def get_rule_names():
    try:
        rows = ValidationRulesTable.query.all()
        logger.info(f"{os.path.basename(__file__)} : Row(s) retrieval successful.")
        return jsonify({
        "rule_names": [row.json()["rule_name"] for row in rows]
        }), 200
    except Exception as e:
        logger.error(f"{os.path.basename(__file__)} : Row(s) retrieval failed. {e.args[0]}")
        return jsonify({
            "message": f"Row(s) retrieval failed. {e.args[0]}"
        }), 500
        
@app.route("/getVariablesCode/<string:rule_name>", methods=["GET"])
def get_variables(rule_name):
    try:
        row = ValidationRulesTable.query.filter_by(rule_name=rule_name).first()
        if not row:
            logger.error(f"{os.path.basename(__file__)} : Rule does not exist.")
            return jsonify({
                "message": "Rule does not exist."
            }), 404
        variables = row.json()["rule_variables"]
        code = row.json()["rule_code"]
        logger.info(f"{os.path.basename(__file__)} : Variable(s) retrieval successful.")
        return jsonify({
            "variables": variables.split(","),
            "code": code
        }), 200
    except Exception as e:
        logger.error(f"{os.path.basename(__file__)} : Variable(s) retrieval failed. {e.args[0]}")
        return jsonify({
            "message": f"Variable(s) retrieval failed. {e.args[0]}"
        }), 500
    
@app.route("/deleteRules", methods=["DELETE"])
def delete_rules():
    try: 
        ids = request.get_json()["ids"]
        for id in ids:
            rule_name = ValidationRulesTable.query.filter_by(id=id).first().rule_name
            ValidationRuleFunctions.query.filter_by(rule_id=id).delete()
            activate_delete_result = requests.request("DELETE","http://localhost:5006/deleteActivatedValidationRowsByRuleName/" + rule_name)
            if activate_delete_result.status_code != 200:
                logger.error(f"{os.path.basename(__file__)} : Activation Rule Deletion failed:" + activate_delete_result.json()["message"])
                return jsonify({
                    "message": "Activation Rule Deletion failed:" + activate_delete_result.json()["message"]
                }), 500
            else: 
                ValidationRulesTable.query.filter_by(id=id).delete()
                db.session.commit()
        logger.info(f"{os.path.basename(__file__)} : Delete successful!")
        return jsonify({
            "message": "Delete successful!"
        }), 200
    except Exception as e:
        logger.error(f"{os.path.basename(__file__)} : Delete failed. {e.args[0]}")
        return jsonify({
            "message": f"Delete failed. {e.args[0]}"
        }), 500
        
        
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5005, debug=True)