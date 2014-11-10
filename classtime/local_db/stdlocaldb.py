
from angular_flask.logging import logging
logging = logging.getLogger(__name__) #pylint: disable=C0103

from angular_flask.core import db
from angular_flask.models import Term, Course, Section

MODEL_PRIMARY_KEY_MAP = {
    Term: 'term',
    Course: 'course',
    Section: 'class_'
}
def primary_key_from_model(model):
    return MODEL_PRIMARY_KEY_MAP.get(model, '')

class StandardLocalDatabase(object):
    """View of the central database which is restricted to a single institution
    """

    def __init__(self, institution):
        self._institution = institution
        self._model = None

        self.Term = Term
        self.Course = Course
        self.Section = Section

    def create(self):
        """Creates the central database, if it did not already exist
        """
        db.create_all()

    def terms(self):
        """Filters all requests to Term objects only. Returns self,
        so this method should be chained with other methods.

        :returns: self
        :rtype: StandardLocalDatabase
        """
        self._model = Term
        return self

    def courses(self):
        """Filters all requests to Course objects only. Returns self,
        so this method should be chained with other methods.

        :returns: self
        :rtype: StandardLocalDatabase
        """
        self._model = Course
        return self

    def sections(self):
        """Filters all requests to Section objects only. Should be
        the first call in every chained call to the StandardLocalDatabase.

        :returns: self
        :rtype: StandardLocalDatabase
        """
        self._model = Section
        return self

    def use(self, datatype):
        if 'term' in datatype:
            self.terms()
        elif 'course' in datatype:
            self.courses()
        elif 'section' in datatype:
            self.sections()
        else:
            logging.error('Cannot find datatype <{}>'.format(datatype))

    def exists(self, primary_key=None, datatype=None, **kwargs):
        """Checks whether an object exists with the given primary key. 
        If no primary key is given, checks if *any* object exists.

        :param str primary_key: the primary key to look for.
            eg for a Term, the primary key would be a 
            :ref:`4-digit term identifier <4-digit-term-identifier>`

        :returns: whether the object with that primary key exists
        :rtype: boolean

        Usage: 
        * local_db.terms().exists()
        * local_db.terms().exists('1490')
        * local_db.sections().exists()
        """
        if datatype is not None:
            self.use(datatype)

        if kwargs:
            return self.query().filter_by(**kwargs).first() is not None

        if primary_key is None:
            return self.query().first() is not None
        else:
            return self.get(primary_key) is not None

    def get(self, primary_key):
        filter_dict = {
            primary_key_from_model(self._model): primary_key
        }
        return self.query().filter_by(**filter_dict).first()

    def query(self):
        return self._model.query.filter_by(institution=self._institution)

    def add(self, model_dict):
        """Adds an 'add command' to the running transaction which will
        add a new model with attributes specified by dict 'data_dict'

        :param dict data_dict: dictionary of attributes to store in the
            object.
        """
        model_dict['institution'] = self._institution
        db.session.add(self._model(model_dict))

    def commit(self):
        """Commits the running transaction to the database

        If the commit fails, it will be rolled back to a safe state.
        """
        try:
            db.session.commit()
        except:
            db.session.rollback()
            raise
