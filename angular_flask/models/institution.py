
from angular_flask.core import db

class Institution(db.Model):
    institution = db.Column(db.String(30), primary_key=True, unique=True)
    name = db.Column(db.String(100))

    def __init__(self, jsonobj):
        for key, value in jsonobj.items():
            self.__setattr__(key, value)

    def __repr__(self):
        return '<Institution: {institution} ({name})>'.format(
                institution=self.institution,
                name=self.name)
        