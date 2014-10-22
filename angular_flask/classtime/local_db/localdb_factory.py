
from angular_flask.classtime.local_db import db

class LocalDatabaseFactory(object):
    @staticmethod
    def build(institution_name):
        """
        In the future, this factory will create a db
        object for the specified institution.

        For now, it just returns the db.
        """
        return db
