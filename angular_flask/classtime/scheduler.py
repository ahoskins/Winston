class Scheduler(object):
    """
    Helper class which builds optimal schedules out of 
    class listings.

    Use static methods only - do not create instances of
    the class.
    """
    def __init__(self):
        pass

    @staticmethod
    def generate_schedule(classtimes):
        """
        Generates one good schedule based on the classtimes
        provided.

        classtimes should be in the following format:
        [
            {
                'course_name' : 'somename',
                'course_attr_a' : 'someattr',
                ...
                'day' : '<daystring>',
                'startTime' : '<time>',
                'endTime' : '<time>'
            },
            ...
            { 
                ...
            }
        ]

        Where <daystring> is a string containing the days the
          class is scheduled on:
          - UMTWRFS is Sunday...Saturday
          - eg 'MWF' or 'TR'

        And <time> is a time of format 'HH:MM XM'
          - eg '08:00 AM'
        """
        pass
