"""Build compatibility packages for legacy writers without changing their API.

Old mobile releases still submit Markham quotes through the legacy endpoint.
Those writes must receive index keys too. This module only prepares zip bytes;
deployment/backups require separate, explicit operational steps.
"""
import io
from pathlib import Path
import zipfile

FUNCTIONS = ('wraptitudeAppPostQuote', 'wraptitudeAppInsertService', 'wraptitudeAppEditService')


def patch_source(function_name, source):
    if 'from sort_keys import chronological_key' in source:
        return source
    if function_name == 'wraptitudeAppPostQuote':
        old = "\n            'ID': request_id,\n"
        new = old + ("            'branchId': 'markham',\n"
                     "            'chronologicalKey': chronological_key(submitted_at, request_id),\n")
    elif function_name == 'wraptitudeAppInsertService':
        old = '\n        "ID": unique_id,\n'
        new = old + ('        "branchId": "markham",\n'
                     '        "chronologicalKey": chronological_key(current_time, unique_id),\n')
    elif function_name == 'wraptitudeAppEditService':
        old = '\n        body["editAt"] = datetime.utcnow().isoformat() + "Z"\n'
        new = old + '''
        # Preserve the original creation date and branch when editing progress.
        existing = table.get_item(Key={"ID": item_id}, ConsistentRead=True).get("Item")
        if not existing:
            return {"statusCode": 404, "body": json.dumps({"message": "Order not found"})}
        body["createAt"] = existing.get("createAt", "")
        body["branchId"] = existing.get("branchId", "markham")
        body["chronologicalKey"] = chronological_key(body["createAt"], item_id)
'''
    else:
        raise ValueError('Unexpected legacy function')
    if source.count(old) != 1:
        raise ValueError(f'Legacy source changed: inspect {function_name} before patching')
    result = 'from sort_keys import chronological_key\n' + source.replace(old, new)
    compile(result, function_name, 'exec')
    return result


def build_package(function_name, original_zip):
    output = io.BytesIO()
    with zipfile.ZipFile(io.BytesIO(original_zip)) as original, \
            zipfile.ZipFile(output, 'w', compression=zipfile.ZIP_DEFLATED) as updated:
        for entry in original.infolist():
            if entry.filename == 'sort_keys.py':
                continue
            data = original.read(entry.filename)
            if entry.filename == 'lambda_function.py':
                data = patch_source(function_name, data.decode()).encode()
            updated.writestr(entry, data)
        updated.writestr('sort_keys.py', Path(__file__).with_name('sort_keys.py').read_bytes())
    return output.getvalue()
