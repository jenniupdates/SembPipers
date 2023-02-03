import os
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import timedelta
from flask import Flask, request, jsonify
from dotenv import load_dotenv
from datetime import timedelta
import pandas as pd

load_dotenv()

from InternalDirectory import InternalDirectory
from ManipulationFormulaTable import ManipulationFormulaTable

app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

DB_USER = os.environ.get('DB_USER')
DB_PASSWORD = os.environ.get('DB_PASSWORD')
DB_ENDPOINT = os.environ.get('DB_ENDPOINT')

app.config["SQLALCHEMY_DATABASE_URI"] = f"mysql+mysqlconnector://{DB_USER}:{DB_PASSWORD}@localhost:3306/{DB_ENDPOINT}"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)

class ActivatedManipulationFormulaTable(db.Model):
    __tablename__ = 'activated_manipulation_formula'
    formula_used = db.Column(db.String(50),nullable=False)
    internal_name = db.Column(db.String(80),primary_key=True,nullable=False)
    column_variables = db.Column(db.String(80),nullable=False)
    formula_python = db.Column(db.String(200), nullable=False)


    def __init__(self, formula_used, internal_name, column_variables, formula_python):
        self.formula_used = formula_used
        self.internal_name = internal_name
        self.column_variables = column_variables
        self.formula_python = formula_python
        
    def json(self):
        return {
            # "id": self.id,
            "formula_used": self.formula_used,
            "internal_name": self.internal_name,
            "column_variables": self.column_variables,
            "formula_python": self.formula_python
        }

@app.route("/insertActivatedFormula", methods=["POST"])
def insert_manipulation_formula():
    formula_used = request.get_json()["formula_name"]
    internal_name = request.get_json()["internal_name"]
    column_variables = request.get_json()["column_variables"]
    current_formulas = ActivatedManipulationFormulaTable.query.all()
    current_names = [cn.internal_name for cn in current_formulas]
    
    if internal_name in current_names:
        return jsonify ({
            "message": "A duplicate internal name has been chosen. Please choose another."
        }), 400
    
    if internal_name[0] != "P":
        return jsonify ({
            "message": "The internal name given must start with 'P'."
        }), 400


    # generate_formula_python by replacing the variables in formula_code with column_variables
    response = ManipulationFormulaTable.query.filter_by(formula_name = formula_used).first()
    formula_variables = response.json()["formula_variables"]
    fv_list = [x.strip() for x in formula_variables.split(',')]
    cv_list = [x.strip() for x in column_variables.split(',')]
    formula_python = response.json()["formula_code"]
    for i in range(len(fv_list)):
        formula_python = formula_python.replace(fv_list[i], cv_list[i])

    try:
        row = ActivatedManipulationFormulaTable(formula_used, internal_name, column_variables, formula_python)
        db.session.add(row)
        db.session.commit()

        # Add activated formula to the internal_directory table
        row = InternalDirectory(internal_name, "Formula")
        db.session.add(row)
        db.session.commit()

        # row = InternalFormula(internal_name, formula_python)
        # db.session.add(row)
        # db.session.commit()

        return jsonify({
            "message": "Activated Formula Insert successful to activated_manipulation_formula and internal_directory!"
        }), 201

    except Exception as e:
        return jsonify({
            "message": f"An error occurred while activating formula. {e.args[0]}"
        }), 500

@app.route("/deleteActivatedFormulaRows", methods=["DELETE"])
def delete_activated_formula_rows():    
    internal_names = request.get_json()["ids"]
    try:     
        # InternalFormula.query.filter(InternalFormula.internal_name.in_(internal_names)).delete()
        InternalDirectory.query.filter(InternalDirectory.internal_name.in_(internal_names)).delete()
        ActivatedManipulationFormulaTable.query.filter(ActivatedManipulationFormulaTable.internal_name.in_(internal_names)).delete()

        return jsonify({
            "message": "Delete successful!"
        }), 200
    except Exception as e:
        return jsonify ({
            "message": f"Delete of formulas failed. {e.args[0]}"
        })


@app.route("/getActivatedFormulaCols", methods=["GET"])
def get_activated_formula_cols():
    try:
        response = db.engine.execute("DESCRIBE activated_manipulation_formula")
        columns = []
        primary_keys = []
        for col in response:
            columns.append((col[0], col[1].decode("utf-8"), col[3]))  
            if col[3] == "PRI":
                primary_keys.append(col[0])
        # columns.append(('formula_python','varchar(255)', ''))
        return jsonify({
            "message": "Column(s) retrieval successful.",
            "columns": columns,
            "primary_keys": primary_keys
        }), 200
    except Exception as e:
        return jsonify({
            "message": f"Columns retrieval failed. {e.args[0]}"
        }), 500
        
@app.route("/getActivatedFormulaRows", methods=["GET"])
def get_table_rows():
    try:
        rows = ActivatedManipulationFormulaTable.query.all()
        df = pd.DataFrame({
            "internal_name": [row.internal_name for row in rows],
            "formula_used": [row.formula_used for row in rows],
            "column_variables": [row.column_variables for row in rows],
            "formula_python": [row.formula_python for row in rows]
        })
        result = df.to_dict('records')
        return jsonify({
            "rows": result
        }), 200
    except Exception as e:
        return jsonify({
            "message": f"Row(s) retrieval failed. {e.args[0]}"
        }), 500

        
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5021, debug=True)