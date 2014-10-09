import os
from angular_flask import app

def runserver():
    port = int(os.environ.get('PORT', 5000))
    app.run(port=port)

if __name__ == '__main__':
    runserver()
