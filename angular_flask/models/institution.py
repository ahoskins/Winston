
from angular_flask.core import db

class Institution(db.Model):
    institution_name = db.Column(db.String(30), primary_key=True, unique=True)
    terms = db.relationship('Term')

    def __init__(self, jsonobj):
        for key, value in jsonobj.items():
            self.__setattr__(key, value)

    def __repr__(self):
        return '<Institution: "{}">'.format(
                self.institution_name)
