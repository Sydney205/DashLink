import os
from dotenv import load_dotenv
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_login import LoginManager

# Load .env from project root (or current working directory)
load_dotenv()

app = Flask(__name__)

# Read secrets and config from environment variables
secret_key = os.getenv('SECRET_TOKEN') or os.getenv('SECRET_KEY')
database_url = os.getenv('DATABASE_URL')

if not secret_key:
    raise RuntimeError('SECRET_TOKEN (or SECRET_KEY) not set in environment. Please add it to your .env or environment variables.')

if not database_url:
    raise RuntimeError('DATABASE_URL not set in environment. Please add it to your .env or environment variables.')

app.config['SECRET_KEY'] = secret_key
app.config['SQLALCHEMY_DATABASE_URI'] = database_url
# Recommended to explicitly disable track modifications to avoid warnings and extra overhead
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
bcrypt = Bcrypt(app)

login_manager = LoginManager(app)
login_manager.login_view = 'login'
login_manager.login_message_category = 'info'

app.app_context().push()

# Route blueprints
from App.routes import auth, root, user, url
