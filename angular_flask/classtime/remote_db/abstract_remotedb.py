class AbstractRemoteDatabase(object):
    """
    Abstract base class which all Database Connections should
    inherit from.

    Defines methods which all connections should implement.

    AcademicCalendar should be initialized with an instance
    of a class which implements these methods - that is,
    AcademicCalendar should not need to know what type
    of database it is getting course information from.
    """

    def connect(self, **kwargs):
        """
        Connect to the course info database
        To be called during initialization
        """
        raise NotImplementedError()

    def disconnect(self, **kwargs):
        """
        Disconnect from the course info database.
        To be called on cleanup
        """
        raise NotImplementedError()

    def save_search(self, name, **kwargs):
        """
        Save a search by name, such that it may be used many times
        later. Also improves semantics.

        kwargs holds the parameters for the search
          eg for LDAP servers, kwargs holds search_flt, attrs, limit, and path

        These should be:
        1) Defined in a config file,
        2) Loaded into the database object at runtime
        """
        raise NotImplementedError()

    def search(self, name, **kwargs):
        """
        Search the database by a saved search name. This will look different for
        different institutions and database types, so use kwargs to define
        parameters to the search

        Can also take kwargs as a method of passing search-time variable
        parameters.

        Is a convenience wrapper for _search()
        """
        raise NotImplementedError()

    def _search(self, **kwargs):
        """
        Internal search method - this actually *does* the searching.

        search(name) should call this method with the proper parameters
        as the specific database connection calls for.
        """
        raise NotImplementedError()
