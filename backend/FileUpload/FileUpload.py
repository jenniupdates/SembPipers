from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import requests
import pandas as pd
import os.path
import sys
from datetime import datetime, timedelta
from dotenv import load_dotenv
import dateutil.parser
import logging
# from constants import DB_CONNECTION_STRING
load_dotenv()

DB_USER = os.environ.get('DB_USER')
DB_PASSWORD = os.environ.get('DB_PASSWORD')
DB_ENDPOINT = os.environ.get('DB_ENDPOINT')

app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'
app.config["SQLALCHEMY_DATABASE_URI"] = f"mysql+mysqlconnector://{DB_USER}:{DB_PASSWORD}@localhost:3306/{DB_ENDPOINT}"
# app.config["SQLALCHEMY_DATABASE_URI"] = DB_CONNECTION_STRING
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db = SQLAlchemy(app)

logger = logging.getLogger('werkzeug')
handler = logging.FileHandler('terminal.log')
logger.addHandler(handler)


@app.route("/createSchema", methods=["POST"])
def create_schema():
    query = request.get_json()["createQuery"]
    query_split = query.split(";")[:-1]

    try:
        if len(query_split) == 0:
            raise Exception("Your query is not in MySQL.")
            
        for subquery in query_split:
            db.engine.execute(subquery.strip() + ";")
        logger.info(f"{os.path.basename(__file__)} : Schema created!")
        return jsonify({
            "message": "Schema created!"
        }), 200
    except Exception as e:
        logger.error(f"{os.path.basename(__file__)} : Schema creation failed. There is something wrong with your SQL query. {e.args[0]}")
        return jsonify({
            "message": f"Schema creation failed. There is something wrong with your SQL query. {e.args[0]}"
        }), 500


@app.route("/processFile", methods=["POST"])
def upload():
    try:
        if len(request.files) <= 0:
            logger.error(f"{os.path.basename(__file__)} : No file")
            return jsonify({
                "message": "No file entered."
            }), 404

        file = request.files['file']
        file_name = file.filename
        extension = os.path.splitext(file_name)[1]
        if extension == ".csv":
            df = pd.read_csv(file)
        elif extension == ".xlsx":
            df = pd.read_excel(file)
        else:
            logger.error(f"{os.path.basename(__file__)} : File type has to be either in csv or xlsx format.")
            return jsonify({
                "message": "File type has to be either in csv or xlsx format."
            }), 500

        invalid_headers = []
        table = request.args.get("table")

        if "input" in table:
            table_cols = requests.request(
                "GET", f"http://localhost:5003/getInputTableColInfo?table={table}")
        else:
            table_cols = requests.request(
                "GET", f"http://localhost:5002/getConfigTableColInfo?table={table}")
        table_cols = table_cols.json()["columns"]
        col_names = [col[0] for col in table_cols]
        for col in list(df):
            if col not in col_names:
                invalid_headers.append(col)
        if len(invalid_headers) > 0:
            logger.error(f"{os.path.basename(__file__)} : The columns in your file does not match the table columns. The mismatched columns are: {invalid_headers}")
            return jsonify({
                "message": f"The columns in your file does not match the table columns. The mismatched columns are: {invalid_headers}"
            }), 500
        # Process Validation
        df_dict = df.to_dict('index')
        error_rows = []
        row_count = 1
        for key in df_dict.keys():        
            row = df_dict[key]
            for variable in row:
                row[variable] = str(row[variable])

            data = {
                "table_name": table,
                "row": row
            }
            headers = {'Content-type': 'application/json'}
            validation_result = requests.post("http://localhost:5011/processActivatedRules",headers=headers,json=data)
            config_validation_result = requests.post("http://localhost:5002/processConfigValidation",headers=headers,json=data)
        
            if not validation_result.ok:
                error_rows.append({"row_num": row_count, "message": validation_result.json()["message"],"rule_code": validation_result.json()["resulting_code"]})

            if not config_validation_result.ok:
                error_rows.append({"row_num": row_count, "message": config_validation_result.json()["message"], "rule_code": config_validation_result.json()["wrong_value"]})

            row_count += 1
        if len(error_rows) > 0:
            logger.error(f"{os.path.basename(__file__)} : Some of your rows have failed the validation.")
            return jsonify({
                "message": "Some of your rows have failed the validation.",
                "error_rows": error_rows,
            }),500

        for col in table_cols:
            if col[0] in list(df) and col[1] in ["datetime", "date"]:
                df[col[0]] = df[col[0]].apply(lambda x: dateutil.parser.parse(x))
        df["last_modified_by"] = request.args.get("email")
        df["modified_at"] = f"{datetime.utcnow() + timedelta(hours=8):%Y-%m-%d %H:%M}"
        df["created_at"] = f"{datetime.utcnow() + timedelta(hours=8):%Y-%m-%d %H:%M}"
        # database = DATA_INPUT_DB if "input" in table else CONFIG_TABLE_DB
        # app.config["SQLALCHEMY_DATABASE_URI"] = f"mysql+mysqlconnector://{DB_USER}:{DB_PASSWORD}@localhost:3306/{database}"
        if request.args.get("overwrite") == "yes":
            db.engine.execute(f"DELETE FROM {table}")

        df.to_sql(name=table, con=db.engine, index=False, if_exists="append")
        logger.info(f"{os.path.basename(__file__)} : Data import successful!")
        return jsonify({
            "message": "Data import successful!"
        }), 200

    except Exception as e:
        logger.error(f"{os.path.basename(__file__)} : There was an error importing your data. {e.args[0]}")
        return jsonify({
            "message": f"There was an error importing your data. {e.args[0]}"
        }), 500

@app.route("/processPythonFile", methods=["POST"])
def upload_python():
    try:
        if len(request.files) <= 0:
            return jsonify({
                "result": "No file"
            }), 404

        file = request.files['file']
        file_name = file.filename
        extension = os.path.splitext(file_name)[1]
        if extension == ".py":
            function_desc = ""
            is_desc = False
            function_code = ""
            function_name = ""
            params_string = ""
            for line in file:
                line = line.decode("utf-8") 
                line = line.rstrip('\n')
                if "def" in line:
                    if function_code != "":
                        function_desc = function_desc.strip()

                        body = {
                            "function_name": function_name,
                            "function_params": params_string,
                            "function_description": function_desc,
                            "function_code": function_code
                        }
                        result = requests.post('http://localhost:5007/insertFunction',json=body)
                        if result.status_code != 201:
                            logger.error(f"{os.path.basename(__file__)} : There is a problem with processing function upload: " + result.json()["message"])
                            return jsonify({
                                "message": "There is a problem with processing function upload: " + result.json()["message"]
                            }), 500
                        else:
                            function_desc = ""
                            is_desc = False
                            function_code = ""
                            function_name = ""
                            params_string = ""
                    function_code += line + "\n"
                    line = line.split("def ")
                    first_split = line[1].split("(")
                    function_name = first_split[0]
                    params_string = first_split[1].split(")")[0]
                    
                elif '"""' in line:
                    is_desc = not is_desc
                    continue
                
                elif is_desc:
                    function_desc += line + "\n"
                    
                else:
                    if line == "":
                        continue
                    function_code += line + "\n"
            function_desc = function_desc.strip()

            body = {
                "function_name": function_name,
                "function_params": params_string,
                "function_description": function_desc,
                "function_code": function_code
            }
            result = requests.post('http://localhost:5007/insertFunction',json=body)
            if result.status_code == 201:
                logger.info(f"{os.path.basename(__file__)} : Function(s) uploaded successfully.")
                return jsonify({
                    "message": "Function(s) uploaded successfully.",
                }), 200
            else:
                logger.error(f"{os.path.basename(__file__)} : There is a problem with processing function upload: " + result.json()["message"])
                return jsonify({
                    "message": "There is a problem with processing function upload: " + result.json()["message"]
                }), 500
            
        else:
            logger.error(f"{os.path.basename(__file__)} : Only python files are accepted.")
            return jsonify({
                "message": "Only python files are accepted."
            }), 500
        
        
    except Exception as e:
        logger.error(f"{os.path.basename(__file__)} : There was an error importing your functions. {e.args[0]}")
        return jsonify({
            "message": f"There was an error importing your functions. {e.args[0]}"
        }), 500
    

@app.route("/processFileForRules", methods=["POST"])
def upload_rules():
    try:
        if len(request.files) <= 0:
            logger.error(f"{os.path.basename(__file__)} : No file")
            return jsonify({
                "result": "No file"
            }), 404

        file = request.files['file']
        file_name = file.filename
        extension = os.path.splitext(file_name)[1]
        if extension == ".csv":
            df = pd.read_csv(file)
        elif extension == ".xlsx":
            df = pd.read_excel(file)
        else:
            logger.error(f"{os.path.basename(__file__)} : File type has to be either in csv or xlsx format.")
            return jsonify({
                "message": "File type has to be either in csv or xlsx format."
            }), 500

        invalid_headers = []
        rule_headers = ["id","rule_name","rule_description","rule_variables","rule_code"]
        for col in list(df):
            if col not in rule_headers:
                invalid_headers.append(col)
        if len(invalid_headers) > 0:
            logger.error(f"{os.path.basename(__file__)} : The columns in your file does not match the table columns for validation. The mismatched columns are: {invalid_headers}")
            return jsonify({
                "message": f"The columns in your file does not match the table columns for validation. The mismatched columns are: {invalid_headers}"
            }), 500
        # app.config["SQLALCHEMY_DATABASE_URI"] = f"mysql+mysqlconnector://{DB_USER}:{DB_PASSWORD}@localhost:3306/{DATA_VALIDATION_DB}"
        df.to_sql(name="validation_rules", con=db.engine, index=False, if_exists='append')
        logger.info(f"{os.path.basename(__file__)} : Rule Upload successful.")
        return jsonify({
            "message": "Rule Upload successful."
        }),201
        
    except Exception as e:
        logger.error(f"{os.path.basename(__file__)} : There was an error importing your rules. {e.args[0]}")
        return jsonify({
            "message": f"There was an error importing your rules. {e.args[0]}"
        }), 500
        
    finally:
        app.config["SQLALCHEMY_DATABASE_URI"] = f"mysql+mysqlconnector://{DB_USER}:{DB_PASSWORD}@localhost:3306/{DB_ENDPOINT}"
    

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5004, debug=True)
