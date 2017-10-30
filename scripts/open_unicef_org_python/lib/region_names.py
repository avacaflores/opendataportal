import json
import os
def file_region_name(filename):
	""" for a select number of files that cover an entire region, they
	 elected to use 'REGIONAL-PROG' in the recipient-region' in the region field
	 so we have to get the region from the filename
	"""
	for region in regions:
		if re.search(region, filename,  re.IGNORECASE):
			return re.sub('\.xml','', filename.split('_')[1])
	return None

def load_region_names():
	f = open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','mappings/regions.json'))
	region_names = json.load(f)
	f.close()
	return region_names
def region_map(region, region_names):
	try:
		return region_names[region]
	except KeyError:
		#print 'missing mapping', region
		return region	
def load_region_blacklist():
	f = open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','mappings/region_blacklist.json'))
	region_blacklist = json.load(f)
	f.close()
	return region_blacklist