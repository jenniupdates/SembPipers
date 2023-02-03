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

logger = logging.getLogger('werkzeug')
handler = logging.FileHandler('terminal.log')
logger.addHandler(handler)


getActivatedRowsByTable_url = "http://localhost:5006/getActivatedRowsByTable/"
getRuleByName_url = "http://localhost:5005/getRuleByName/"
getGenericFunctionByName_url = "http://localhost:5007/getFunctionByName/"


# Helper function to check if value is a pure string (not float or integer)
def is_numerical(value):
    try:
        temp = int(value)
        return True
    except ValueError:
        try:
            temp = float(value)
            return True
        except ValueError:
            return False

@app.route("/processActivatedRules", methods=["POST"])
def process_activated_rules():
    try:
        table_name = request.get_json()["table_name"]
        data_row = request.get_json()["row"]
        # Retrieve relevant activated rules
        resulting_rows = requests.get(getActivatedRowsByTable_url + table_name)
        if not resulting_rows.ok:
            logger.error(f"{os.path.basename(__file__)} : There was an error with retrieving activated validation rules: " + resulting_rows.json()["message"])
            return jsonify({
                "message": "There was an error with retrieving activated validation rules: " + resulting_rows.json()["message"]
            }), 500
        activated_rules = resulting_rows.json()["rows"]
        if len(activated_rules) <= 0:
            logger.info(f"{os.path.basename(__file__)} : No validation rules. Data uploaded")
            return jsonify({
                "message": "No validation rules, data uploaded."
            }),200
        for activated_rule in activated_rules:
            validation_rule = requests.get(getRuleByName_url + activated_rule["rule_used"])
            if not validation_rule.ok:
                logger.error(f"{os.path.basename(__file__)} : There was an error with retrieving the validation rule: " + validation_rule.json()["message"])
                return jsonify({
                "message": "There was an error with retrieving the validation rule: " + validation_rule.json()["message"]
            }), 500
            activated_functions = activated_rule["functions"]
            function_pair_dict = {}
            for f in activated_functions:
                function_pair_dict[f["function_name"]] = f["function_used"]
            validation_rule_details = validation_rule.json()["rule"]
            rule_code = validation_rule_details["rule_code"]
            column_variable_names = validation_rule_details["rule_variables"]
            column_variables = activated_rule["column_variables"]
            column_variable_names_list = column_variable_names.split(",")
            column_variables_list = column_variables.split(",")
            command_string = ""
            # Adding function definitions
            for function_name in function_pair_dict.keys():
                function_row = requests.get(getGenericFunctionByName_url + function_pair_dict[function_name])
                function_code = function_row.json()["function"]["function_code"]

                new_function_code = function_code.replace(function_pair_dict[function_name],function_name)
                command_string += new_function_code + "\n"
    
            if (len(column_variable_names_list) != len(column_variables_list)):
                logger.error(f"{os.path.basename(__file__)} : Number of parameters and number of variables DO NOT match")
                return jsonify({
                    "message": "Number of parameters and number of variables DO NOT match"
                }),500
            for i in range(len(column_variables_list)):
                # check if variable is a from a column
                value = column_variables_list[i]
                if value in data_row.keys():
                    value = data_row[value]
                # check if variable is a string
                if not is_numerical(value):
                    value = '"' + value + '"'
                command_string += column_variable_names_list[i] + "=" + value +"\n"
            
            command_string += "result=" + rule_code
            # Process validation code
            exec(command_string,globals())
            
            if not result:
                new_rule_code = rule_code
                for i in range(len(column_variables_list)):
                    # check if variable is a from a column
                    replacement = column_variables_list[i]
                    value = column_variables_list[i]
                    if value in data_row.keys():
                        value = data_row[value]
                        replacement += "(" + value + ")"
                    # check if variable is a string
                    if not is_numerical(value):
                        value = '"' + value + '"'
                    new_rule_code = new_rule_code.replace(column_variable_names_list[i],replacement)
                
                logger.error(f"{os.path.basename(__file__)} : The validation failed for the following rule: " + activated_rule["rule_used"])
                return jsonify({
                    "message": "The validation failed for the following rule: [" + activated_rule["rule_used"] + "]",
                    "resulting_code": new_rule_code
                }),500

        logger.info(f"{os.path.basename(__file__)} : All validation rules passed")
        return jsonify({
            "message": "All validation rules passed"
        }),200
    except Exception as e:
        logger.error(f"{os.path.basename(__file__)} : Error with validation code: {e.args[0]}")
        return jsonify({
            "message": f"Error with validation code: {e.args[0]}"
        }), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5011, debug=True)
