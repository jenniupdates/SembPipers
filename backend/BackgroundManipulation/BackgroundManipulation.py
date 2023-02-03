import os
from flask_jwt_extended import jwt_required, JWTManager
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask import Flask, request, jsonify
from datetime import timedelta
from dotenv import load_dotenv
from datetime import timedelta, datetime
import pandas as pd
import requests
from apscheduler.schedulers.background import BackgroundScheduler
import random
from time import sleep
from apscheduler.triggers.cron import CronTrigger


load_dotenv()

from TopSorter import topo_sort
from InternalDirectory import InternalDirectory, InternalTag
from ActivatedManipulationFormulaTable import ActivatedManipulationFormulaTable

app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

DB_USER = os.environ.get('DB_USER')
DB_PASSWORD = os.environ.get('DB_PASSWORD')
DB_ENDPOINT = os.environ.get('DB_ENDPOINT')

app.config["SQLALCHEMY_DATABASE_URI"] = f"mysql+mysqlconnector://{DB_USER}:{DB_PASSWORD}@localhost:3306/{DB_ENDPOINT}"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)

app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

DB_USER = os.environ.get('DB_USER')
DB_PASSWORD = os.environ.get('DB_PASSWORD')
DB_ENDPOINT = os.environ.get('DB_ENDPOINT')

app.config["SQLALCHEMY_DATABASE_URI"] = f"mysql+mysqlconnector://{DB_USER}:{DB_PASSWORD}@localhost:3306/{DB_ENDPOINT}"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)
engine_container = db.get_engine(app)

def run_batchjob():
    query = f"SELECT MAX(time_stamp) AS prev_timestamp FROM created_formula_data"
    response = db.engine.execute(query)
    prev_timestamp = ""
    for row in response: 
        if row.prev_timestamp is not None:
            prev_timestamp = row.prev_timestamp
        else:
            prev_timestamp = "2000-01-01 00:00:00"

    activated_rows = ActivatedManipulationFormulaTable.query.all()

    # Run batch job only if there are activated formulas within table
    if len(activated_rows) > 0:
        chosen_names = [row.internal_name for row in activated_rows]
        chosen_formulas = [row.formula_python for row in activated_rows]
        chosen_df = pd.DataFrame({
            "internal_name" : chosen_names,
            "formula_python" : chosen_formulas
        })

        chosen_order = topo_sort(chosen_df)
        query = f"SELECT * FROM sensor_data WHERE time_stamp > '{prev_timestamp}'"
        sensor_df = pd.read_sql(query, db.engine)
        sensor_df['time_stamp'] = sensor_df['time_stamp'].astype(str)
        timestamps = sensor_df['time_stamp'].unique().tolist()

        for ts in timestamps:
            try:
                tmp = {}
                for internal_name in chosen_order:
                    internal_type = InternalDirectory.query.filter(InternalDirectory.internal_name==internal_name)[0].internal_type

                    if internal_type == "Tag":
                        tag = InternalTag.query.filter(InternalTag.internal_name==internal_name)[0].tag
                        tmp[internal_name] = sensor_df[(sensor_df['time_stamp'] == ts) & (sensor_df['sensor'] == tag)].iloc[0]['sensor_value']

                    elif internal_type == "Formula":    
                        res = ActivatedManipulationFormulaTable.query.with_entities(ActivatedManipulationFormulaTable.column_variables, ActivatedManipulationFormulaTable.formula_python).filter(ActivatedManipulationFormulaTable.internal_name==internal_name)[0]
                        formula_python = res.formula_python
                        cv_str = res.column_variables
                        cv = cv_str.split(',')
                        for var in cv:
                            if var[0] == "P":
                                formula_python = formula_python.replace(var, str(tmp[var]))
                            else:
                                continue

                        tmp[internal_name] = eval(formula_python)
                        db.engine.execute(f"INSERT INTO created_formula_data (time_stamp, internal_name, formula_value) VALUES ('{ts}', '{internal_name}', '{tmp[internal_name]}')")

                    else:
                        tmp[internal_name] = None
            finally:
                cleanup(db.session)
        
        if len(timestamps) > 0:
            prev_timestamp = timestamps[-1]




# This function inserts random data into the sensor_data table to replicate the IoT sensors used at Sembcorp
def run_demosensor():
    now = datetime.now()
    dt_str = now.strftime("%Y-%m-%d %H:%M:%S")
    sensors = ['SW1000', 'SW1350', 'SW2000', 'CI5000']
    for sensor in sensors:
        rv = random.randint(1, 100)
        db.engine.execute(f"INSERT INTO sensor_data (time_stamp, sensor, sensor_value) VALUES ('{dt_str}', '{sensor}', '{rv}')")
    cleanup(db.session)


def cleanup(session):
    """"
    This method cleans up the session object and also closes the connection pool using the dispose methods
    """
    session.close()
    engine_container.dispose()

def main():
    sched = BackgroundScheduler(daemon=True, timezone='Asia/Singapore')
    sched.add_job(run_demosensor, 'cron', minute='*/1')
    sched.add_job(run_batchjob, 'cron', minute='*/1', second='20')
    sched.start()
    cleanup(db.session)


# needed to change use_reloader = False
if __name__ == "__main__":
    main()
    app.run(host="0.0.0.0", port=5022, debug=True, use_reloader=False)

