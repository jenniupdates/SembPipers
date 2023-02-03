import os
from flask_jwt_extended import create_access_token, JWTManager, unset_jwt_cookies, get_jwt, get_jwt_identity
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import timedelta
from flask import Flask, request, jsonify
from dotenv import load_dotenv
import bcrypt
import json
from datetime import datetime, timedelta, timezone
import logging
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

class User(db.Model):
    __tablename__ = 'users'

    email = db.Column(db.String(64), primary_key=True)
    password = db.Column(db.String(64))
    role = db.Column(db.String(64))
    has_logged_in = db.Column(db.Boolean)

    def __init__(self, email, password, role, has_logged_in):
        self.email = email
        self.password = password
        self.role = role
        self.has_logged_in = has_logged_in

    def json(self):
        return {
            "email": self.email,
            "password": self.password,
            "role": self.role,
            "has_logged_in": self.has_logged_in
        }

@app.route("/createUser", methods=["POST"])
def create_user():
    email, password, role = request.get_json()["email"], request.get_json()["password"], request.get_json()["role"]
    hashed_pw = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    new_user = User(email, hashed_pw, role, 0)

    try:
        db.session.merge(new_user)
        db.session.commit()

        logger.info(f"{os.path.basename(__file__)} : Create user successful.")
        return jsonify({
            "message": "New user created!"
        }), 200
    except Exception as e:
        logger.error(f"{os.path.basename(__file__)} : Create user failed. {e.args[0]}")
        return jsonify({
            "message": f"Create user failed. {e.args[0]}"
        }), 500

@app.route('/login', methods=["POST"])
def create_token():
    email = request.get_json()["email"]

    try:
        user = User.query.filter_by(email=email).first()

        if user == None:
            raise Exception("User not found.")

        password = request.get_json()["password"]
        if bcrypt.checkpw(password.encode('utf-8'), user.password.encode('utf-8')):
            access_token = create_access_token(identity=email)

            logger.info(f"{os.path.basename(__file__)} : Login successful.")
            return jsonify(
                {
                    "message": "Login successful.",
                    "access_token": access_token,
                    "role": user.role,
                    "email": user.email,
                    "has_logged_in": user.has_logged_in
                }
            ), 200
        else:
            raise Exception("Wrong email or password.")
    except Exception as e:
        logger.error(f"{os.path.basename(__file__)} : Login failed. {e.args[0]}")
        return jsonify({
            "message": f"Login failed. {e.args[0]}"
        }), 500

@app.route("/logout", methods=["POST"])
def logout():
    logger.info(f"{os.path.basename(__file__)} : Logout successful.")
    response = jsonify({ "message": "Logout successful" })
    unset_jwt_cookies(response)
    return response

@app.after_request
def refresh_expiring_jwts(response):
    try:
        exp_timestamp = get_jwt()["exp"]
        now = datetime.now(timezone.utc)
        target_timestamp = datetime.timestamp(now + timedelta(minutes=30))
        if target_timestamp > exp_timestamp:
            access_token = create_access_token(identity=get_jwt_identity())
            data = response.get_json()
            if type(data) is dict:
                data["access_token"] = access_token
                response.data = json.dumps(data)
        return response
    except (RuntimeError, KeyError):
        # Case where there is not a valid JWT. Just return the original respone
        return response

@app.route("/getUsers", methods=["GET"])
def get_users():
    try:
        users = User.query.all()

        if users is not None:
            logger.info(f"{os.path.basename(__file__)} : Get user(s) successful.")
            return jsonify({
                "message": "Get user(s) successful.",
                "users": [user.json() for user in users]
            })

        logger.error(f"{os.path.basename(__file__)} : Get user(s) failed. There are no users.")
        return jsonify({
            "message": "Get user(s) failed. There are no users."
        }), 404
    except Exception as e:
        logger.error(f"{os.path.basename(__file__)} : Get user(s) failed. {e.args[0]}")
        return jsonify({
            "message": f"Get user(s) failed. {e.args[0]}"
        }), 500


@app.route("/updatePassword", methods=["PUT"])
def update_password():
    print(request.get_json())
    email, newPassword = request.get_json()["email"], request.get_json()["newPassword"]
    hashed_pw = bcrypt.hashpw(newPassword.encode('utf-8'), bcrypt.gensalt())
    
    try:
        user = User.query.filter_by(email=email).first()
        setattr(user, "password", hashed_pw)
        setattr(user, "has_logged_in", True)
        db.session.commit()

        logger.info(f"{os.path.basename(__file__)} : Change password successful.")
        return jsonify(
            {
                "message": "Change password successful."
            }
        ), 200
    except Exception as e:
        logger.error(f"{os.path.basename(__file__)} : Change password failed. {e.args[0]}")
        return jsonify(
            {
                "message": f"Change password failed. {e.args[0]}"
            }
        ), 500


@app.route("/deleteUser", methods=["DELETE"])
def delete_user():
    to_del_email = request.get_json()["email"]

    try:
        User.query.filter_by(email=to_del_email).delete()
        db.session.commit()

        logger.info(f"{os.path.basename(__file__)} : Delete user successful.")
        return jsonify({
            "message": "Delete user successful!"
        }), 200
    except Exception as e:
        logger.error(f"{os.path.basename(__file__)} : Delete user failed. {e.args[0]}")
        return jsonify({
            "message": f"Delete user failed. {e.args[0]}"
        }), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)
