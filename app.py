import os
from functools import lru_cache

import pandas as pd
import numpy as np

import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine
from sqlalchemy import or_

from flask import Flask, jsonify, render_template
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)


#################################################
# Database Setup
#################################################

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///db/food.sqlite"
db = SQLAlchemy(app)

# reflect an existing database into a new model
Base = automap_base()
# reflect the tables
Base.prepare(db.engine, reflect=True)

# Save references to each table
food_db = Base.classes.Food_file

# db/food.sqlite is a read-only snapshot, so each URL's JSON never changes
# while the process runs; bound the cache so arbitrary URLs cannot grow it.
DATA_CACHE_SIZE = 32

@app.route("/")
def index():
    """Return the homepage."""
    return render_template("index.html")

@app.route("/past_recalls/")
def past_recalls():
    """Return the homepage."""
    return render_template("past_recalls.html")

@app.route("/current_recalls/")
def current_recalls():
    """Return the homepage."""
    return render_template("current_recalls.html")

@app.route("/recalls_by_state/")
def recalls_by_state():
    """Return the homepage."""
    return render_template("recalls_by_state.html")

@app.route("/data")
@lru_cache(maxsize=1)
def allData():
    """Return all data."""

    # Use Pandas to perform the sql query
    stmt = db.session.query(food_db).statement
    df = pd.read_sql_query(stmt, db.session.bind)

    data = df.to_json(orient='records')
    # return data in json objects
    return data

@app.route("/data/<start_date>/<end_date>")
@lru_cache(maxsize=DATA_CACHE_SIZE)
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
    

    df = pd.read_sql_query(start_end_recalls, db.session.bind)
    recalls_list = df.to_json(orient='records')
    
    return recalls_list

@app.route("/data/<class1>/<class2>/<class3>/<start_date>/<end_date>")
@lru_cache(maxsize=DATA_CACHE_SIZE)
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
    
        df = pd.read_sql_query(start_end_class_recalls, db.session.bind)
        recalls_class_list = df.to_json(orient='records')
        
        return recalls_class_list

    elif class1 == 'true' and class2 == 'true':
        start_end_class_recalls = db.session.query(food_db).\
            filter(food_db.recall_date >= start_date).\
            filter(food_db.recall_date <= end_date).\
            filter(or_(food_db.classification == "Class I", food_db.classification == "Class II")).\
            statement
    
        df = pd.read_sql_query(start_end_class_recalls, db.session.bind)
        recalls_class_list = df.to_json(orient='records')
        
        return recalls_class_list

    elif class1 == 'true' and class3 == 'true':
        start_end_class_recalls = db.session.query(food_db).\
            filter(food_db.recall_date >= start_date).\
            filter(food_db.recall_date <= end_date).\
            filter(or_(food_db.classification == "Class I", food_db.classification == "Class III")).\
            statement
    
        df = pd.read_sql_query(start_end_class_recalls, db.session.bind)
        recalls_class_list = df.to_json(orient='records')
        
        return recalls_class_list
    
    elif class2 == 'true' and class3 == 'true':
        start_end_class_recalls = db.session.query(food_db).\
            filter(food_db.recall_date >= start_date).\
            filter(food_db.recall_date <= end_date).\
            filter(or_(food_db.classification == "Class II", food_db.classification == "Class III")).\
            statement
    
        df = pd.read_sql_query(start_end_class_recalls, db.session.bind)
        recalls_class_list = df.to_json(orient='records')
        
        return recalls_class_list

    elif class1 == 'true':
        start_end_class_recalls = db.session.query(food_db).\
            filter(food_db.recall_date >= start_date).\
            filter(food_db.recall_date <= end_date).\
            filter(food_db.classification == "Class I").\
            statement
    
        df = pd.read_sql_query(start_end_class_recalls, db.session.bind)
        recalls_class_list = df.to_json(orient='records')
        
        return recalls_class_list

    elif class2 == 'true':
        start_end_class_recalls = db.session.query(food_db).\
            filter(food_db.recall_date >= start_date).\
            filter(food_db.recall_date <= end_date).\
            filter(food_db.classification == "Class II").\
            statement
    
        df = pd.read_sql_query(start_end_class_recalls, db.session.bind)
        recalls_class_list = df.to_json(orient='records')
        
        return recalls_class_list

    elif class3 == 'true':
        start_end_class_recalls = db.session.query(food_db).\
            filter(food_db.recall_date >= start_date).\
            filter(food_db.recall_date <= end_date).\
            filter(food_db.classification == "Class III").\
            statement
    
        df = pd.read_sql_query(start_end_class_recalls, db.session.bind)
        recalls_class_list = df.to_json(orient='records')
        
        return recalls_class_list

    else:
        # Use Pandas to perform the sql query
        start_end_class_recalls = db.session.query(food_db).\
            filter(food_db.recall_date >= start_date).\
            filter(food_db.recall_date <= end_date).\
            statement

        df = pd.read_sql_query(start_end_class_recalls, db.session.bind)
        recalls_class_list = df.to_json(orient='records')
        
        return recalls_class_list

if __name__ == "__main__":
    app.run()