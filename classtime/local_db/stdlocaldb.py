
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
    """A single institution's view of the local database
    """

    def __init__(self, institution):
        self._institution = institution
        self._model_stack = list()

        self.Term = Term
        self.Course = Course
        self.Section = Section

    def create(self):
        """Create the database, if it did not already exist
        """
        db.create_all()

    def push_datatype(self, datatype):
        if 'term' in datatype:
            self.push_terms()
        elif 'course' in datatype:
            self.push_courses()
        elif 'section' in datatype:
            self.push_sections()
        else:
            logging.error('Cannot find datatype <{}>'.format(datatype))
        return self

    def push_terms(self):
        """Filter all requests to Term objects only. Returns self,
        so this method should be chained with other methods.

        :returns: self
        :rtype: StandardLocalDatabase
        """
        self._model_stack.append(Term)
        return self

    def push_courses(self):
        """Filter all requests to Course objects only. Returns self,
        so this method should be chained with other methods.

        :returns: self
        :rtype: StandardLocalDatabase
        """
        self._model_stack.append(Course)
        return self

    def push_sections(self):
        """Filter all requests to Section objects only. Should be
        the first call in every chained call to the StandardLocalDatabase.

        :returns: self
        :rtype: StandardLocalDatabase
        """
        self._model_stack.append(Section)
        return self

    def pop_datatype(self):
        self._model_stack.pop()
        return self

    def cur_datatype_model(self):
        return self._model_stack[-1]

    def exists(self, datatype, primary_key=None, **kwargs):
        """Checks whether an object exists with the given primary key. 
        If no primary key is given, checks if *any* object exists.

        :param str primary_key: the primary key to look for.
            eg for a Term, the primary key would be a 
            :ref:`4-digit term identifier <4-digit-term-identifier>`

        :returns: whether the object with that primary key exists
        :rtype: boolean

        Usage: 
        * local_db.push_terms().exists().pop_datatype()
        * local_db.push_terms().exists('1490').pop_datatype()
        * local_db.push_sections().exists().pop_datatype()
        """
        self.push_datatype(datatype)

        if kwargs:
            retval = self.query().filter_by(**kwargs).first() is not None
        elif primary_key is None:
            retval = self.query().first() is not None
        else:
            retval = self.get(datatype, primary_key) is not None

        self.pop_datatype()
        return retval

    def get(self, datatype, primary_key):
        self.push_datatype(datatype)
        
        filter_dict = {
            primary_key_from_model(self.cur_datatype_model()): primary_key
        }
        retval = self.query().filter_by(**filter_dict).first()

        self.pop_datatype()
        return retval

    def query(self):
        return self.cur_datatype_model() \
                   .query \
                   .filter_by(institution=self._institution)

    def add(self, datatype, model_dict):
        """Adds an 'add command' to the running transaction which will
        add a new model with attributes specified by dict 'data_dict'

        :param dict data_dict: dictionary of attributes to store in the
            object.
        """
        self.push_datatype(datatype)

        model_dict['institution'] = self._institution
        db.session.add(self.cur_datatype_model()(model_dict))

        self.pop_datatype()

    def commit(self):
        """Commits the running transaction to the database

        If the commit fails, it will be rolled back to a safe state.
        """
        try:
            db.session.commit()
        except:
            db.session.rollback()
            raise
