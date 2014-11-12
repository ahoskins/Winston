
class AbstractRemoteDatabase(object):
    """
    Abstract base class which all remote database connections must
    inherit from

    Defines the public interface of any implementation
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

    def search(self, name, limit=None, **kwargs):
        """Search the database using a saved search

        Is a wrapper for _search()

        :param str name: name of the saved search

        """
        raise NotImplementedError()

    def known_searches(self):
        """Return names of known searches

        :returns: list of names of searches currently saved
        :rtype: list of strings
        """
        raise NotImplementedError()


    def _search(self, limit=None, *args, **kwargs):
        """Lowest level search method

        :py:func:`search` should wrap this method in order
        to pass in the proper arguments
        """
        raise NotImplementedError()
