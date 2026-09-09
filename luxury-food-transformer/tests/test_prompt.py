"""The brief must keep the rules the spec calls non-negotiable."""

import re
import unittest

import helpers  # noqa: F401 - path setup

import prompt


class PromptTest(unittest.TestCase):
    def setUp(self):
        # Source line wrapping is cosmetic; compare on a single flat line.
        self.brief = re.sub(r'\s+', ' ', prompt.build_prompt().lower())

    def test_preservation_rules_present(self):
        for phrase in ['original dish', 'original ingredients', 'original portion size',
                       'original food composition', 'original food identity']:
            self.assertIn(phrase, self.brief)

    def test_forbids_swapping_the_dish_and_inventing_ingredients(self):
        self.assertIn('do not replace the meal with a different dish', self.brief)
        self.assertIn('do not invent ingredients', self.brief)

    def test_silverware_rule_present(self):
        self.assertIn('do not add silverware if none exists', self.brief)

    def test_requests_portrait_output(self):
        self.assertIn('9:16', self.brief)
        self.assertIn('fully fill the frame', self.brief)

    def test_engagement_tip_is_verbatim(self):
        self.assertEqual(
            prompt.ENGAGEMENT_TIP,
            '\U0001f4a1 Want even more engagement? Turn this food photo into a cinematic AI '
            'video with realistic steam, camera movement, lighting effects, and professional '
            'restaurant-style motion for TikTok, Reels, Shorts, and ads.')


if __name__ == '__main__':
    unittest.main()
