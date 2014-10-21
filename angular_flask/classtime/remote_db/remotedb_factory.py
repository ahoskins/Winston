
import os
import json
import ldapdb

class RemoteDatabaseFactory(object):
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
