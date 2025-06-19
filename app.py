from dotenv import load_dotenv
load_dotenv()
from flask import Flask, render_template, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import (
    JWTManager, create_access_token, jwt_required, get_jwt_identity
)
from datetime import timedelta
from decimal import Decimal
import os  # ✅ for environment variables

app = Flask(__name__)

# ✅ Secure Config from Render Environment
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY')
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('SQLALCHEMY_DATABASE_URI')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=12)

# ✅ Extensions
db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

# ✅ Models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    account = db.relationship('Account', backref='user', uselist=False)

class Account(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    account_number = db.Column(db.String(20), unique=True, nullable=False)
    balance = db.Column(db.Numeric(15, 2), default=0.00)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

def generate_account_number():
    import random
    return f"DSB{random.randint(10000000, 99999999)}"

# ✅ Create tables if not exist
with app.app_context():
    db.create_all()

# ✅ Routes
@app.route('/')
def home():
    return render_template('index.html')

@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    if not name or not email or not password:
        return jsonify({'error': 'All fields are required'}), 400
    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'Email already registered'}), 400
    pw_hash = bcrypt.generate_password_hash(password).decode('utf-8')
    user = User(name=name, email=email, password_hash=pw_hash)
    db.session.add(user)
    db.session.commit()
    account = Account(account_number=generate_account_number(), user_id=user.id, balance=0)
    db.session.add(account)
    db.session.commit()
    return jsonify({'message': 'Registration successful! Please login.'}), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    user = User.query.filter_by(email=email).first()
    if user and bcrypt.check_password_hash(user.password_hash, password):
        access_token = create_access_token(identity=user.id)
        return jsonify({
            'access_token': access_token,
            'name': user.name,
            'account_number': user.account.account_number,
            'balance': float(user.account.balance)
        })
    return jsonify({'error': 'Invalid credentials'}), 401

@app.route('/api/account', methods=['GET'])
@jwt_required()
def account():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user or not user.account:
        return jsonify({'error': 'Account not found'}), 404
    return jsonify({
        'name': user.name,
        'account_number': user.account.account_number,
        'balance': float(user.account.balance)
    })

@app.route('/api/deposit', methods=['POST'])
@jwt_required()
def deposit():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    amount = Decimal(str(request.json.get('amount', 0)))
    if amount <= 0:
        return jsonify({'error': 'Invalid amount'}), 400
    user.account.balance += amount
    db.session.commit()
    return jsonify({'message': 'Deposit successful', 'balance': float(user.account.balance)})

@app.route('/api/withdraw', methods=['POST'])
@jwt_required()
def withdraw():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    amount = Decimal(str(request.json.get('amount', 0)))
    if amount <= 0 or user.account.balance < amount:
        return jsonify({'error': 'Invalid or insufficient funds'}), 400
    user.account.balance -= amount
    db.session.commit()
    return jsonify({'message': 'Withdrawal successful', 'balance': float(user.account.balance)})

# ✅ For Render deployment
if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)
