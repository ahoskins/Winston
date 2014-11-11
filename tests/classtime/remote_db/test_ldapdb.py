
from __future__ import absolute_import

import os
import json

import classtime.remote_db as remote_db
from classtime.institutions import CONFIG_FOLDER_PATH as institution_config_path

class TestRemoteLDAPDatabase(object): # pylint: disable=R0904
    @classmethod
    def setup_class(cls):
        cls.institution_configs = list()
        cls.institutions = list()

        config_filenames = [os.path.join(institution_config_path, filename)
                            for filename in os.listdir(institution_config_path)]
        assert len(config_filenames) > len(['institutions.json', '__init__.py'])
        for config_filename in config_filenames:
            if 'json' not in config_filename:
                continue
            if 'institutions.json' in config_filename:
                continue
            with open(config_filename, 'r') as config:
                institution_config = json.loads(config.read())
            assert 'type' in institution_config
            if 'ldap' in institution_config.get('type'):
                cls.institution_configs.append(institution_config)

    @classmethod
    def teardown_class(cls):
        del cls.institutions

    def test_connect(self):
        self.institutions = list()
        for config in self.institution_configs:
            assert 'name' in config
            self.institutions.append(
                remote_db.RemoteDatabaseFactory.build(config.get('name')))
        for institution in self.institutions:
            assert_connect(institution)

    def test_disconnect(self):
        for institution in self.institutions:
            assert_disconnect(institution)

def test_search():
    ldapdbs = TestRemoteLDAPDatabase()
    ldapdbs.test_connect()

    for institution, config in zip(ldapdbs.institutions,
                                   ldapdbs.institution_configs):
        if 'saved_searches' not in config:
            continue
        assert isinstance(config.get('saved_searches'), dict)
        for search_name, search_config in config.get('saved_searches').items():
            print 'search: [{}->{}]'.format(config.get('name'), search_name)
            results = institution.search(search_name, limit=10)
            yield assert_valid_search_results, results, search_config
    ldapdbs.test_disconnect()

def assert_connect(institution):
    try:
        institution.connect()
    except:
        assert False
    else:
        assert True

def assert_disconnect(institution):
    try:
        institution.disconnect()
    except:
        assert False
    else:
        assert True

def assert_valid_search_results(search_results, search_config):
    for search_result in search_results:
        for attr, _ in search_result.items():
            assert attr in search_config['attrs']
