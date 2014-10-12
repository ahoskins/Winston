class AcademicDatabase(object):
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
        Search the database by a saved search name. This will look different for different
        institutions and database types, so use kwargs to define
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

    @staticmethod
    def build(institution_name):
        """
        Builds an object which implements AcademicDatabase, based
        on the config info stored in  
        `institutions/institution_name.json`

        Config info should be valid JSON which specifies
        all information required to create the type of 
        AcademicDatabase that the specified institution uses
        """
        import os
        import json
        import ldapdb

        config_file = os.path.join(os.path.dirname(__file__),
                                   'institutions/{}.json'
                                   .format(institution_name))
        with open(config_file, 'r') as f:
            config = json.loads(f.read())

        course_db = None
        db_type = config.get('type')
        if db_type == 'ldap':
            course_db = ldapdb.LDAPDatabase(server=config.get('server'),
                                            basedn=config.get('basedn'))
            for name, params in config.get('saved_searches').items():
                # python-ldap can't deal with unicode attribute names
                attrs = [attr.encode('ascii') for attr in params.get('attrs')]
                course_db.save_search(name=name,
                                      search_flt=params.get('search_flt'),
                                      attrs=attrs)

        return course_db


