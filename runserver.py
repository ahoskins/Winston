import os
import sys
from angular_flask import app

def is_main_process():
    return os.environ.get('WERKZEUG_RUN_MAIN')

def runserver():
    if is_main_process() and len(sys.argv) <= 1:
        from classtime import AcademicCalendar
        for institution in ['ualberta']:
            AcademicCalendar.idly_fill(institution)

    port = int(os.environ.get('PORT', 5000))
    app.run(port=port)

if __name__ == '__main__':
    runserver()
