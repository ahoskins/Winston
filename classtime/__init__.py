
import os
import json

from angular_flask.logging import logging
logging = logging.getLogger(__name__) # pylint: disable=C0103

from angular_flask.core import db
from angular_flask.models import Institution

from .academic_calendar import AcademicCalendar

def get_calendar(_institution):
    return AcademicCalendar(_institution)

cal = get_calendar('ualberta')
