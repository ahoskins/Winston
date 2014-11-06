
from .stdlocaldb import StandardLocalDatabase

class LocalDatabaseFactory(object):
    @staticmethod
    def build(institution_name):
        """Build a local database view for the given
        institution
        """
        return StandardLocalDatabase(institution_name)
