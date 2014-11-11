
import ldap
from ldap.controls import SimplePagedResultsControl

from classtime.remote_db import AbstractRemoteDatabase

class RemoteLDAPDatabase(AbstractRemoteDatabase):
    """Manages a connection to a remote LDAP database

    Implements AbstractRemoteDatabase
    """

    PAGE_SIZE = 300

    def __init__(self, server, basedn):
        self._client = ldap.initialize('ldap://{}'.format(server))
        self._basedn = basedn
        self._saved_searches = {}

    def connect(self):
        """Connect to the LDAP server
        """
        try:
            self._client.simple_bind_s()
        except ldap.LDAPError:
            raise

    def disconnect(self):
        """Disconnect from the LDAP server
        """
        self._client.unbind_s()

    def save_search(self, name, search_flt, attrs, limit=None, path_prefix=None):
        """Save a search for later, and name it

        :param str name: the name to save the search under
        :param str search_flt: LDAP search filter to filter records by
        :param list attrs: list of strings representing the attributes
            to get for each record
        :param int limit: max number of records to return. `None` means
            no limit, ie return all records.
        :path_prefix str path: LDAP directory path to prepend to the basedn
            provided on initialization. This parameter is usually passed
            at runtime.

        You can call this search later like `search(name='some_name')`
        """
        self._saved_searches[name] = {
            'search_flt' : search_flt,
            'attrs'      : attrs,
            'limit'      : limit,
            'path_prefix': path_prefix
            }

    def search(self, name, limit=None, term=None, course=None, class_=None):
        """Perform a saved search, and return the result

        :param str name: the name of the search
        :param str term: :ref:`term id <4-digit-term-identifier>`
            (optional)
        ::param str course: :ref:`course id <4-digit-term-identifier>`
            (optional)
        :param str class_: :ref:`section id <5-digit-section-identifier>`
            (optional)

        :returns: list of record dictionaries. Each element contains
            all attributes specified in `attrs` in :py:meth:`save_search`.

        :raises ValueError: if `name` is not a saved search
        """
        if name not in self._saved_searches.keys():
            raise ValueError('Saved search "{}" does not exist'.format(name))
        options = self._saved_searches.get(name)
        
        path_prefix = ''
        if limit is not None:
            options['limit'] = limit
        if class_ is not None:
            path_prefix += 'class={},'.format(class_)
        if course is not None:
            path_prefix += 'course={},'.format(course)
        if term is not None:
            path_prefix += 'term={},'.format(term)

        return self._search(search_flt=options.get('search_flt'),
                            attrs=options.get('attrs'),
                            limit=options.get('limit'),
                            path_prefix=path_prefix)

    def known_searches(self):
        return self._saved_searches.keys()

    def _search(self, search_flt, attrs, limit=None, path_prefix=None):
        """
        Query this academic calendar for records matching the search filter.
        Only looks one level deep in the tree to improve performance, so make
          sure you pass the dn that you want to look directly inside of as
          the `path` parameter.
        Returns a list of records. 
          Each record is a dictionary containing the requested attributes.

        search_flt -- LDAP-style search filter
        attrs -- attributes to be retrieved
        limit -- max number of records to return
        path -- extra LDAP dn: is prepended to this object's basedn
              ie the LDAP directory to look from relative to the root
        """
        if limit == None:
            limit = float('inf')
        
        if path_prefix == None:
            path = self._basedn
        else:
            path = '{}{}'.format(path_prefix, self._basedn)

        page_control = SimplePagedResultsControl(
            criticality=True, size=RemoteLDAPDatabase.PAGE_SIZE, cookie=''
        )

        results = []
        pages_retrieved = 0
        first_pass = True
        while pages_retrieved*RemoteLDAPDatabase.PAGE_SIZE < limit \
            and page_control.cookie \
            or first_pass:
            first_pass = False
            try:
                msgid = self._client.search_ext(path, ldap.SCOPE_ONELEVEL,
                    search_flt, attrlist=attrs,
                    serverctrls=[page_control])
            except:
                raise
            pages_retrieved += 1
            _, result_data, msgid, serverctrls = self._client.result3(msgid)
            page_control.cookie = serverctrls[0].cookie
            # LDAP returns a list of 2-element lists. The 0th element
            # is the dn, 1st element is the attribute dict
            result_data = [i[1] for i in result_data]
            results += extract_results_from_ldap_data(result_data)
        return results

def extract_results_from_ldap_data(data):
    """If you think you want to change this, you're probably
    looking in the wrong place. READ-ONLY"""
    # Each key's value is a single-element list.
    # This pulls the value out of the list.
    return [{k:v[0].decode('utf-8')
            for k, v in d.items()}
            for d in data]
