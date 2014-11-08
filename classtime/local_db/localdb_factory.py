
from .stdlocaldb import StandardLocalDatabase

class LocalDatabaseFactory(object):
    @staticmethod
    def build(institution):
        """Build a local database view for the given
        institution
        """
        return StandardLocalDatabase(institution)
