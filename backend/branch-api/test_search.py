"""Branch-scoped contact search, including matches beyond the first page."""
import unittest
from unittest.mock import MagicMock, patch

from test_orders import app, event


class ContactSearchTests(unittest.TestCase):
    def test_partial_case_insensitive_names_emails_and_formatted_phones(self):
        item = {'name': 'Jane   Smith', 'email': 'Jane@Example.com', 'phone': '+1 (416) 555-0123'}
        for query in ['SMITH', ' jane smith ', 'JANE@EXAMPLE', '4165550123', '(416) 555-0123', '555-0123']:
            with self.subTest(query=query):
                search = app.admin_search_term(event(search=query))
                self.assertTrue(app.matches_contact_search(item, search))
        for query in ['unrelated', '+ () -', 'wrong416', '999999']:
            self.assertFalse(app.matches_contact_search(item, query))
        self.assertTrue(app.matches_contact_search({}, ''))
        self.assertFalse(app.matches_contact_search({'phone': None}, '416'))

    def test_orders_search_customer_contacts_and_keep_chronological_cursor(self):
        table = MagicMock()
        key = {'ID': 'first', 'branchId': 'vaughan', 'chronologicalKey': '2026-09-28#first'}
        table.query.side_effect = [
            {'Items': [{'ID': 'first', 'branchId': 'vaughan', 'userID': 'a'}], 'LastEvaluatedKey': key},
            {'Items': [{'ID': 'second', 'branchId': 'vaughan', 'userID': 'b'}]},
        ]
        users = {'a': {'name': 'Other', 'phone_number': '999'},
                 'b': {'name': 'Jane', 'phone_number': '+1 (416) 555-0123'}}
        with patch.object(app, 'SERVICE_TABLE', table), patch.object(app, 'user_by_id', side_effect=users.get):
            first = app.route(event(sort='newest', search='4165550123', pageSize='1'))
            self.assertEqual(first['items'], [])
            self.assertTrue(first['nextCursor'])
            second = app.route(event(sort='newest', search='4165550123', pageSize='1', cursor=first['nextCursor']))
        self.assertEqual([item['ID'] for item in second['items']], ['second'])
        self.assertEqual(second['items'][0]['customerPhone'], '+1 (416) 555-0123')
        self.assertEqual(table.query.call_args.kwargs['ExclusiveStartKey'], key)
        self.assertFalse(table.query.call_args.kwargs['ScanIndexForward'])
        self.assertIsNone(second['nextCursor'])

    def test_quote_search_filters_before_signing_only_matching_images(self):
        table = MagicMock()
        matching = {'ID': 'matching', 'branchId': 'vaughan', 'name': 'Jane Smith'}
        table.query.return_value = {'Items': [
            {'ID': 'other', 'branchId': 'vaughan', 'name': 'Other'}, matching,
        ]}
        with patch.object(app, 'QUOTE_TABLE', table), patch.object(app, 'sign_item_images', side_effect=lambda item, *_: item) as sign:
            result = app.route(event(path='/admin/quotes', pageSize='20', search='sMiTh'))
        self.assertEqual(result['items'], [matching])
        sign.assert_called_once_with(matching, app.QUOTE_BUCKET, app.LEGACY_QUOTE_BUCKET, 'quotes')

    def test_search_validates_branch_and_length_before_reading(self):
        with patch.object(app, 'SERVICE_TABLE') as services, patch.object(app, 'QUOTE_TABLE') as quotes:
            for path in ['/admin/services', '/admin/quotes']:
                self.assertEqual(app.lambda_handler(event(branch='markham', path=path, search='Jane', sort='newest', pageSize='20'), None)['statusCode'], 403)
                self.assertEqual(app.lambda_handler(event(path=path, search='x' * 101, sort='newest', pageSize='20'), None)['statusCode'], 400)
            services.query.assert_not_called()
            quotes.query.assert_not_called()


if __name__ == '__main__':
    unittest.main()
