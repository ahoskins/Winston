import os
from angular_flask import app

def is_reloader_process():
    return not os.environ.get('WERKZEUG_RUN_MAIN')

def runserver():
    if not is_reloader_process():
        from classtime import AcademicCalendar
        for institution in ['ualberta']:
            AcademicCalendar.idly_fill(institution)

    port = int(os.environ.get('PORT', 5000))
    app.run(port=port)

if __name__ == '__main__':
    runserver()
