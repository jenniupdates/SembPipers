import pandas as pd
import sqlite3
import pytz
import pymysql
from flask_cors import CORS
from flask import Flask, jsonify
from dotenv import load_dotenv
load_dotenv()

app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

@app.route('/')
def goToRoute():
  return "head to /annotation instead"

@app.route('/annotation')
def annotationDataToDB():
  
  connection = pymysql.connect(host='localhost',
                             user='root',
                             password='',
                             db='sembcorp')

  cursor = connection.cursor()
  
  con = sqlite3.connect("../grafana-storage/grafana.db") # grafana directory relative path
  df = pd.read_sql_query('SELECT dashboard_id,text,epoch,epoch_end,tags FROM annotation;', con) # selecting from grafana db
  tz = pytz.timezone('Asia/Singapore')
  df['epoch'] = pd.to_datetime(df['epoch'], unit='ms')
  df['start time'] = df['epoch'].apply(lambda x: x.replace(tzinfo=pytz.utc).astimezone(tz))
  df['epoch_end'] = pd.to_datetime(df['epoch_end'], unit='ms')
  df['end time'] = df['epoch_end'].apply(lambda x: x.replace(tzinfo=pytz.utc).astimezone(tz))
  df = df.drop(['epoch', 'epoch_end'], axis=1)  

  for index, row in df.iterrows():
    time = str(row['start time'])
    sql = "REPLACE INTO `annotation_data` (`dashboard_id`, `annotation_text`, `tags`, `start_time`, `end_time`) VALUES (%s, %s, %s, %s, %s)"
    cursor.execute(sql, (row['dashboard_id'],row['text'],row['tags'],row['start time'],row['end time']))

  connection.commit()
  return jsonify({
    "message": "Success!! Annotation data has been successfully ingested into central db under table name: 'annotation_data'! You can head back to http://localhost:3000/admin/annotation",
  }), 200


if __name__ == '__main__':
  app.run(host="0.0.0.0", port=5031, debug=True)