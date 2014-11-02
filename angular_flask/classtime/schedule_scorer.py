
import schedule as sched_module

class ScheduleScorer(object):

    def __init__(self):
        self.schedule = None
        self.score_dict = None
        self.weights = {
            'no-marathons': 1,
            'nine-to-five': 50,
            'start-time': 1
        }

    def get_scores(self):
        if self.schedule is None:
            return None
        self.score_dict.update({
            'overall': sum(self.score_dict.values())
        })
        return self.score_dict

    def calculate_scores(self, schedule):
        self.schedule = schedule
        self.score_dict = {
            'no-marathons': self.weights.get('no-marathons') * self._no_marathons(),
            'nine-to-five': self.weights.get('nine-to-five') * self._nine_to_five(),
            'start-time': self.weights.get('start-time') * self._start_time() 
        }

    def _no_marathons(self):
        """
        A schedule is better if it has a more even distribution
        of breaks throughout the day, and also if it squishes sections
        together so as to not waste time. Constantly alternating between
        class and break is bad. Having more than 3 hours in a row is bad.
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
        #               0 1 2 3 4 5 6 7 8 9 A B C 1 2 3 4 5 6 7 8 9 A B 
        bad_zone = int('111111111111111111000000000000000011111111111111', 2)
        num_outside = 0
        for day_bitmap in self.schedule.conflict_bitmap:
            in_bad_zone = day_bitmap & bad_zone
            num_outside += bin(in_bad_zone).count('1')
        score = -1*num_outside
        return 1 * 50 * score

    def _start_time(self):
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
