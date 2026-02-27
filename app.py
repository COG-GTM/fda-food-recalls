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

from flask import Flask, jsonify, render_template, request, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

basedir = os.path.abspath(os.path.dirname(__file__))
app = Flask(__name__, static_folder=os.path.join(basedir, 'frontend', 'dist'), static_url_path='')
CORS(app)


#################################################
# Database Setup
#################################################

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///" + os.path.join(basedir, "db", "food.sqlite")
db = SQLAlchemy(app)

# reflect an existing database into a new model
Base = automap_base()

# reflect the tables within app context
with app.app_context():
    Base.prepare(db.engine, reflect=True)

# Save references to each table
food_db = Base.classes.Food_file

# Old template-serving routes removed — React frontend handles all page routes

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

@app.route("/cpsc/recalls")
def cpsc_recalls():
    """Proxy CPSC recall data to avoid CORS issues."""
    params = {"format": "json"}

    product_type = request.args.get("ProductType")
    if product_type:
        params["ProductType"] = product_type

    recall_date_start = request.args.get("RecallDateStart")
    if recall_date_start:
        params["RecallDateStart"] = recall_date_start

    recall_date_end = request.args.get("RecallDateEnd")
    if recall_date_end:
        params["RecallDateEnd"] = recall_date_end

    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (compatible; FDA-Recalls-App/1.0)",
            "Accept": "application/json",
        }
        resp = requests.get(
            "https://www.saferproducts.gov/RestWebServices/Recall",
            params=params,
            headers=headers,
            timeout=30,
        )
        resp.raise_for_status()
        cpsc_data = resp.json()
    except Exception as e:
        return jsonify({"error": str(e)}), 502

    # Normalize CPSC data to match FDA schema
    normalized = []
    for item in cpsc_data:
        # Extract manufacturer name
        manufacturers = item.get("Manufacturers", [])
        firm = manufacturers[0].get("Name", "Unknown") if manufacturers else "Unknown"

        # Extract product description
        products = item.get("Products", [])
        product_desc = products[0].get("Description", "N/A") if products else "N/A"

        # Extract reason
        reason = item.get("Description", "N/A")

        # Extract recall date
        recall_date = item.get("RecallDate", "")

        # Build distribution_pattern from state data if available
        # CPSC doesn't always have geographic data, so default to "Nationwide"
        dist_pattern = "Nationwide"

        normalized.append({
            "recalling_firm": firm,
            "product_description": product_desc,
            "reason_for_recall": reason,
            "recall_date": recall_date,
            "distribution_pattern": dist_pattern,
            "classification": "CPSC Recall",
        })

    return jsonify(normalized)


# Serve React app for all non-API routes
@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_react(path):
    """Serve the React frontend."""
    if path and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, "index.html")


if __name__ == "__main__":
    app.run()
