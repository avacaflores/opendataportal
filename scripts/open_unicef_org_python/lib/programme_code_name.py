import json
import os

def load():
	s = {}
	f = open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..',"mappings/programme_area.json"))
	codelist = json.load(f)
	for entry in codelist['codelist-items']:
		s[entry['code']] = entry['name']
	f.close()
	return s 
