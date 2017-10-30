import json
import os
def load_color_map():
	""" Load color mapping scheme """

	g = open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','mappings/regions.json'))
	region_data = json.load(g)
	g.close()

	region_mapping = {}
	for abbrev in region_data:
		if region_data[abbrev] not in region_mapping:
			region_mapping[region_data[abbrev]] = []
		region_mapping[region_data[abbrev]].append(abbrev)	
	f = open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','mappings/colors.json'))
	data = json.load(f)
	f.close()

	color_mapping = {}	
	for category_type in data:
		color_mapping[category_type] = {}
		for mapping in data[category_type]:
			if category_type == 'regions':
				for region_short_name in region_mapping[mapping['name']]:
					color_mapping[category_type][region_short_name] = mapping['color']
				color_mapping[category_type][mapping['name']] = mapping['color']
			else:
				color_mapping[category_type][mapping['name']] = mapping['color']
	return color_mapping