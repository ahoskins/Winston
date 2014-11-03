
import schedule as sched_module

class ScheduleScorer(object):

    def __init__(self):
        self.schedule = None
        self.score_values = dict()
        self.score_info = {
            'no-marathons': {
                'weight': -100,
                'function': self._no_marathons
            },
            'nine-to-five': {
                'weight': 0,
                'function': self._nine_to_five
            },
            'start-early': {
                'weight': 0,
                'function': self._start_early
            }
        }

    def read(self, name='all'):
        if name == 'all':
            return self.score_values
        else:
            return self.score_values.get(name)

    def score(self, schedule):
        """Score a schedule using each scoring function in self.score_info
        """
        self.schedule = schedule
        for name in self.score_info.keys():
            self.score_values.update({
                name: self._weight(name) * self._score(name)
            })
        self.score_values.update({
            'overall': sum(self.score_values.values())
        })

    def _weight(self, name):
        """Return the weight of a particular scoring function
        """
        info = self.score_info.get(name)
        if info is not None:
            return info.get('weight', 1)
        return None

    def _score(self, name):
        """Run a particular scoring function, and return its result
        """
        info = self.score_info.get(name)
        if info is not None:
            return info.get('function', lambda: 0)()
        else:
            return 0

    def _no_marathons(self):
        """
        + weight: spread out. Less than 3hrs of consecutive classes
        0 weight: -no effect-
        - weight: clumped up. More than 3hrs of consecutive classes
        """
        max_consecutive_blocks = 3*2 # 3 hours x 2 blocks/hour
        total_marathon_blocks = 0
        for day_bitmap in self.schedule.conflict_bitmap[:]:
            consecutive_blocks = 0
            while day_bitmap:
                day_bitmap &= (day_bitmap << 1)
                consecutive_blocks += 1
            marathon_blocks = consecutive_blocks - max_consecutive_blocks
            if marathon_blocks > 0:
                total_marathon_blocks += marathon_blocks
        score = -1*total_marathon_blocks
        return 5 * score

    def _nine_to_five(self):
        """
        + weight: classes inside 9a-5p
        0 weight: -no effect-
        - weight: classes outside 9a-5p
        """
        #               0 1 2 3 4 5 6 7 8 9 A B C 1 2 3 4 5 6 7 8 9 A B 
        bad_zone = int('111111111111111111000000000000000011111111111111', 2)
        num_outside = 0
        for day_bitmap in self.schedule.conflict_bitmap:
            in_bad_zone = day_bitmap & bad_zone
            num_outside += bin(in_bad_zone).count('1')
        score = -1*num_outside
        return 1 * 50 * score

    def _start_early(self):
        """
        + weight: start early
        0 weight: -no effect-
        - weight: start late
        """
        score = 0
        early_block = 8*2
        ideal_start_bitmap = (1 << (sched_module.Schedule.NUM_BLOCKS - early_block -1))
        for day_bitmap in self.schedule.conflict_bitmap[:]:
            if day_bitmap == 0:
                continue
            while day_bitmap < ideal_start_bitmap:
                day_bitmap <<= 1
                score -= 1
        return 1 * score
