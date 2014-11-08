
from angular_flask.core import db

class Term(db.Model):
    institution = db.Column(db.String(30))
    term = db.Column(db.String(4), primary_key=True, unique=True)
    termTitle = db.Column(db.String(30))
    startDate = db.Column(db.String(30))
    endDate = db.Column(db.String(30))

    courses = db.relationship('Course')

    def __init__(self, jsonobj):
        for key, value in jsonobj.items():
            self.__setattr__(key, value)

    def __repr__(self):
        return '<Term #{num} ({name}) @ {institution}>'.format(
                num=self.term,
                name=self.termTitle,
                institution=self.institution)
