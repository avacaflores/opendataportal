import json
import os
def load():
	s = {}
	f = open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..',"mappings/region_codelist_clv3.json"))
	codelist = json.load(f)
	for entry in codelist['data']:
		s[entry['code']] = entry['name']
	f.close()
	return s 
