
import hashlib

from angular_flask.core import db

SCHEDULE_HASH_LENGTH = 30
def calculate_schedule_hash(section_ids, institution, term):
    md5 = hashlib.md5()
    for section_id in section_ids:
        md5.update(section_id)
    md5.update(institution)
    md5.update(term)
    return md5.hexdigest()[:SCHEDULE_HASH_LENGTH]

# Coordinates many-to-many relationship between schedules and sections
sections = db.Table('sections',
    db.Column('section_id',
        db.String(5), db.ForeignKey('section.class_')),
    db.Column('schedule_id',
        db.String(SCHEDULE_HASH_LENGTH), db.ForeignKey('schedule.hash_id'))
)

class Schedule(db.Model):
    institution = db.Column(db.String(30))
    term = db.Column(db.String(4), db.ForeignKey('term.term'))
    sections = db.relationship('Section', secondary=sections)
    hash_id = db.Column(db.String(SCHEDULE_HASH_LENGTH), primary_key=True)

    asString = db.Column(db.String(30))

    def __init__(self, jsonobj):
        for key, value in jsonobj.items():
            setattr(self, key, value)
        self.asString = '<{}..> in <term={}> at <{}>'.format(
            self.hash_id[:6], self.term, self.institution)

    def __repr__(self):
        return '<Schedule: ({asString}) @ {institution}>'.format(
                asString=self.asString,
                institution=self.institution)
