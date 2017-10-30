import csv
import difflib
import os
import names
def load(filename):
	donor_categories = {}

	with open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..',filename), 'rU') as f:
		reader = csv.DictReader(f)
		for row in reader:
			donor_name = row['DONOR_NAME'].strip()
			donor_name = names.alias(donor_name)
			#donor_code = row['DONOR_CODE'].strip()
			donor_category = " ".join(row['DONOR_TYPE_NAME'].strip().split(' '))
			if donor_name in donor_categories and donor_category != donor_categories[donor_name]:
				print "Conflict!", donor_name,"already set with",donor_categories[donor_name], "cannot add", donor_category 
				difference =  difflib.ndiff([donor_category], [donor_categories[donor_name]])
				print ",".join(difference)	
				pass
			donor_categories[donor_name] = donor_category 
	return donor_categories

