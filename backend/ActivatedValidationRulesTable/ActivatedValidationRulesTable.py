import os
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import timedelta
from flask import Flask, request, jsonify
from dotenv import load_dotenv
from datetime import timedelta
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

class ActivatedValidationRulesTable(db.Model):
    __tablename__ = 'activated_validation_rules'

    id = db.Column(db.Integer, primary_key=True,nullable=False,autoincrement=True)
    rule_used = db.Column(db.String(50),primary_key=True,nullable=False)
    table_name = db.Column(db.String(50),primary_key=True,nullable=False)
    column_variables = db.Column(db.String(80),primary_key=True,nullable=False)

    def __init__(self, rule_used, table_name, column_variables):
        self.rule_used = rule_used
        self.table_name = table_name
        self.column_variables = column_variables
        
    def json(self):
        set_functions = ActivatedValidationFunctions.query.filter_by(activated_id=self.id)
        return {
            "id": self.id,
            "rule_used": self.rule_used,
            "table_name": self.table_name,
            "column_variables": self.column_variables,
            "functions": [func.json() for func in set_functions]
        } 
        
class ActivatedValidationFunctions(db.Model):
    __tablename__ = 'activated_functions'
    
    activated_id = db.Column(db.Integer,primary_key=True,nullable=False)
    function_name = db.Column(db.String(50),primary_key=True,nullable=False)
    function_used = db.Column(db.String(100),primary_key=True,nullable=False)

    def __init__(self,activated_id,function_name,function_used):
        self.activated_id = activated_id
        self.function_name = function_name
        self.function_used = function_used
        
    def json(self):
        return {
            "activated_id": self.activated_id,
            "function_name": self.function_name,
            "function_used": self.function_used
        }
    
@app.route("/insertActivatedRule", methods=["POST"])
def insert_validation_rule():
    # Takes in validation rule parameters
    rule_used = request.get_json()["rule_name"]
    table_name = request.get_json()["table_name"]
    column_variables = request.get_json()["column_variables"]
    function_variables = request.get_json()["function_variables"]
    function_string = request.get_json()["function_string"]
    try:
        row = ActivatedValidationRulesTable(rule_used, table_name, column_variables)
        db.session.add(row)
        db.session.commit()
        if function_variables != "":
            function_variables_list = function_variables.split(",")
            function_list = function_string.split(",")
            for i in range(len(function_list)):
                function_row = ActivatedValidationFunctions(row.id,function_list[i],function_variables_list[i])
                db.session.add(function_row)
                db.session.commit()
        logger.info(f"{os.path.basename(__file__)} : Activated Rule Insert successful!")
        return jsonify({
            "message": "Activated Rule Insert successful!"
        }), 201
    except Exception as e:
        row = ActivatedValidationRulesTable.query.filter_by(rule_used=rule_used,table_name=table_name,column_variables=column_variables).first()
        if row:
            ActivatedValidationRulesTable.query.filter_by(rule_used=rule_used,table_name=table_name,column_variables=column_variables).delete()
            db.session.commit()
        logger.error(f"{os.path.basename(__file__)} : An error occurred while adding rule. {e.args[0]}")
        return jsonify({
            "message": f"An error occurred while adding rule. {e.args[0]}"
        }), 500
        
@app.route("/getActivatedTableColInfo", methods=["GET"])
def get_table_col_info():
    table = "activated_validation_rules"
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
        
@app.route("/getActivatedValidationRows", methods=["GET"])
def get_table_rows():
    try:
        rows = ActivatedValidationRulesTable.query.all()
        logger.info(f"{os.path.basename(__file__)} : Row(s) retrieval successful.")
        return jsonify({
        "rows": [row.json() for row in rows]
        }), 200
    except Exception as e:
        logger.error(f"{os.path.basename(__file__)} : Row(s) retrieval failed. {e.args[0]}")
        return jsonify({
            "message": f"Row(s) retrieval failed. {e.args[0]}"
        }), 500

@app.route("/getActivatedRowsByTable/<string:table_name>")
def get_activated_rows_by_table(table_name):
    try:
        rows = ActivatedValidationRulesTable.query.filter_by(table_name=table_name)
        logger.info(f"{os.path.basename(__file__)} : Row(s) retrieval successful.")
        return jsonify({
            "rows": [row.json() for row in rows]
        }), 200
    except Exception as e:
        logger.error(f"{os.path.basename(__file__)} : Row(s) retrieval failed. {e.args[0]}")
        return jsonify({
            "message": f"Row(s) retrieval failed. {e.args[0]}"
        }), 500  
        
@app.route("/deleteActivatedValidationRows", methods=["DELETE"])
def delete_rows():
    try: 
        ids = request.get_json()["ids"]
        for id in ids:
            ActivatedValidationFunctions.query.filter_by(activated_id=id).delete()
            ActivatedValidationRulesTable.query.filter_by(id=id).delete()
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
        
@app.route("/deleteActivatedValidationRowsByRuleName/<string:rule_name>", methods=["DELETE"])
def delete_rows_by_rule_name(rule_name):
    try:
        activated_rules = ActivatedValidationRulesTable.query.filter_by(rule_used=rule_name)
        for activated_rule in activated_rules:
            ActivatedValidationFunctions.query.filter_by(activated_id=activated_rule.id).delete()
        activated_rules.delete()

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
    app.run(host="0.0.0.0", port=5006, debug=True)