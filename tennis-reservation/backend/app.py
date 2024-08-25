from flask import Flask, jsonify, request
from flask_jwt_extended import JWTManager, jwt_required, create_access_token
from pymongo import MongoClient
from twilio.rest import Client
from celery import Celery
from flask_cors import CORS
from bson.binary import Binary
import bcrypt
from dotenv import load_dotenv
from config import Config

app = Flask(__name__)
app.config.from_object(Config)

# Enable CORS for all routes and origins
CORS(app, resources={r"/*": {"origins": "*"}}) 

load_dotenv()

@app.route('/')
def home():
    return 'Welcome to the Tennis Court API!'

jwt = JWTManager(app)

client = MongoClient('localhost', 27017)
db = client['tennis_reservation_db']
reservations_collection = db['reservations']
users_collection = db['users']

account_sid = app.config['TWILIO_ACCOUNT_SID']
auth_token = app.config['TWILIO_AUTH_TOKEN']
verify_service_sid = app.config['TWILIO_VERIFY_SERVICE_SID']
twilio_client = Client(account_sid, auth_token)
twilio_phone_number = app.config['TWILIO_PHONE_NUMBER']

def make_celery(app):
    celery = Celery(
        app.import_name,
        backend=app.config['CELERY_RESULT_BACKEND'],
        broker=app.config['CELERY_BROKER_URL']
    )
    celery.conf.update(app.config)
    return celery

celery = make_celery(app)

@celery.task
def send_reminder(phone, timeSlot, date):
    message = f"Reminder: Your tennis court reservation is at {timeSlot} on {date}."
    try:
        twilio_client.messages.create(
            body=message,
            from_=twilio_phone_number,
            to=phone
        )
    except Exception as e:
        print(f"Failed to send message: {e}")

def format_phone_number(phone_number):
    if not phone_number.startswith('+'):
        phone_number = '+972' + phone_number.lstrip('0')  # Example for Israel
    return phone_number

@app.route('/send_verification', methods=['POST'])
def send_verification():
    phone_number = request.json.get('phone')
    if not phone_number:
        return jsonify({"error": "Phone number is required"}), 400

    formatted_phone = format_phone_number(phone_number)
    try:
        verification = twilio_client.verify \
            .v2 \
            .services(verify_service_sid) \
            .verifications \
            .create(to=formatted_phone, channel='sms')

        return jsonify({"message": "Verification code sent"}), 200
    except Exception as e:
        print(f"Twilio verification error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/verify_code', methods=['POST'])
def verify_code():
    phone_number = request.json.get('phone')
    code = request.json.get('code')

    if not phone_number or not code:
        return jsonify({"error": "Phone number and code are required"}), 400

    try:
        formatted_phone = format_phone_number(phone_number)
        verification_check = twilio_client.verify \
            .v2 \
            .services(verify_service_sid) \
            .verification_checks \
            .create(to=formatted_phone, code=code)

        if verification_check.status == 'approved':
            return jsonify({"message": "Phone number verified"}), 200
        else:
            return jsonify({"error": "Invalid verification code"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/login', methods=['POST'])
def login():
    try:
        username = request.json.get('username')
        password = request.json.get('password')

        if not username or not password:
            return jsonify({"error": "Username and password are required"}), 400

        user = users_collection.find_one({"username": username})
        if user and 'password' in user:
            hashed_password = user['password']
            if isinstance(hashed_password, str):
                hashed_password = hashed_password.encode('utf-8')
            if bcrypt.checkpw(password.encode('utf-8'), hashed_password):
                access_token = create_access_token(identity=username)
                return jsonify(access_token=access_token), 200
            else:
                return jsonify({"error": "Invalid credentials"}), 401
        else:
            return jsonify({"error": "User not found"}), 404
    except Exception as e:
        print(f"An error occurred: {e}")
        return jsonify({"error": "An internal server error occurred"}), 500

@app.route('/reservations', methods=['GET'])
@jwt_required()
def get_reservations():
    try:
        reservations = list(reservations_collection.find())
        for reservation in reservations:
            reservation['_id'] = str(reservation['_id'])  # Convert ObjectId to string
        return jsonify(reservations), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/reservations', methods=['POST'])
@jwt_required()
def add_reservation():
    data = request.json
    try:
        first_name = data.get('firstName')
        last_name = data.get('lastName')
        phone = data.get('phone')
        email = data.get('email')
        date = data.get('date')
        start_time = data.get('startTime')
        end_time = data.get('endTime')
        
        if not all([first_name, last_name, phone, email, date, start_time, end_time]):
            return jsonify({"error": "All fields are required"}), 400
        
        reservation = {
            "firstName": first_name,
            "lastName": last_name,
            "phone": phone,
            "email": email,
            "date": date,
            "startTime": start_time,
            "endTime": end_time
        }
        
        reservation_id = reservations_collection.insert_one(reservation).inserted_id
        
        return jsonify({"message": "Reservation added", "reservation_id": str(reservation_id)}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

@app.route('/add_demo_reservation', methods=['POST'])
def add_demo_reservation():
    try:
        demo_reservation = {
            "firstName": "John",
            "lastName": "Doe",
            "phone": "+972500000000",
            "email": "john.doe@example.com",
            "date": "2024-09-01",  # Change to the date you want
            "startTime": "10:00",
            "endTime": "11:00"
        }
        
        # Insert into MongoDB
        reservation_id = reservations_collection.insert_one(demo_reservation).inserted_id
        
        return jsonify({"message": "Demo reservation added", "reservation_id": str(reservation_id)}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
