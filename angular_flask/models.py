from datetime import datetime

from angular_flask.core import db
from angular_flask import app

class Term(db.Model):
    term = db.Column(db.Integer, primary_key=True, unique=True)
    termTitle = db.Column(db.String(30))
    startDate = db.Column(db.String(30))
    endDate = db.Column(db.String(30))

    courses = db.relationship('Course')

    def __init__(self, jsonobj):
        for key, value in jsonobj.items():
            self.__setattr__(key, value)

class Course(db.Model):
    term = db.Column(db.Integer, db.ForeignKey('term.term'))
    course = db.Column(db.Integer, primary_key=True, unique=True)
    subject = db.Column(db.String(10))
    subjectTitle = db.Column(db.String(30))
    catalog = db.Column(db.Integer)
    courseTitle = db.Column(db.String(30))
    courseDescription = db.Column(db.String(500))
    facultyCode = db.Column(db.String(2))
    faculty = db.Column(db.String(30))
    departmentCode = db.Column(db.String(10))
    department = db.Column(db.String(30))
    career = db.Column(db.String(10))
    units = db.Column(db.Float)
    asString = db.Column(db.String(30))

    sections = db.relationship('Section')

    def __init__(self, jsonobj):
        for key, value in jsonobj.items():
            self.__setattr__(key, value)

class Section(db.Model):
    term = db.Column(db.Integer)
    course = db.Column(db.Integer, db.ForeignKey('course.course'))
    class_ = db.Column(db.Integer, primary_key=True, unique=True)
    section = db.Column(db.String(10))
    component = db.Column(db.String(10))
    classType = db.Column(db.String(1))
    classStatus = db.Column(db.String(1))
    enrollStatus = db.Column(db.String(1))
    capacity = db.Column(db.Integer)

    session = db.Column(db.String(30))
    campus = db.Column(db.String(10))
    # autoEnroll = db.relationship('Section')
    # ("frequently null") classTopic = ...
    classNotes = db.Column(db.String(80))
    # consent
    # gradingBasis
    # instructionMode
    # classUrl
    instructorUid = db.Column(db.String(30))
    # examStatus
    # examDate
    # examStartTime
    # examEndTime
    # examLocation
    asString = db.String(db.String(80))

    day = db.Column(db.String(10))
    startTime = db.Column(db.String(30))
    endTime = db.Column(db.String(30))
    location = db.Column(db.String(30))
