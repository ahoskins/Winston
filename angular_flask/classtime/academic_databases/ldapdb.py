import sys

import ldap
from ldap.controls import SimplePagedResultsControl

import abstract_academicdb

class LDAPDatabase(abstract_academicdb.AcademicDatabase):
    """
    Implements the AcademicDatabase abstract base class

    Connects to an LDAP server
    """
    def __init__(self, server, basedn):
        self._client = ldap.initialize('ldap://{}'.format(server))
        self._basedn = basedn
        self._saved_searches = {}

    def connect(self):
        try:
            self._client.simple_bind_s()
        except ldap.LDAPError:
            raise

    def disconnect(self):
        self._client.unbind_s()

    def save_search(self, name, search_flt, attrs, limit=None, path=None):
        """
        Name a common search. Store the search_flt and attribute
        list for later.  
        You can call this search later with search(name='search_name').
        """
        self._saved_searches[name] = {
            'search_flt' : search_flt,
            'attrs'      : attrs,
            'limit'      : limit,
            'path'       : path
            }

    def search(self, name, **kwargs):
        if name not in self._saved_searches.keys():
            raise ValueError('The saved search "{}" does not exist'.format(name))
        options = self._saved_searches[name]
        
        if kwargs:
            for key, val in kwargs.items():
                options[key] = val
        return self._search(search_flt=options.get('search_flt'),
                            attrs=options.get('attrs'),
                            limit=options.get('limit'),
                            path=options.get('path'))

    def _search(self, search_flt, attrs, limit=None, path=None):
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
        
        if path == None:
            path = self._basedn
        else:
            path = '{},{}'.format(path, self._basedn)

        PAGE_SIZE = 300
        page_control = SimplePagedResultsControl(
            criticality=True, size=PAGE_SIZE, cookie=''
        )

        results = []
        pages_retrieved = 0
        first_pass = True
        while pages_retrieved*PAGE_SIZE < limit and page_control.cookie \
              or first_pass:
            first_pass = False
            try:
                msgid = self._client.search_ext(path, ldap.SCOPE_ONELEVEL,
                                                search_flt, attrlist=attrs,
                                                serverctrls=[page_control])
            except:
                raise
            pages_retrieved += 1
            _, data, msgid, serverctrls = self._client.result3(msgid)
            page_control.cookie = serverctrls[0].cookie
            # LDAP returns a list of 2-element lists. The 0th element
            # is the dn, 1st element is the attribute dict
            dictlist = [i[1] for i in data]
            # Each key's value is a single-element list.
            # This pulls the value out of the list.
            results += [{k:v[0].decode('utf-8') for k, v in d.items()} for d in dictlist]
        return results
