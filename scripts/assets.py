"""Refresh the Wikimedia photographs and attribution metadata. Requires curl and cwebp."""
import json, pathlib, re, subprocess, time, urllib.parse
root = pathlib.Path(__file__).resolve().parent.parent
credit_path = root / 'src/credits.json'
credits = json.loads(credit_path.read_text())
for key, existing in credits.items():
    query = urllib.parse.urlencode(dict(action='query', titles='File:' + existing['title'], prop='imageinfo', iiprop='url|extmetadata', iiurlwidth=1600, format='json'))
    data = json.loads(subprocess.check_output(['curl', '-fsSL', '--max-time', '30', 'https://commons.wikimedia.org/w/api.php?' + query]))
    info = next(iter(data['query']['pages'].values()))['imageinfo'][0]
    original = root / 'public/images' / (key + '.source.jpg')
    subprocess.run(['curl', '-fsSL', '--max-time', '45', info.get('thumburl', info['url']), '-o', str(original)], check=True)
    subprocess.run(['cwebp', '-quiet', '-q', '82', '-resize', '1600', '0', str(original), '-o', str(root / 'public/images' / (key + '.webp'))], check=True)
    original.unlink()
    meta = info['extmetadata']
    credits[key] = {'title': existing['title'], 'source': info['descriptionurl'], 'author': re.sub('<[^>]+>', '', meta.get('Artist', {}).get('value', '')), 'license': meta.get('LicenseShortName', {}).get('value', ''), 'licenseUrl': meta.get('LicenseUrl', {}).get('value', '')}
    credit_path.write_text(json.dumps(credits, ensure_ascii=False, indent=2))
    print(key, flush=True)
    time.sleep(1)
