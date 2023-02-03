import os
from dotenv import load_dotenv
load_dotenv()

DB_USER = os.environ.get('DB_USER')
DB_PASSWORD = os.environ.get('DB_PASSWORD')

DB_CONNECTION_STRING = f"mysql+mysqlconnector://{DB_USER}:{DB_PASSWORD}@localhost:3306"