
import os
import json
from .ldapdb import RemoteLDAPDatabase

class RemoteDatabaseFactory(object):
    @staticmethod
    def build(institution):
        """
        Builds an object which implements AbstractRemoteDatabase, based
        on config info stored in  
        `classtime/institutions/<institution>.json`

        Config info should be valid JSON which specifies
        all information required to create the type of 
        AbstractRemoteDatabase that the specified institution uses
        """
        config_file = os.path.join(os.path.dirname(__file__), '..', # '..' -> up one level
            'institutions/{}.json'.format(institution))
        with open(config_file, 'r') as config:
            config = json.loads(config.read())

        course_db = None
        db_type = config.get('type')
        if db_type == 'ldap':
            course_db = RemoteLDAPDatabase(server=config.get('server'),
                                           basedn=config.get('basedn'))
            for name, params in config.get('saved_searches').items():
                # python-ldap can't deal with unicode attribute names
                attrs = [attr.encode('ascii') for attr in params.get('attrs')]
                course_db.save_search(name=name,
                                      search_flt=params.get('search_flt'),
                                      attrs=attrs)

        return course_db
