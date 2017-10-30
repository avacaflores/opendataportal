import json
import os

def load():
	s = {}
	f = open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..',"mappings/consolidated_donors.json"))
	codelist = json.load(f)
	for entry in codelist['codelist-items']:
		s[entry["name"]] = entry["abbrs"]
	f.close()
	return s 
