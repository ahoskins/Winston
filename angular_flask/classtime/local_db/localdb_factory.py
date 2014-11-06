
from angular_flask.core import db

class LocalDatabaseFactory(object):
    @staticmethod
    def build(institution_name):
        """
        In the future, this factory will create a db
        object for the specified institution.

        For now, it just returns the singleton db.
        """
        return db
