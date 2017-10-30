import json
import os
def load():
	s = {}
	f = open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..',"mappings/sector_codelist_clv3.json"))
	codelist = json.load(f)
	for entry in codelist['data']:
		s[entry['code']] = entry['name']
	f.close()

	g = open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','mappings/missing_sector_names.json'))
	missing_names = json.load(g)
	missing_names.update(s)
	return missing_names 

def load_missing_names():
	try:
		g = open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','mappings/missing_sector_names.json'))
		missing_names = json.load(g)
	except:
		missing_names = {}
	return missing_names 