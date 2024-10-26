from flask import render_template
from App import app
from App.forms import ContactForm

# The root
@app.route('/', methods=['GET', 'POST'])
@app.route("/home", methods=['GET', 'POST'])
def home():
    form = ContactForm()
    return render_template("index.html", form=form)
