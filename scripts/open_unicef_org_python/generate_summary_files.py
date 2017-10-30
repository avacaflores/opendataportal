import xml.etree.ElementTree as ET
import os
import json
import argparse
from datetime import datetime
from operator import itemgetter
from pprint import pprint
import re
import sys
from lib import names, output_manager
import lib
from lib.transaction import Transaction
from lib.activity import Activity
from lib import color_mapping
from lib.organisation import Organisation
from lib import sector_names
import subprocess

def amounts_under_limit_key(limit):
	return "amounts under {0}".format(limit)

def parse_organisations(country_root, output):
	#skipped = 0
	for org_xml in country_root.findall('./iati-organisation'):
		org = Organisation(org_xml)
		#skipped += org.skipped
		for year in org.recipient_country_budgets:
			if year > datetime.now().year:
				continue
			if year not in output['unicef']:
				output['unicef'][year] = {
					'year': year,
					'value': {
						'C': 0,
						'E': 0,
						'D': 0,
						'IF':0,
						'B': 0 # total unfunded
					},
					'donors': set(),
					'countries': set()
				}				
			output['unicef'][year]['value']['B'] += org.recipient_country_budgets[year]
	#print 'Skipped', skipped
def parse(input_dir, country_files, output_dir):
	"""Iterate over all the country files. For each one, parse info 
	about country, region, and all transactions."""

	# set up output data structure
	output = {
		'unicef': {}, # {year: {year info}}
		'donors': {}, # {donor_name: {year: {year info}}}
		'countries': {}, # {country_name: {year: {year info}}}
		'total_transactions': 0,
		'invalid_transactions': 0 # number of invalid transactions
	}
	regions = {}
	sectors = {} # {year: {year: 2012, top: [], other: []}, ... }

	updated_dates = set()
	for country_file in country_files:
		country_root = ET.parse(os.path.join(input_dir,country_file))

		parse_organisations(country_root, output)

		for activity_xml in country_root.findall('iati-activity'):
			activity = Activity(activity_xml)
			if activity.region in Activity.region_blacklist:
				continue

			if activity.as_of_date:
				updated_dates.add(activity.as_of_date)
			for year in activity.planned_disbursements:
				increment_total_planned_disbursement(output, year, activity.planned_disbursements[year])

			if activity.location_name == None:
				print "Not a country...", country_file
				continue

			for tx in activity.transaction_list:
				output['total_transactions'] += 1
				if (not tx.valid()): # or tx.amount < 0:
					output['invalid_transactions'] += 1
					continue
				if tx.transaction_type == 'C':
					increment_totals(output, tx, activity.location_name)
				elif tx.transaction_type == 'E':
					increment_sector(sectors, tx.sector, tx.sector_name, tx.amount, tx)
					if tx.year >= 2014: # Added By Rahul D. @260615
						increment_sector_totals(output, tx, activity.location_name, tx.amount)
				
				increment_donors(output, tx, activity.location_name)
				increment_countries(output, tx, activity.location_name, activity.region)
				increment_regions(regions, tx, activity.location_name, activity.region)
			
			# Added By Rahul D. @260615
			for tx1 in activity.transaction_list_sectors:
				if tx1.year < 2014 and tx1.transaction_type == 'E':
					increment_sector_totals(output, tx1, activity.location_name, tx1.amount)
			# end
			
	limit = 1000 # anything under this amount gets grouped together
	finalize_output(output, amounts_under_limit_key(limit))
	for year in output['donors']:
		bin_under_smaller(output,'donors', year, 'C', limit)

	regions = transform_regions(regions)
	
	#open('debug.json', 'w').write(str(output['donors']))
	
	top_donor_info = sort_and_split_things(output['donors'], transaction_type='C')
	top_country_info = sort_and_split_things(output['countries'], transaction_type='C')

	top_sector_info = sort_and_split_sectors(sectors)

	# copy over mappings file
	region_mapping_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'mappings','regions.json')
	cp_cmd = 'cp {0} {1}'.format(region_mapping_file, output_dir) 
	subprocess.call(cp_cmd.split(' '))

	# write totals
	last_updated = max(updated_dates).strftime('%b %Y')
	output['unicef']['last_updated'] = last_updated

	with open(os.path.join(output_dir, 'summary_total.json'), 'wb') as f:
		json.dump(output['unicef'], f)
	# write regions
	with open(os.path.join(output_dir, 'summary_regions.json'), 'wb') as f:
		json.dump(regions, f)

	with open(os.path.join(output_dir, 'summary_donors.json'), 'wb') as f:
		json.dump(top_donor_info, f)

	# write countries
	with open(os.path.join(output_dir, 'summary_countries.json'), 'wb') as f:
		json.dump(top_country_info, f)

	# write sectors
	with open(os.path.join(output_dir, 'summary_sectors.json'), 'wb') as f:
		json.dump(top_sector_info, f)

	# write Outcome Area
	outcome_areas = { "01" : "Health", "02":  "HIV & AIDS", "03" : "WASH", "04" : "Nutrition", "05" : "Education", "06" : "Child Protection", "07" : "Social Inclusion", "00" : "NA-Programme Area"}
	with open(os.path.join(output_dir, 'outcome_area.json'), 'wb') as f:
		json.dump(outcome_areas, f)

def increment_sector_totals(output, tx, country_name, amount):
	if tx.year > datetime.now().year:
		return
	if tx.year not in output['unicef']:
		output['unicef'][tx.year] = {
			'year': tx.year,
			'value': {
				'C': 0,
				'E': 0,
				'D': 0, 
				'IF':0,
				'B': 0
			},
			'donors': set(),
			'countries': set()
		}

	output['unicef'][tx.year]['value'][tx.transaction_type] += amount 
	#output['unicef'][tx.year]['donors'].add(tx.provider)
	output['unicef'][tx.year]['countries'].add(country_name)
	
def increment_total_planned_disbursement(output, year, amount):
	if year > datetime.now().year:
		return
	if year not in output['unicef']:
		output['unicef'][year] =  {
			'year': year,
			'value': {
				'C': 0,
				'E': 0,
				'D': 0,
				'IF':0,
				'B': 0
			},
			'donors': set(),
			'countries': set()
		}
	output['unicef'][year]['value']['D'] += amount



def increment_totals(output, tx, country_name):
	if tx.year > datetime.now().year:
		return
	if tx.year not in output['unicef']:
		output['unicef'][tx.year] = {
			'year': tx.year,
			'value': {
				'C': 0,
				'E': 0,
				'D': 0,
				'IF':0,
				'B': 0 # total budget
			},
			'donors': set(),
			'countries': set()
		}

	output['unicef'][tx.year]['value'][tx.transaction_type] += tx.amount
	output['unicef'][tx.year]['donors'].add(tx.provider)
	output['unicef'][tx.year]['countries'].add(country_name)

def increment_donors(output, tx, country_name):
	if tx.year > datetime.now().year:
		return
	
	donor_name = tx.provider
	if not tx.year in output['donors']:
		output['donors'][tx.year] = {}
	if not donor_name in output['donors'][tx.year]:
		output['donors'][tx.year][donor_name] = {
			'year': tx.year,
			'type': tx.donor_category,
			'value': {
				'C': 0,
				'E': 0,
				'D': 0,
				'IF':0,
				'B': 0
			},
			'countries': set()
		}
	output['donors'][tx.year][donor_name]['value'][tx.transaction_type] += tx.amount
	output['donors'][tx.year][donor_name]['countries'].add(country_name)

def increment_countries(output, tx, country_name, region_name):
	if tx.year > datetime.now().year:
		return
	if not tx.year in output['countries']:
		output['countries'][tx.year] = {}
	if not country_name in output['countries'][tx.year]:
		output['countries'][tx.year][country_name] = {
			'year': tx.year,
			'value': {
				'C': 0,
				'E': 0,
				'D': 0,
				'IF':0,
				'B': 0
			},
			'donors': set(),
			'region': region_name	
		}
	output['countries'][tx.year][country_name]['value'][tx.transaction_type] += tx.amount
	if tx.transaction_type == 'C':
		output['countries'][tx.year][country_name]['donors'].add(tx.provider)

def increment_regions(regions, tx, country_name, region_name, transaction_type='C'):
	if tx.year > datetime.now().year:
		return
	donor_name = tx.provider

	if not region_name in regions:
		regions[region_name] = {
			'name': region_name,
			'years': {}
		}
	if not tx.year in regions[region_name]['years']:
		regions[region_name]['years'][tx.year] = {
			'info': {
				'year': tx.year,
				'value': {
					'C': 0,
					'E': 0,
					'D': 0,
					'IF':0,
					'B': 0
				}
			},
			'countries': {},
			'donors': {}
		}

	# add to total
	regions[region_name]['years'][tx.year]['info']['value'][tx.transaction_type] += tx.amount

	# if right type, add to countries and donors lists
	if tx.transaction_type == transaction_type:
		# add to countries
		if not country_name in regions[region_name]['years'][tx.year]['countries']:
			regions[region_name]['years'][tx.year]['countries'][country_name] = {
				'name': country_name,
				'value': 0
			}
		regions[region_name]['years'][tx.year]['countries'][country_name]['value'] += tx.amount

		# add to donors
		if not donor_name in regions[region_name]['years'][tx.year]['donors']:
			regions[region_name]['years'][tx.year]['donors'][donor_name] = {
				'name': donor_name,
				'value': 0
			}
		regions[region_name]['years'][tx.year]['donors'][donor_name]['value'] += tx.amount

def increment_sector(sectors, sector_id, sector_name, sector_amount, tx):
	if tx.year > datetime.now().year:
		return
	if not tx.year in sectors:
		sectors[tx.year] = {}
	if not sector_id in sectors[tx.year]:
		sectors[tx.year][sector_id] = {
			'sector_id': sector_id,
			'sector_name': sector_name,
			'value': 0
		}

	sectors[tx.year][sector_id]['value'] += sector_amount

def finalize_output(output, filter_key):
	"""For each top-level category (unicef, countries, donors), 
	for each year, count the number of countries and donors. 
	Transform dictionary of {year: year_info} into a list of [year_info]"""

	for year in output['unicef']:
		count_countries_donors(output['unicef'][year])


	for year in output['unicef']:
		output['unicef'][year]['value']['U'] = output['unicef'][year]['value']['B'] - output['unicef'][year]['value']['C']

		for k in output['unicef'][year]['value']:
			output['unicef'][year]['value'][k] = round(output['unicef'][year]['value'][k], 1)
	output['unicef'] = {
		'years': sorted(output['unicef'].values(), key=itemgetter('year')),
		'invalid_transactions': output['invalid_transactions'],
		'total_transactions': output['total_transactions']
	}
	output['unicef']['current_year_index'] = get_current_year_index(output['unicef']['years'])

	for year in output['donors']:
		for donor in output['donors'][year]:
			count_countries_donors(output['donors'][year][donor])

	year_donors = {} 
	for year in output['countries']:
		for country in output['countries'][year]:
			if year not in year_donors:
				year_donors[year] = set()
			for donor in output['countries'][year][country]['donors']:
				# gets the donor count the way the map and flow views do it; i.e. only count donors
				# that donated to a country
				year_donors[year].add(donor)
			count_countries_donors(output['countries'][year][country])


	for year_data in output['unicef']['years']:
		# recalculate  donor count for each year since increment_totals doesn't
		# take any filtering into account
		year = year_data['year']
		year_data['num_donors'] = len(year_donors[year])
		# output['countries'][country] = sorted(output['countries'][country].values(), key=itemgetter('year'))

def get_current_year_index(year_data):
	current_year = datetime.now().year
	for i, year_datum in enumerate(year_data):
		if year_datum['year'] == current_year:
			return i
	return -1

def transform_regions(regions):
	for region_name, region_info in regions.iteritems():
		for year, year_info in region_info['years'].iteritems():
			year_info['countries_list'] = sorted(year_info['countries'].values(), key=itemgetter('name'))
			del year_info['countries']
			year_info['donors_list'] = sorted(year_info['donors'].values(), key=itemgetter('name'))
			del year_info['donors']
		# print region['years'].values()
		region_info['years'] = sorted(region_info['years'].values(), key=lambda x: x['info']['year'])

	regions = regions.values()

	regions.sort(key=itemgetter('name'))

	return regions

def count_countries_donors(thing):
	"""If applicable, count the number of countries and donors 
	and delete the full list of countries and donors."""
	if thing.has_key('countries'):
		thing['num_countries'] = len(thing['countries'])
		del thing['countries']
	if thing.has_key('donors'):
		thing['num_donors'] = len(thing['donors']) 
		del thing['donors']

def bin_under_smaller(output, output_type,  year, transaction_type, limit=1000):
	# all values under the limit are grouped together

	if year not in output[output_type]:
		return
	keys_to_remove = set()
	other = {
		'limit': limit,
		'type': amounts_under_limit_key(limit),
		'year': year,
		'value': {
				'C': 0,
				'E': 0,
				'D': 0,
				'IF':0,
				'B': 0			
		}
	}

	for entry_name in output[output_type][year]:
		entry = output[output_type][year][entry_name]
		if entry['value'][transaction_type] < limit:
			other['value'][transaction_type] += entry['value'][transaction_type]
			keys_to_remove.add(entry_name)

	output[output_type][year]["amounts under {0}".format(limit)]  = other
	
	for k in keys_to_remove:
		del output[output_type][year][k]


def sort_and_split_things(raw_things, transaction_type='C'):
	"""For a given thing (countries, donors), add up the total $ commitment
	for all years. Then sort the list and split it into the top N and the rest."""
	n = 10 # how many are in the 'top'
	color_map = color_mapping.load_color_map()
	output = []
	for year in raw_things:
		thing_totals = []
		for thing_name in raw_things[year]:
			thing_total = {
				'name': thing_name,
				'value': raw_things[year][thing_name]['value'].get(transaction_type)
			}

			if raw_things[year][thing_name].has_key('region'):
				thing_total['region'] = raw_things[year][thing_name]['region']
				thing_total['color'] = color_map['regions'][raw_things[year][thing_name]['region']]
				
			if raw_things[year][thing_name].has_key('type'):				
				thing_total['type'] = raw_things[year][thing_name]['type']
				if raw_things[year][thing_name]['type'] not in color_map['donors']:
					color = color_map['donors']['amounts under limit']
				else:
					color = color_map['donors'][raw_things[year][thing_name]['type']]
				thing_total['color'] = color
			
			thing_totals.append(thing_total)

		thing_totals.sort(key=itemgetter('value'), reverse=True)
		year_info = {
			'year': year,
			'top_{0}'.format(n): thing_totals[:n],
			'other': thing_totals[n:]
		}
		output.append(year_info)
	output.sort(key=itemgetter('year'))
	return output
'''
Function : getOutcomeCodeByProgrammeCode
Purpose : fetch outcome code from programme code 
Added By : Rahul D.
Added Date : 26May15
'''
def getOutcomeCodeByProgrammeCode(pcode=''):
	outcome_code=''
	if pcode is not None:
		data = pcode.split('-')
	try:	
		if len(data) == 2:
			outcome_code = data[0][2:]
	except KeyError:
		pass
	return outcome_code

def sort_and_split_sectors(sectors):
	n = 10 # how many are in the 'top'
	color_map = color_mapping.load_color_map()
	output = []

	missing_names = sector_names.load_missing_names().values()
	for year, sector_info in sectors.iteritems():
		
		sector_totals = []
		for sector_id, sector in sector_info.iteritems():
			#if sector['sector_name'] in missing_names:
			#	continue
			if sector['value'] <= 0:
				continue

			sector_total = {
				'name': sector['sector_name'],
				'value': round(sector['value'], 1),
				'color': color_map['sectors']['sector'],
				'programme_code' : sector_id,
				'outcome_code' : getOutcomeCodeByProgrammeCode(sector_id)
			}
			sector_totals.append(sector_total)

		sector_totals.sort(key=itemgetter('value'), reverse=True)
		year_sectors = {
			'year': year,
			'top_{0}'.format(n): sector_totals[:n],
			'other': sector_totals[n:]
		}
		output.append(year_sectors)

	output.sort(key=itemgetter('year'))

	return output

if __name__ == '__main__':
	parser = argparse.ArgumentParser(description = "Generate summary files")
	parser.add_argument("--input-dir", help="input-dir", default="source_data")
	parser.add_argument("--input-file", help="single input file", default=None)
	parser.add_argument("--output-dir", help="output-dir", default="json/summary")

	args = parser.parse_args() 

	if args.input_dir == 'source_data':
		# source_data always lives in source code directory
		args.input_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), args.input_dir)

	if args.input_file != None:
		country_files = [args.input_file]
	else:
		country_files = filter(lambda x: os.path.isfile(os.path.join(args.input_dir, x)), os.listdir(args.input_dir))

	output_manager.setup_directory(args.output_dir)
	parse(args.input_dir, country_files, args.output_dir)
