import os
import json

import pandas as pd
import numpy as np
import requests

import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine
from sqlalchemy import or_

from flask import Flask, jsonify, render_template, send_from_directory, request as flask_request
from flask_sqlalchemy import SQLAlchemy

#################################################
# App Setup
#################################################

# Determine if we're serving the React build or templates
REACT_BUILD_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static', 'dist')
SERVE_REACT = os.path.exists(os.path.join(REACT_BUILD_DIR, 'index.html'))

if SERVE_REACT:
    app = Flask(__name__, static_folder=REACT_BUILD_DIR, static_url_path='')
else:
    app = Flask(__name__)


#################################################
# Database Setup
#################################################

basedir = os.path.abspath(os.path.dirname(__file__))
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///" + os.path.join(basedir, "db", "food.sqlite")
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db = SQLAlchemy(app)

# reflect an existing database into a new model
Base = automap_base()
# reflect the tables within app context
with app.app_context():
    Base.prepare(db.engine, reflect=True)

# Save references to each table
food_db = Base.classes.Food_file

#################################################
# CPSC Recalls API Proxy
#################################################

@app.route("/api/cpsc/recalls")
def cpsc_recalls():
    """Proxy endpoint for CPSC SaferProducts.gov Recall API."""
    try:
        url = "https://www.saferproducts.gov/RestWebServices/Recall"
        params = {
            "format": "json",
            "RecallDateStart": flask_request.args.get("start_date", "2024-01-01"),
            "RecallDateEnd": flask_request.args.get("end_date", ""),
        }
        # Remove empty params
        params = {k: v for k, v in params.items() if v}

        headers = {"User-Agent": "Mozilla/5.0 (compatible; RecallDashboard/1.0)"}
        resp = requests.get(url, params=params, timeout=30, headers=headers)
        resp.raise_for_status()
        data = resp.json()
        return jsonify(data)
    except requests.exceptions.RequestException as e:
        return jsonify({"error": str(e)}), 502
    except Exception as e:
        return jsonify({"error": str(e)}), 500


#################################################
# Page Routes (React SPA or legacy templates)
#################################################

if SERVE_REACT:
    @app.route("/")
    def index():
        return send_from_directory(REACT_BUILD_DIR, 'index.html')

    @app.route("/past-recalls")
    @app.route("/recent-recalls")
    @app.route("/recalls-by-state")
    @app.route("/cpsc-recalls")
    def react_routes():
        """Catch-all for React Router client-side routes."""
        return send_from_directory(REACT_BUILD_DIR, 'index.html')
else:
    @app.route("/")
    def index():
        """Return the homepage."""
        return render_template("index.html")

    @app.route("/past_recalls/")
    def past_recalls():
        """Return the past recalls page."""
        return render_template("past_recalls.html")

    @app.route("/current_recalls/")
    def current_recalls():
        """Return the current recalls page."""
        return render_template("current_recalls.html")

    @app.route("/recalls_by_state/")
    def recalls_by_state():
        """Return the recalls by state page."""
        return render_template("recalls_by_state.html")

@app.route("/data")
def allData():
    """Return all data."""

    # Use Pandas to perform the sql query
    stmt = db.session.query(food_db).statement
    df = pd.read_sql_query(stmt, db.engine)

    data = df.to_json(orient='records')
    # return data in json objects
    return data

@app.route("/data/<start_date>/<end_date>")
def start_end(start_date, end_date):
    """Return filtered data between start and end date."""
    #dates appear in the format : 2012-08-01

    if len(end_date) < 10:
        end_date = end_date + "-31"

    # Use Pandas to perform the sql query
    start_end_recalls = db.session.query(food_db).\
        filter(food_db.recall_date >= start_date).\
        filter(food_db.recall_date <= end_date).\
        statement
    

    df = pd.read_sql_query(start_end_recalls, db.engine)
    recalls_list = df.to_json(orient='records')
    
    return recalls_list

@app.route("/data/<class1>/<class2>/<class3>/<start_date>/<end_date>")
def class2_start_end(class1,class2,class3,start_date, end_date):
    """Return filtered data between start and end date and filter by class."""

    # dates appear in the format : 2012-08-01

    if len(start_date) < 10:
        start_date = start_date + "-01"

    if len(end_date) < 10:
        end_date = end_date + "-31"

    # classification appears in this format : Class I

    if class1 == 'true' and class2 == 'true' and class3 == 'true':
        start_end_class_recalls = db.session.query(food_db).\
            filter(food_db.recall_date >= start_date).\
            filter(food_db.recall_date <= end_date).\
            statement
    
        df = pd.read_sql_query(start_end_class_recalls, db.engine)
        recalls_class_list = df.to_json(orient='records')
        
        return recalls_class_list

    elif class1 == 'true' and class2 == 'true':
        start_end_class_recalls = db.session.query(food_db).\
            filter(food_db.recall_date >= start_date).\
            filter(food_db.recall_date <= end_date).\
            filter(or_(food_db.classification == "Class I", food_db.classification == "Class II")).\
            statement
    
        df = pd.read_sql_query(start_end_class_recalls, db.engine)
        recalls_class_list = df.to_json(orient='records')
        
        return recalls_class_list

    elif class1 == 'true' and class3 == 'true':
        start_end_class_recalls = db.session.query(food_db).\
            filter(food_db.recall_date >= start_date).\
            filter(food_db.recall_date <= end_date).\
            filter(or_(food_db.classification == "Class I", food_db.classification == "Class III")).\
            statement
    
        df = pd.read_sql_query(start_end_class_recalls, db.engine)
        recalls_class_list = df.to_json(orient='records')
        
        return recalls_class_list
    
    elif class2 == 'true' and class3 == 'true':
        start_end_class_recalls = db.session.query(food_db).\
            filter(food_db.recall_date >= start_date).\
            filter(food_db.recall_date <= end_date).\
            filter(or_(food_db.classification == "Class II", food_db.classification == "Class III")).\
            statement
    
        df = pd.read_sql_query(start_end_class_recalls, db.engine)
        recalls_class_list = df.to_json(orient='records')
        
        return recalls_class_list

    elif class1 == 'true':
        start_end_class_recalls = db.session.query(food_db).\
            filter(food_db.recall_date >= start_date).\
            filter(food_db.recall_date <= end_date).\
            filter(food_db.classification == "Class I").\
            statement
    
        df = pd.read_sql_query(start_end_class_recalls, db.engine)
        recalls_class_list = df.to_json(orient='records')
        
        return recalls_class_list

    elif class2 == 'true':
        start_end_class_recalls = db.session.query(food_db).\
            filter(food_db.recall_date >= start_date).\
            filter(food_db.recall_date <= end_date).\
            filter(food_db.classification == "Class II").\
            statement
    
        df = pd.read_sql_query(start_end_class_recalls, db.engine)
        recalls_class_list = df.to_json(orient='records')
        
        return recalls_class_list

    elif class3 == 'true':
        start_end_class_recalls = db.session.query(food_db).\
            filter(food_db.recall_date >= start_date).\
            filter(food_db.recall_date <= end_date).\
            filter(food_db.classification == "Class III").\
            statement
    
        df = pd.read_sql_query(start_end_class_recalls, db.engine)
        recalls_class_list = df.to_json(orient='records')
        
        return recalls_class_list

    else:
        # Use Pandas to perform the sql query
        start_end_class_recalls = db.session.query(food_db).\
            filter(food_db.recall_date >= start_date).\
            filter(food_db.recall_date <= end_date).\
            statement

        df = pd.read_sql_query(start_end_class_recalls, db.engine)
        recalls_class_list = df.to_json(orient='records')
        
        return recalls_class_list

if __name__ == "__main__":
    app.run()
