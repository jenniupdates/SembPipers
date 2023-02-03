import os
# from backend.ActivatedValidationFormulaTable.ActivatedValidationFormulaTable import DB_ENDPOINT
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import timedelta
from flask import Flask, request, jsonify
from dotenv import load_dotenv
from datetime import datetime, timedelta
import logging
# from constants import DB_CONNECTION_STRING
load_dotenv()

DB_USER = os.environ.get('DB_USER')
DB_PASSWORD = os.environ.get('DB_PASSWORD')
DB_ENDPOINT = os.environ.get('DB_ENDPOINT')


app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = f"mysql+mysqlconnector://{DB_USER}:{DB_PASSWORD}@localhost:3306/{DB_ENDPOINT}"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config['CORS_HEADERS'] = 'Content-Type'
app.config["JWT_SECRET_KEY"] = "very-secret-key-for-now"
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=1)

cors = CORS(app)
jwt = JWTManager(app)
db = SQLAlchemy(app)

logger = logging.getLogger('werkzeug')
handler = logging.FileHandler('terminal.log')
logger.addHandler(handler)

class ConfigTable(db.Model):
    __tablename__ = 'project_config'

    id = db.Column(db.Integer, primary_key=True)
    input_table_name = db.Column(db.String(64))
    input_table_column = db.Column(db.String(64))
    input_allowed_value = db.Column(db.String(64))
    last_modified_by = db.Column(db.String(64))
    created_at = db.Column(db.DateTime)
    modified_at = db.Column(db.DateTime)

    def __init__(self, input_table_name, input_table_column, input_allowed_value, last_modified_by, created_at, modified_at):
        self.input_table_name = input_table_name
        self.input_table_column = input_table_column
        self.input_allowed_value = input_allowed_value
        self.last_modified_by = last_modified_by
        self.created_at = created_at
        self.modified_at = modified_at

    def json(self):
        return {
            "id": self.id,
            "input_table_name": self.input_table_name,
            "input_table_column": self.input_table_column,
            "input_allowed_value": self.input_allowed_value,
            "last_modified_by": self.last_modified_by,
            "created_at": self.created_at,
            "modified_at": self.modified_at,
        }


@app.route("/insertConfigTable", methods=["POST"])
def insert_into_table():
    email, values = request.get_json()["email"], request.get_json()["values"]
    time_now = f"{datetime.utcnow() + timedelta(hours=8):%Y-%m-%d %H:%M}"

    try:
        row = ConfigTable(input_table_name=values[1], input_table_column=values[2],
                          input_allowed_value=values[3], last_modified_by=email, created_at=time_now, modified_at=time_now)
        db.session.add(row)
        db.session.commit()

        logger.info(f"{os.path.basename(__file__)} : Insert row successful.")
        return jsonify({
            "message": "Insert row successful!"
        }), 200
    except Exception as e:
        logger.error(f"{os.path.basename(__file__)} : Insert row failed. {e.args[0]}")
        return jsonify({
            "message": f"Insert row failed. {e.args[0]}"
        }), 500


@app.route("/getConfigTableColInfo")
def get_table_cols():
    table = "project_config"
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


@app.route("/getConfigTableRows", methods=["GET"])
def get_table_rows():
    try:
        rows = ConfigTable.query.all()

        logger.info(f"{os.path.basename(__file__)} : Row(s) retrieval successful.")
        return jsonify({
            "message": "Row(s) retrieval successful.",
            "rows": [row.json() for row in rows]
        }), 200
    except Exception as e:
        logger.error(f"{os.path.basename(__file__)} : Row(s) retrieval failed. {e.args[0]}")
        return jsonify({
            "message": f"Row(s) retrieval failed. {e.args[0]}"
        }), 500


@app.route("/getConfigTable")
def get_config_tables():
    try:
        response = db.engine.execute("SHOW TABLES")
        for row in response:
            table_name = row._mapping[f"Tables_in_{DB_ENDPOINT}"]
            if "config" in table_name:
                logger.info(f"{os.path.basename(__file__)} : Data configuration table retrieval successful.")
                return jsonify({
                    "message": "Data configuration table retrieval successful.",
                    "table": table_name
                }), 200
        raise Exception("No configuration table found.")
    except Exception as e:
        logger.error(f"{os.path.basename(__file__)} : Data configuration table retrieval failed. {e.args[0]}")
        return jsonify({
            "message": f"Data configuration table retrieval failed. {e.args[0]}"
        }), 500
        

@app.route("/updateConfigRow", methods=["PUT"])
def update_table_data():
    data = request.get_json()
    row, email, table, id = data["row"], data["userEmail"], "project_config", data["row"]["id"]
    time_now = f"{datetime.utcnow() + timedelta(hours=8):%Y-%m-%d %H:%M}"

    update_info = ""
    for key, value in row.items():
        if key == "id" or key == "created_at":
            continue
        elif key == "last_modified_by":
            update_info += f"{key} = '{email}',"
        elif key == "modified_at":
            update_info += f"{key} = '{time_now}',"
        else:
            update_info += f"{key} = '{value}',"
    update_info = update_info[:-1]

    try:
        db.engine.execute(f"UPDATE {table} SET {update_info} WHERE id={id}")

        logger.info(f"{os.path.basename(__file__)} : Update row successful.")
        return jsonify({
            "message": "Update row succesful!"
        }), 200
    except Exception as e:
        logger.error(f"{os.path.basename(__file__)} : Update row failed. {e.args[0]}")
        return jsonify({
            "message": f"Update row failed. {e.args[0]}"
        }), 500


@app.route("/deleteConfigRows", methods=["DELETE"])
def delete_rows():
    ids = request.get_json()["ids"]

    try:
        for id in ids:
            ConfigTable.query.filter_by(id=id).delete()
            db.session.commit()

        logger.info(f"{os.path.basename(__file__)} : Delete row(s) successful.")
        return jsonify({
            "message": "Delete row(s) successful!"
        }), 200
    except Exception as e:
        logger.error(f"{os.path.basename(__file__)} : Delete row(s) failed. {e.args[0]}")
        return jsonify({
            "message": f"Delete row(s) failed. {e.args[0]}"
        }), 500

@app.route("/getAllowableValues", methods=["GET"])
def get_allowable_values():
    try:
        response = ConfigTable.query.with_entities(ConfigTable.input_table_name, ConfigTable.input_table_column, ConfigTable.input_allowed_value).all()
        controlDict = {}
        for row in response:
            if row.input_table_name.lower() not in controlDict.keys():
                tmp = {row.input_table_column: [row.input_allowed_value]}
                controlDict[row.input_table_name.lower()] = tmp
            else:
                if row.input_table_column not in controlDict[row.input_table_name.lower()]:
                    controlDict[row.input_table_name.lower()][row.input_table_column] = [row.input_allowed_value]
                else:
                    controlDict[row.input_table_name.lower()][row.input_table_column] += [row.input_allowed_value]

        logger.info(f"{os.path.basename(__file__)} : Retrieval of allowable values is successful.")
        return jsonify({
            "message": "Retrieval of allowable values is successful.",
            "controlDict": controlDict
        }), 200
    except Exception as e:
        logger.error(f"{os.path.basename(__file__)} : Retrieval of allowable values failed. {e.args[0]}")
        return jsonify({
            "message": f"Retrieval of allowable values failed. {e.args[0]}"
        }), 500

@app.route("/getAllowableInputTables", methods=["GET"])
def get_allowable_input_tables():
    try:
        response = db.engine.execute("SHOW TABLES")
        input_tables = []
        for row in response:
            if row[0].find("input") != -1:
                input_tables.append(row[0])

        input_columns = {}
        for tbl in input_tables:
            response = db.engine.execute(f"DESCRIBE {tbl}")
            columns = [row["Field"] for row in response]
            input_columns[tbl] = columns
        
        logger.info(f"{os.path.basename(__file__)} : Retrieval of allowable input tables and columns is successful.")
        return jsonify({
            "message": "Retrieval of allowable input tables and columns is successful.",
            "input_table_name": input_tables,
            "input_table_column": input_columns
        })
    except Exception as e:
        logger.error(f"{os.path.basename(__file__)} : Retrieval of allowable input tables and columns failed. {e.args[0]}")
        return jsonify({
            "message": f"Retrieval of allowable input tables and columns failed. {e.args[0]}"
        })





@app.route("/processConfigValidation", methods=["POST"])
def process_config_validation():
    table_name = request.get_json()['table_name']
    row = request.get_json()['row']
    
    try:
        response = ConfigTable.query.with_entities(ConfigTable.input_table_column, ConfigTable.input_allowed_value).filter_by(input_table_name=table_name).all()
        tmp_dict = {}

        for xrow in response:
            if xrow.input_table_column not in tmp_dict.keys():
                tmp_dict[xrow.input_table_column] = [xrow.input_allowed_value]
            else:
                tmp_dict[xrow.input_table_column] += [xrow.input_allowed_value]

        for k,v in row.items():
            if k in tmp_dict.keys() and v not in tmp_dict[k]:
                return jsonify({
                    "message": "One or more of your rows contains a value that does not meet configuration requirements.",
                    "wrong_value": f"{k} has the value {v} which is not allowable in the configuration table" 
                }), 400
        
        return jsonify({
            "message": "All configuration rules passed."
        }), 200
    except Exception as e:
        return jsonify({
            "message": f"An error occurred. {e.args[0]}"
        }), 500



if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5002, debug=True)
