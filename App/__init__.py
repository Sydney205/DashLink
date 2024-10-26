import os
import configparser
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_login import LoginManager
# from dotenv import load_dotenv

# Load environment variables from .env file
# load_dotenv()

config = configparser.ConfigParser()
config.read('config.ini')

app = Flask(__name__)
app.config['SECRET_KEY'] = config.get('APP', 'SECRET_TOKEN')
app.config['SQLALCHEMY_DATABASE_URI'] = config.get('APP', 'DATABASE_URL')

# app = Flask(__name__)
# app.config['SECRET_KEY'] = os.getenv("SECRET_TOKEN")
# app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv("DATABASE_URL")

db = SQLAlchemy(app)
bcrypt = Bcrypt(app)

login_manager = LoginManager(app)
login_manager.login_view = 'login'
login_manager.login_message_category = 'info'

app.app_context().push()

# from dashlink import routes
from App.routes import auth, root, user, url
