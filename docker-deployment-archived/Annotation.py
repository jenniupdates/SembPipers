import pandas as pd
import sqlite3
import pytz
import pymysql
import os
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask import Flask, request, jsonify
from dotenv import load_dotenv
from datetime import timedelta
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

class AnnotationDataTable(db.Model):
    __tablename__ = 'annotation_data'

    dashboard_id = db.Column(db.String(64), nullable=False)
    annotation_text = db.Column(db.String(64), nullable=False)
    tags = db.Column(db.String(64), nullable=False)
    start_time = db.Column(db.String(64), nullable=False, primary_key = True)
    end_time = db.Column(db.String(64), nullable=False)

    def __init__(self, dashboard_id, annotation_text, tags, start_time, end_time):
        self.dashboard_id = dashboard_id
        self.annotation_text = annotation_text
        self.tags = tags
        self.start_time = start_time
        self.end_time = end_time
        
    def json(self):
        return {
            "dashboard_id": self.dashboard_id,
            "annotation_text": self.annotation_text,
            "tags": self.tags,
            "start_time": self.start_time,
            "end_time": self.end_time
        }

@app.route('/annotation/')
def my_link():
  
  connection = pymysql.connect(host='localhost',### change
                             user='root',## change 
                             password='',
                             db='annotations')

  cursor = connection.cursor()
## set start time as primary key

  con = sqlite3.connect("grafana-storage\grafana.db") # grafana directory relative path
  df = pd.read_sql_query('SELECT dashboard_id,text,epoch,epoch_end,tags FROM annotation;', con) # selecting from grafana db
  tz = pytz.timezone('Asia/Singapore')
  df['epoch'] = pd.to_datetime(df['epoch'], unit='ms')
  df['start time'] = df['epoch'].apply(lambda x: x.replace(tzinfo=pytz.utc).astimezone(tz))
  df['epoch_end'] = pd.to_datetime(df['epoch_end'], unit='ms')
  df['end time'] = df['epoch_end'].apply(lambda x: x.replace(tzinfo=pytz.utc).astimezone(tz))
  df = df.drop(['epoch', 'epoch_end'], axis=1)
  print(df)
  # Create a new record
  

# Execute the query
  for index, row in df.iterrows():
    time = str(row['start time'])
    sql = "REPLACE INTO `annotation_data` (`dashboard_id`, `annotation_text`, `tags`, `start_time`, `end_time`) VALUES (%s, %s, %s, %s, %s)"
    cursor.execute(sql, (row['dashboard_id'],row['text'],row['tags'],row['start time'],row['end time']))

# the connection is not autocommited by default. So we must commit to save our changes.
  connection.commit()


  # df.to_csv('annotations.csv')
  # path = "../annotations.csv"
  

  ################################################# end ###################################################################################

if __name__ == '__main__':
  app.run(host="0.0.0.0", port=5031, debug=True)