"""The 9:16 output rule must hold whatever shape the render comes back in."""

import unittest

from helpers import dimensions, sample_photo

import config
import imaging


class PortraitOutputTest(unittest.TestCase):
    def test_every_input_shape_becomes_exactly_9x16(self):
        shapes = [(1600, 1200), (1200, 1600), (1000, 1000), (1024, 1536), (2400, 600), (300, 900)]
        for shape in shapes:
            with self.subTest(shape=shape):
                out = imaging.to_portrait_9x16(sample_photo(shape))
                self.assertEqual(dimensions(out), (config.OUTPUT_WIDTH, config.OUTPUT_HEIGHT))

    def test_target_is_nine_sixteenths(self):
        self.assertAlmostEqual(config.OUTPUT_WIDTH / config.OUTPUT_HEIGHT, 9 / 16, places=4)

    def test_a_native_9x16_render_is_not_cropped(self):
        # Same aspect in, same content out: only a resize should happen.
        out = imaging.to_portrait_9x16(sample_photo((1080, 1920)))
        self.assertEqual(dimensions(out), (1080, 1920))


class SourcePrepTest(unittest.TestCase):
    def test_large_photos_are_downscaled_but_keep_their_aspect(self):
        data, size = imaging.prepare_source(sample_photo((4000, 3000)), max_edge=1024)
        self.assertLessEqual(max(size), 1024)
        self.assertAlmostEqual(size[0] / size[1], 4 / 3, places=2)
        self.assertLessEqual(max(dimensions(data)), 1024)

    def test_small_photos_are_left_alone(self):
        _, size = imaging.prepare_source(sample_photo((640, 480)), max_edge=2048)
        self.assertEqual(size, (640, 480))

    def test_non_images_are_rejected(self):
        with self.assertRaises(imaging.ImageError):
            imaging.decode(b'this is not a photograph')


if __name__ == '__main__':
    unittest.main()
