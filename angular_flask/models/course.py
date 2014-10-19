
from angular_flask.core import db

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

    def __repr__(self):
        return '<Course: #{num} ({name})'.format(
                num=self.course,
                name=self.asString)