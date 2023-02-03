import os.path
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask import Flask, request, jsonify
from dotenv import load_dotenv
from datetime import timedelta
import requests
import pandas as pd

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

class ManipulationFormulaTable(db.Model):
    __tablename__ = 'manipulation_formula'

    # id = db.Column(db.Integer, primary_key=True,autoincrement=True, nullable=False)
    formula_name = db.Column(db.String(100),nullable=False, primary_key=True)
    formula_description = db.Column(db.String(100),nullable=False)
    formula_variables = db.Column(db.String(80),nullable=False)
    formula_code = db.Column(db.String(150),nullable=False)

    def __init__(self, formula_name, formula_description, formula_variables, formula_code):
        self.formula_name = formula_name
        self.formula_description = formula_description
        self.formula_variables = formula_variables
        self.formula_code = formula_code
        
    def json(self):
        return {
            # "id": self.id,
            "formula_name": self.formula_name,
            "formula_description": self.formula_description,
            "formula_variables": self.formula_variables,
            "formula_code": self.formula_code
        }


@app.route("/insertManipulationFormula", methods=["POST"])
def insert_manipulation_formula():
    values = request.get_json()["values"]
    try:
        row = ManipulationFormulaTable(values[0], values[1], values[2],values[3])
        db.session.add(row)
        db.session.commit()
        return jsonify({
            "message": "Formula Insert successful!"
        }), 201
    except Exception as e:
        return jsonify({
            "message": f"An error occurred while adding formula. {e.args[0]}"
        }), 500
        
@app.route("/getManipulationFormulaCols", methods=["GET"])
def get_manipulation_formula_cols():
    try:
        response = db.engine.execute("DESCRIBE manipulation_formula")
        columns = []
        primary_keys = []
        for col in response:
            columns.append((col[0], col[1].decode("utf-8"), col[3]))   
            if col[3] == "PRI":
                primary_keys.append(col[0])
                
        return jsonify({
            "message": "Columns(s) retrieval successful",
            "columns": columns,
            "primary_keys": primary_keys
        }), 200
    except Exception as e:
        return jsonify({
            "message": f"Columns retrieval failed. {e.args[0]}"
        }), 500

        
@app.route("/getManipulationFormulaRows", methods=["GET"])
def get_manipulation_formula_rows():
    try:
        rows = ManipulationFormulaTable.query.all()
        return jsonify({
            "rows": [row.json() for row in rows]
        }), 200
    except Exception as e:
        return jsonify({
            "message": f"Row(s) retrieval failed. {e.args[0]}"
        }), 500
        
@app.route("/getFormulaNames", methods=["GET"])
def get_formula_names():
    try:
        rows = ManipulationFormulaTable.query.all()
        return jsonify({
        "formula_names": [row.json()["formula_name"] for row in rows]
        }), 200
    except Exception as e:
        return jsonify({
            "message": f"Row(s) retrieval failed. {e.args[0]}"
        }), 500
        
@app.route("/getFormulaVariablesCode/<string:formula_name>", methods=["GET"])
def get_formula_variables_code(formula_name):
    try:
        row = ManipulationFormulaTable.query.filter_by(formula_name=formula_name).first()
        if not row:
            return jsonify({
                "message": "Formula does not exist."
            }), 404
        variables = row.json()["formula_variables"]
        code = row.json()["formula_code"]
        return jsonify({
            "variables": variables.split(","),
            "code": code
        }), 200
    except Exception as e:
        return jsonify({
            "message": f"Row(s) retrieval failed. {e.args[0]}"
        }), 500


@app.route("/deleteFormulaRows", methods=["DELETE"])
def delete_rows():
    ids = request.get_json()["ids"]
    try:
        ManipulationFormulaTable.query.filter(ManipulationFormulaTable.formula_name.in_(ids)).delete()
        return jsonify({
            "message": "Delete successful!"
        }), 200
    except Exception as e:
        return jsonify ({
            "message": f"Delete of formulas failed. {e.args[0]}"
        }), 500

@app.route("/processGenericFormulaUpload", methods=["POST"])
def process_generic_formula_upload():

    try:

        if len(request.files) <= 0:
            return jsonify ({
                "result": "No file attached."
            }), 404

        file = request.files["file"]

        file_name = file.filename
        extension = os.path.splitext(file_name)[1]

        if extension == ".csv":
            df = pd.read_csv(file.stream)
        elif extension == ".xlsx":
            df = pd.read_excel(file.stream)
        else:
            return jsonify ({
                "message": "File type has to be either in csv or or xlsx format."
            }), 200


        invalid_cols = []
        use_cols = ["formula_name", "formula_description", "formula_variables", "formula_code"]
        for col in df.columns:
            if col not in use_cols:
                invalid_cols.append(col)
        
        if len(invalid_cols) > 0:
            return jsonify ({
                "message": f"The columns in your file does match the columns for generic formulas. The mismatched columns are {invalid_cols}"
            }), 400


        df.to_sql(name="manipulation_formula", con=db.engine, index=False, if_exists='append')
        return jsonify ({
            "message": "Data import of generic formulas was successful."
        }), 200

    except Exception as e:
        return jsonify ({
            "message": f"There was an error importing your data. {e.args[0]}"
        }), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5020, debug=True)
