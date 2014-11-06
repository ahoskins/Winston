class AbstractRemoteDatabase(object):
    """
    Abstract base class which all Database Connections should
    inherit from.

    Defines methods which all connections should implement.
    """

    def connect(self, **kwargs):
        """Connect to the course info database
        """
        raise NotImplementedError()

    def disconnect(self, **kwargs):
        """Disconnect from the course info database
        """
        raise NotImplementedError()

    def save_search(self, name, **kwargs):
        """Save a search by name

        :param kwargs: parameters for the search.
            eg for LDAP servers, kwargs holds:
            * search_flt
            * attrs
            * limit
            * path

        Typical usage: parameters are defined in a config file,
        and ``save_search`` is used to save them for later usage
        """
        raise NotImplementedError()

    def search(self, name, **kwargs):
        """Search the database using a saved search

        Can also take kwargs as a method of passing options
        which change at runtime
        """
        raise NotImplementedError()

    def _search(self, **kwargs):
        """Internal search method - this actually *does* the searching.

        :py:func:`search` should call this method, passing
        in the proper kwargs
        """
        raise NotImplementedError()
