import os
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import timedelta
from flask import Flask, request, jsonify
from dotenv import load_dotenv
from datetime import timedelta
from datetime import datetime, timedelta
import logging
# from constants import DB_CONNECTION_STRING
load_dotenv()

DB_USER = os.environ.get('DB_USER')
DB_PASSWORD = os.environ.get('DB_PASSWORD')
DB_ENDPOINT = os.environ.get('DB_ENDPOINT')

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = f"mysql+mysqlconnector://root:@db:3306/sembcorp"
# app.config["SQLALCHEMY_DATABASE_URI"] = f"{DB_CONNECTION_STRING}/{DATA_INPUT_DB}"
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

@app.route("/insertInputTable", methods=["POST"])
def insert_into_table():
    table, cols, values, email = request.get_json()["table"], request.get_json()[
        "cols"], request.get_json()["values"], request.get_json()["email"]
    val_str = ""
    for val in values:
        val_str += f"'{val}',"
    time_now = f"{datetime.utcnow() + timedelta(hours=8):%Y-%m-%d %H:%M}"
    cols += ",last_modified_by,created_at,modified_at"

    try:
        db.engine.execute(f"INSERT INTO {table} ({cols}) VALUES ({val_str[:-1]}, '{email}', '{time_now}', '{time_now}')")
        logger.info(f"{os.path.basename(__file__)} : Insert row successful.")
        return jsonify({
            "message": "Insert row successful!"
        }), 200
    except Exception as e:
        logger.error(f"{os.path.basename(__file__)} : Insert row failed. {e.args[0]}")
        return jsonify({
            "message": f"Insert row failed. {e.args[0]}"
        }), 500


@app.route("/getInputTableColInfo", methods=["GET"])
def get_table_cols():
    table = request.args.get("table")
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


@app.route("/getInputTableRows", methods=["GET"])
def get_table_rows():
    table = request.args.get("table")

    try:
        row_response = db.engine.execute(f"SELECT * FROM {table}")
        col_response = db.engine.execute(f"DESCRIBE {table}")
        rows = []
        cols = [col for col in col_response]

        for row in row_response:
            tmp = {}
            for i, col in enumerate(cols):
                if col[1].decode("utf-8") == "datetime":
                    formatted_date = datetime.strftime(
                        row[i], "%Y-%m-%d %H:%M:%S")
                    tmp[col[0]] = formatted_date
                else:
                    tmp[col[0]] = row[i]
            rows.append(tmp)

        logger.info(f"{os.path.basename(__file__)} : Row(s) retrieval successful.")
        return jsonify({
            "message": "Row(s) retrieval successful.",
            "rows": rows
        }), 200
    except Exception as e:
        logger.error(f"{os.path.basename(__file__)} : Row(s) retrieval failed. {e.args[0]}")
        return jsonify({
            "message": f"Row(s) retrieval failed. {e.args[0]}"
        }), 500


@app.route("/getInputTables")
def get_input_tables():
    try:
        response = db.engine.execute("SHOW TABLES")
        db_tables = []
        for row in response:
            table_name = row._mapping[f"Tables_in_sembcorp"]
            if "input" in table_name:
                db_tables.append(table_name)

                logger.info(f"{os.path.basename(__file__)} : Data input table(s) retrieval successful.")
                return jsonify({
                    "message": "Data input table(s) retrieval successful.",
                    "tables": db_tables
                }), 200
        raise Exception("No data input table(s) found.")
    except Exception as e:
        logger.error(f"{os.path.basename(__file__)} : Data input table(s) retrieval failed. {e.args[0]}")
        return jsonify({
            "message": f"Data input table(s) retrieval failed."
        }), 500


@app.route("/updateInputRow", methods=["PUT"])
def update_table_data():
    data = request.get_json()
    row, email, table, columns = data["row"], data["userEmail"], data["table"], data["columns"]
    time_now = f"{datetime.utcnow() + timedelta(hours=8):%Y-%m-%d %H:%M}"
    primary_key_col = ""

    update_info = ""
    for col in columns:
        if col[2] == "PRI":
            primary_key_col = col[0]
        elif col[0] == "created_at":
            continue
        elif col[0] == "last_modified_by":
            update_info += f"{col[0]} = '{email}',"
        elif col[0] == "modified_at":
            update_info += f"{col[0]} = '{time_now}',"
        else:
            update_info += f"{col[0]} = '{row[col[0]]}',"
    update_info = update_info[:-1]

    try:
        db.engine.execute(
            f"UPDATE {table} SET {update_info} WHERE {primary_key_col}='{row[primary_key_col]}'")
        
        logger.info(f"{os.path.basename(__file__)} : Update row successful.")
        return jsonify({
            "message": "Update row successful!"
        }), 200
    except Exception as e:
        logger.error(f"{os.path.basename(__file__)} : Update row failed. {e.args[0]}")
        return jsonify({
            "message": f"Update row failed. {e.args[0]}"
        }), 500


@app.route("/deleteInputRows", methods=["DELETE"])
def delete_rows():
    table, ids, primary_keys = request.get_json()["table"], request.get_json()[
        "ids"], request.get_json()["primary_keys"]
    sql_where_clause = []

    for id in ids:
        id_arr = id.split(",")
        tmp = []
        for i, val in enumerate(id_arr):
            tmp.append(f"{primary_keys[i]} = '{val}'")
        sql_where_clause.append(" and ".join(tmp))

    try:
        for stmt in sql_where_clause:
            db.engine.execute(f"DELETE FROM {table} where {stmt}")

        logger.info(f"{os.path.basename(__file__)} : Delete row(s) successful.")
        return jsonify({
            "message": "Delete row(s) successful!"
        }), 200
    except Exception as e:
        logger.error(f"{os.path.basename(__file__)} : Delete row(s) failed. {e.args[0]}")
        return jsonify({
            "message": f"Delete row(s) failed. {e.args[0]}"
        }), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5003, debug=True)
