
from __future__ import absolute_import

import json

from angular_flask import app

class TestAPI(object):

    @classmethod
    def setup_class(cls):
        app.config['TESTING'] = True
        cls.client = app.test_client()

    @classmethod
    def teardown_class(cls):
        pass

    def setup(self):
        pass

    def teardown(self):
        pass

    def get(self, endpoint, query=None):
        if query is not None:
            querystring = "?q=" + json.dumps(query.get('q'))
            assert querystring.count('q=') == 1
            endpoint += querystring
        return json.loads(self.client.get(endpoint).data)

    def test_institutions(self):
        response = self.get('/api/institutions')
        assert_valid_response(response)

    def test_terms(self):
        response = self.get('/api/terms')
        assert_valid_response(response)

    def test_terms_with_query(self):
        query = {
            "q": {
                "filters": [
                    {
                        "name": "institution",
                        "op": "equals",
                        "val": "ualberta"
                    }
                ]
            }
        }
        response = self.get('/api/terms', query)
        assert_valid_response(response)

    def test_courses(self):
        response = self.get('/api/courses')
        assert_valid_response(response)

    def test_courses_with_query(self):
        filters = [
            {
                "name": "institution",
                "op": "equals",
                "val": "ualberta"
            },
            {
                "name": "term",
                "op": "equals",
                "val": "1490"
            }
        ]
        query = {
            "q": {
                  "filters": filters
            }
        }
        response = self.get('/api/courses', query)
        assert_valid_response(response)

    def test_courses_min(self):
        response = self.get('/api/courses-min')
        assert_valid_response(response)

    def test_courses_min_with_query(self):
        filters = [
            {
                "name": "institution",
                "op": "equals",
                "val": "ualberta"
            },
            {
                "name": "term",
                "op": "equals",
                "val": "1490"
            }
        ]
        query = {
            "q": {
                  "filters": filters
            }
        }
        response = self.get('/api/courses-min', query)
        assert_valid_response(response)

    def test_generate_schedules(self):
        queries = [
            {
                "q": {  # Random courses
                        "institution": "ualberta",
                        "term": "1490",
                        "courses": ["001343",
                                    "009019"],
                        "busy-times": [{
                            "day": "MWF",
                            "startTime": "04:00 PM",
                            "endTime": "06:00 PM"
                            }
                        ]
                }
            },
            {
                "q": {  # 1st year engineering 2014 Fall Term
                        "institution": "ualberta",
                        "term": "1490",
                        "courses": ["001343",
                                    "004093",
                                    "004096",
                                    "006768",
                                    "009019"],
                        "busy-times": []
                }
            },
            {
                "q": {  # 3rd year CompE 2014 Fall Term
                        "institution": "ualberta",
                        "term": "1490",
                        "courses": ["010344",
                                    "105014",
                                    "105006",
                                    "105471",
                                    "006708",
                                    "010812"]
                }
            },
            {
                "q": {  # 2nd year MecE Fall Term 2014
                        "institution": "ualberta",
                        "term": "1490",
                        "courses": ["006973", # MEC E 260
                                    "006790", # MATH 209
                                    "006974", # MEC E 265
                                    "098325", # MEC E 230
                                    "001607", # CIV E 270
                                    "004104", # ENGG 299
                                    ]
                }
            },
            {
                "q": {  # 1st year engineering Fall Term 2014
                        "institution": "ualberta",
                        "term": "1490",
                        "courses": ["001343",
                                    "004093",
                                    "004096",
                                    "006768",
                                    "009019"],
                        "busy-times": [
                            {
                                "day": "MWF",
                                "startTime": "07:00 AM",
                                "endTime": "09:50 AM"
                            },
                            {
                                "day": "TR",
                                "startTime": "04:00 PM",
                                "endTime": "10:00 PM"
                            }
                        ]
                }
            }
        ]
        for query in queries:
            response = self.get('/api/generate-schedules', query)
            assert_valid_response(response)
            schedules = response.get('objects')
            yield assert_valid_schedules, schedules, query

def assert_valid_response(response):
    assert response.get('num_results') is not None
    assert response.get('objects') is not None
    assert response.get('page') is not None
    assert response.get('total_pages') is not None

def assert_valid_schedules(schedules, query):
    for schedule in schedules:
        assert 'sections' in schedule
        sections = schedule.get('sections')
        assert len(sections) > 0
        for section in sections:
            assert section.get('institution') == query['q']['institution']
            assert section.get('term') == query['q']['term']

            assert section.get('asString') is not None
            assert section.get('course') in query['q']['courses']
            assert section.get('component') is not None
