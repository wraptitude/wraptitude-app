import unittest

from legacy_sorting_compat import patch_source


class LegacySortingTests(unittest.TestCase):
    def test_insert_patch_ignores_commented_old_code_and_is_idempotent(self):
        source = '''#         "ID": unique_id,
def handler():
    item = {
        "ID": unique_id,
    }
'''
        patched = patch_source('wraptitudeAppInsertService', source)
        self.assertEqual(patched.count('"branchId": "markham"'), 1)
        self.assertIn('#         "ID": unique_id,', patched)
        self.assertEqual(patch_source('wraptitudeAppInsertService', patched), patched)

    def test_unexpected_source_is_not_modified(self):
        with self.assertRaises(ValueError):
            patch_source('wraptitudeAppPostQuote', 'def handler(): pass')


if __name__ == '__main__':
    unittest.main()
