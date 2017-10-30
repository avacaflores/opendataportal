import re
import json
import csv
import os

regions = ['MENA', 'ROSA', 'EAPRO', 'ESARO', 'LACRO', 'WCARO', 'CEECIS']
alias_map = {
	'Cote DIvoire': 'Cote D\'Ivoire',
	'Alliance Cote d#Ivoire': 'Alliance Cote D\'Ivoire',
	'Lao Peoples': 'Lao People\'s',
	' and ': ' & ',
#	'CEE/CIS & Baltic States': 'CEE/CIS',
	'\(donor\)': '',
	'\(donor\)': '',
	'MENA': '',
	'ROSA': '',
	'EAPRO': '',
	'ESARO': '',
	'LACRO': '',
	'WCARO': '',
	'CEE_CIS': 'CEE/CIS'
}

def load_clean_donor_names(donornames):
	with open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','mappings/donor_names.csv')) as f:
		reader = csv.DictReader(f)
		for row in reader:
			original = row['Original']
			cleaned = row['Notes']
			donornames[original] = cleaned

		
def sanitize(name):
	name = alias(name)
	#for r in regions:
	#	name = re.sub(r, '', name)
	name = re.sub(' and ',' & ', name, re.IGNORECASE)
	name = re.sub('-and-','-&-', name, re.IGNORECASE)
	name = re.sub('[ ,/]','-',name)
	name = name.strip('- ')
	return name
def alias(name):
	clean_name = name	

	for alias in alias_map:
		clean_name = re.sub(alias, alias_map[alias], clean_name).strip()
	return clean_name	
