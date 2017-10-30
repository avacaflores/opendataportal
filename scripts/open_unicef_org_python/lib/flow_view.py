import json
import os
import lib
import output_manager
import names
from activity import Activity
from transaction import Transaction
import re
from lib import donor_categories
from operator import itemgetter
from datetime import datetime
import color_mapping

from pprint import pprint
import sys

class FlowView:
	name_map = {}
	outputmap_filename = "donor_mapping.json"
	donor_category_map = {}
	total_donations_node_id = None
	def __init__(self):
		self.donors_zero = {}
		self.donors_negative = {}
		self.donors = {}
		self.sectors = {}
		self.sectors_negative = {}
		self.sectors_zero = {}
		self.totals = {}
		self.donor_tooltips = {}
		self.donor_region_tooltips = {}
		self.sector_tooltips = {}
		self.expense_region_tooltips = {}

		self.last_updated = None 
		self.country_pairs = set()


	def choose_dataset(self, amount):
		if amount < 0:
			return self.donors_negative
		elif amount == 0:
			return self.donors_zero
		else:
			return self.donors
	def choose_sector_dataset(self, amount):
		if amount < 0:
			return self.sectors_negative
		elif amount == 0:
			return self.sectors_zero
		else:
			return self.sectors
	def add_donor(self, year, donor_id, country_id, amount):
		dataset = self.donors #self.choose_dataset(amount)
		if year not in dataset:
			dataset[year] = {
			}
		if donor_id not in dataset[year]:
			dataset[year][donor_id]= {
				'total':0
			} 
		if country_id not in dataset[year][donor_id]:
			dataset[year][donor_id][country_id] = {
				'total':0
			} 		
		dataset[year][donor_id]['total'] += amount
		dataset[year][donor_id][country_id]['total'] += amount


	def add_sector(self, year, sector_id, country_id, amount,activity_id):
		dataset = self.sectors #self.choose_sector_dataset(amount)
		if year not in dataset:
			dataset[year] = {
			}
		if country_id not in dataset[year]:
			dataset[year][country_id]= {
				'total':0
			} 
		if sector_id not in dataset[year][country_id]:
			dataset[year][country_id][sector_id] = {
				'total':0
			} 		
		dataset[year][country_id]['total'] += amount
		dataset[year][country_id][sector_id]['total'] += amount

	def dataset_output(self, dataset_donors,dataset_sectors, unique_id_map, year, color_map ):

		idlist = set()
		donor_sectors = {}
		totals = {
			'expense': 0,
			'commitment': 0
		}
		for donor_id in dataset_donors:
			if donor_id == 'total':
				continue
			for country_id in dataset_donors[donor_id]:
				if country_id == 'total':
					continue
				totals['commitment'] += dataset_donors[donor_id][country_id]['total']
				#if dataset_donors[donor_id][country_id]['total'] < 0:
				#	print "less than 0", year, unique_id_map.reverse_get(donor_id) , unique_id_map.reverse_get(country_id), dataset_donors[donor_id][country_id]['total'] 
				if dataset_donors[donor_id][country_id]['total'] > 0: # change this to show negative link amounts

					idlist.add(donor_id)
					idlist.add(country_id)
					key = (donor_id, country_id )
					if key not in donor_sectors:
						donor_sectors[key] = {
							'source': key[0],
							'target': key[1],
							'value': 0 
						}	
					donor_sectors[key]['value'] += dataset_donors[donor_id][country_id]['total']

		total_expenses = {}
		for country_id in dataset_sectors:
			if country_id ==  'total':
				continue
			idlist.add(country_id)
			if country_id not in total_expenses:
				total_expenses[country_id] = 0
			for sector_id in dataset_sectors[country_id]:
				if sector_id == 'total':
					continue
				totals['expense'] += dataset_sectors[country_id][sector_id]['total']
				if dataset_sectors[country_id][sector_id]['total'] < 0:
					print "less than 0", year, unique_id_map.reverse_get(sector_id) , unique_id_map.reverse_get(country_id), dataset_sectors[country_id][sector_id]['total'] 
				if dataset_sectors[country_id][sector_id]['total'] > 0:  # change this to show negative link amounts

					idlist.add(sector_id)
					key = (  country_id, sector_id)
					if key not in donor_sectors:
						donor_sectors[key] = {
							'source': key[0],
							'target': key[1],
							'value': 0 
						}	
					donor_sectors[key]['value'] += dataset_sectors[country_id][sector_id]['total']
					total_expenses[country_id] += dataset_sectors[country_id][sector_id]['total'] 


		expense_countries = [] 

		for country_id in dataset_sectors:
			expense_countries += filter(lambda x: x[1] == country_id, self.country_pairs)
		expense_countries = set(expense_countries)

		# make country country links
		for donor_country, sector_country in expense_countries:
			idlist.add(donor_country)
			idlist.add(sector_country)
			key = (donor_country, sector_country)
			if key not in donor_sectors:
				donor_sectors[key] = {
					'source': key[0],
					'target': key[1],
					'value': total_expenses[sector_country] 
				}

		links = donor_sectors.values() 
		for link in links:
			link['value'] = float('%(val).1f' % {'val': link['value']})

		#idlist.add(self.country_id)
		idlist = list(idlist) 
		nodes = [unique_id_map.formatted_reverse_get(k) for k in idlist ]
		# add color values 
		for n in nodes:
			if n['type'] == 'donor':
				try:
					n['color'] = color_map['donors'][n['name']]
				except:
					n['color'] = color_map['donors']['amounts under limit']
			elif n['type'] == 'country':
				try:
					country_name = re.sub('\([CE]\)','', n['name'])
					n['color'] = color_map['regions'][country_name]
				except:
					print n['name']
			elif n['type'] == 'sector':
				n['color'] = color_map['sectors']['sector']
		output = {
			'nodes': nodes,
			'links': links 
		}
		totals['expense'] = round(totals['expense'])
		totals['commitment'] = round(totals['commitment'])
		return output,totals

	def output_for_year(self, dirname, year, unique_id_map, color_map):
		donor_set = self.donors[year]
		sector_set = self.sectors[year]
		
		output, totals = self.dataset_output(donor_set, sector_set, unique_id_map, year, color_map)
		# By Rahul D. @19May 15
		year_last_updated=""
		if self.last_updated != None :
			year_last_updated=self.last_updated.strftime('%Y-%m-%d') # By Rahul D. @19May 15
		# close		
		yeardata = {
			'zero': {},
			'negative': {},
			'set': output,
			'last_updated': year_last_updated,
			'totals': totals

		}
		yeardata_filename = os.path.join(dirname, "sankey_{0}.json".format(year))
		f = open(yeardata_filename,'w')
		json.dump(yeardata,f)
		f.close()

	def output_sparklines(self, dirname, iso3):
		# output json file showing pct change from year to year
		year_values = sorted(map(lambda x: {'year': x[0], 'value': round(x[1],1), 'pct_change': 'infinity'}, self.totals.iteritems()), key = itemgetter('year'), reverse=True)

		current_year_index = 0
		current_year = datetime.now().year
		for y in year_values:
			if y['year'] == current_year:
				break 
			current_year_index += 1

		for x in range(len(year_values) - 1):
			try:	
				year_values[x]['pct_change'] = (year_values[x]['value'] - year_values[x + 1]['value'])	/ year_values[x + 1]['value']
				year_values[x]['pct_change'] = round(year_values[x]['pct_change'] * 100, 1)
			except ZeroDivisionError:
				year_values[x]['pct_change'] = 'infinity'

		if len(year_values) < 2:
			percent_change = 'infinity'
		elif year_values[-1]['value'] == 0:
			percent_change = 'infinity'
		else:
			percent_change = (year_values[0]['value'] - year_values[-1]['value']) / year_values[-1]['value']
			percent_change = round(percent_change * 100, 1)

		output = {
			'current_year_index': current_year_index,
			'years': year_values,
			'percent_change': percent_change
		}
		f = open(os.path.join(dirname, "{0}_sparkline.json".format(iso3)), "w")
		json.dump(output, f)
		f.close()


	def calculate_pct_total(self, amount, total):
		if total == 0:
			return 0
		return round(100 * amount / total, 1)

	def donor_category_tooltips(self, year, unique_ids, world_total):
		output = {}
		for category_id in self.donor_tooltips[year]:
			if category_id not in output:
				output[category_id] = {}

			total_for_category = sum(self.donor_tooltips[year][category_id].values())
			output[category_id]['name'] = unique_ids.reverse_get(category_id)
			output[category_id]['amount'] = round(total_for_category,1)
			output[category_id]['pct_of_total'] = self.calculate_pct_total( total_for_category, world_total) #total_for_category / world_total
			output[category_id]['donors'] = []
			for donor_id in self.donor_tooltips[year][category_id]:
				donor_output = {}
				donor_output['amount'] = round(self.donor_tooltips[year][category_id][donor_id],1)
				donor_output['name'] = unique_ids.reverse_get(donor_id)
				donor_output['pct_of_total'] =  self.calculate_pct_total(self.donor_tooltips[year][category_id][donor_id] , total_for_category)
				output[category_id]['donors'].append(donor_output)
		return output

	def output_donor_region_tooltips(self, year, unique_ids, world_total_c):
		output = {}

		for region_id in self.donor_region_tooltips[year]:
			region_total = sum(self.donor_region_tooltips[year][region_id].values())
			output[region_id] = {}
			output[region_id]['name'] = unique_ids.reverse_get(region_id)
			output[region_id]['amount'] = round(region_total,1)
			output[region_id]['pct_of_total'] = self.calculate_pct_total(  region_total, world_total_c) #region_total / world_total_c
			output[region_id]['countries'] = [] 
			for country in self.donor_region_tooltips[year][region_id]:
				country_output = {
					'amount' : round(self.donor_region_tooltips[year][region_id][country], 1),
					'pct_of_total' : self.calculate_pct_total(self.donor_region_tooltips[year][region_id][country], region_total),#self.donor_region_tooltips[year][region_id][country] / region_total,
					'name': unique_ids.reverse_get(country)
				} 

				output[region_id]['countries'].append(country_output)

		return output

	def output_expense_region_tooltips(self, year, unique_ids, world_total_e):
		output = {} 
		for region in self.expense_region_tooltips[year]:
			region_total = sum(self.expense_region_tooltips[year][region].values())	
			output[region] = {
				'pct_of_total': self.calculate_pct_total(region_total , world_total_e),
				'amount': round(region_total,1),
				'name': unique_ids.reverse_get(region),
				'countries': [] 
				
			}	
			for country in self.expense_region_tooltips[year][region]:
				country_output = {
					'pct_of_total': self.calculate_pct_total(self.expense_region_tooltips[year][region][country] , region_total),
					'amount': round(self.expense_region_tooltips[year][region][country], 1) ,
					'name': unique_ids.reverse_get(country)
				}
				output[region]['countries'].append(country_output)
		return output

	def output_sector_tooltips(self, year, unique_ids, world_total_e):
		output = {}
		for sector in self.sector_tooltips[year]:
			output[sector] = {
				'pct_of_total': self.calculate_pct_total(self.sector_tooltips[year][sector] , world_total_e),
				'amount': round(self.sector_tooltips[year][sector], 1),
				'name': unique_ids.reverse_get(sector)
			}
		return output

	def output_tooltips(self,dirname,  year, unique_ids):
		world_total_c = sum([x for c in self.donor_tooltips[year] for x in self.donor_tooltips[year][c].values()])
		world_total_ex = sum([x for r in self.expense_region_tooltips[year] for x in self.expense_region_tooltips[year][r].values()])
		#print 'Total commitments', world_total_c
		#print 'Total expenses', world_total_ex
		output = {
			'donor_categories': self.donor_category_tooltips( year, unique_ids, world_total_c),
			'donor_regions': self.output_donor_region_tooltips( year, unique_ids, world_total_c),
			'expense_regions': self.output_expense_region_tooltips( year, unique_ids, world_total_ex),
			'sectors': self.output_sector_tooltips( year, unique_ids, world_total_ex)
		}
		f = open(os.path.join(dirname, "{0}_details.json".format(year)), 'w')
		json.dump(output, f)
		f.close()

	def output(self, dirname, unique_id_map):
		output_manager.setup_directory(dirname)
		years_filename = os.path.join(dirname, "sankey_years.json") 
		donorkeys = sorted(self.donors.keys(),key=lambda x: -x)
		current_year = datetime.now().year
		color_map = lib.color_mapping.load_color_map()
		try:
			current_year_index = donorkeys.index(current_year)
			donorkeys= donorkeys[current_year_index:]
			current_year_index = 0
		except ValueError:
			current_year_index = "derp"
			donorkeys = filter(lambda x: x> current_year, donorkeys) # TODO is this the same across all files?
		yeardata = {
			"current_year_index": current_year_index,
			"years": donorkeys
		}
		f = open(years_filename,'w')
		json.dump(yeardata, f)
		f.close()

		#years = set(self.donors.keys() + self.sectors.keys()) # @Rahul D. 120615
		years = set(self.donors.keys()).intersection(self.sectors.keys()) # @Rahul D. 120615

		for year in years:
			#print 'Outputting for',year
			self.output_for_year(dirname, year, unique_id_map, color_map)
			self.output_tooltips(dirname, year, unique_id_map)


	@classmethod
	def output_mapping(cls, dirname, unique_ids):
		f = open(os.path.join(dirname, "donor_category_mapping.json"), "w")
		json.dump(Worldview.donor_category_map, f)
		f.close()	

	@classmethod
	def output_donor_mapping(cls,dirname, unique_ids):
		mapping_file = os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','mappings', 'donor_categories.csv')
		categories = donor_categories.load(mapping_file)

		donor_mapping =  {} 
		for donor_id in unique_ids.donor_ids():
			name = unique_ids.reverse_get(donor_id).strip()
			name = names.alias(name) 
			try:
				category = categories[name]
			except KeyError:
				#print "Missing entry for",name
				category = 'Unassigned'
			if category not in donor_mapping:
				donor_mapping[category] = []

			if category in category_blacklist:
				continue

			output = {
				'name': name,
				'id': "{0}_{1}".format(Donor.prefix, donor_id)
			}	
			if output not in donor_mapping[category]:
				donor_mapping[category].append(output)
		for category in donor_mapping:
			donor_mapping[category] = sorted(donor_mapping[category], cmp=Worldview.donor_mapping_cmp)
		f = open(os.path.join(dirname, Worldview.outputmap_filename), 'w')	
		json.dump(donor_mapping, f)
		f.close()		
	@classmethod
	def donor_mapping_cmp(cls, x,y):
		return cmp(x['name'],y['name'])	



	def update_donor_category_tooltip(self, year, donor_category, donor_name, amount):
		#if amount <= 0:
		#	return
		dataset = self.donor_tooltips

		if year not in dataset:
			dataset[year] = {}
		if donor_category not in dataset[year]:
			dataset[year][donor_category] = {}
		if donor_name not in dataset[year][donor_category]:
			dataset[year][donor_category][donor_name] = 0

		dataset[year][donor_category][donor_name] += amount

	def update_donor_region_tooltip(self, year, donor_region, donor_country, amount):
		#if amount <= 0:
		#	return

		dataset = self.donor_region_tooltips

		if year not in dataset:
			dataset[year] = {}
		if donor_region not in dataset[year]:
			dataset[year][donor_region] = {}
		if donor_country not in dataset[year][donor_region]:
			dataset[year][donor_region][donor_country] = 0
		dataset[year][donor_region][donor_country] += amount



	def update_expense_region_tooltip(self, year, region, country, amount):
		#if amount <= 0:
		#	return

		dataset = self.expense_region_tooltips
		if year not in dataset:
			dataset[year] = {}
		if region not in dataset[year]:
			dataset[year][region] = {} 
		if country not in dataset[year][region]:
			dataset[year][region][country] = 0
		dataset[year][region][country] += amount 

	def update_sector_tooltip(self, year, sector, amount):
		#if amount <= 0:
		#	return

		dataset = self.sector_tooltips

		if year not in dataset:
			dataset[year] = {}
		if sector not in dataset[year]:
			dataset[year][sector] = 0
		dataset[year][sector] += amount

	def update_last_update(self, activity, year):
		if not activity.as_of_date:
			return
		if not self.last_updated or self.last_updated < activity.as_of_date:
			self.last_updated = activity.as_of_date

	def parse_activity(self, activity, unique_ids):
		if activity.region_long_name in Activity.region_blacklist:
			return
		alias = activity.ir_id 

		activity_title = activity.ir_name
		activity_title = activity.location_name + "--" + activity_title
		activity_id = unique_ids.set(activity_title, 'activity', alias)
			
		original_country_id = unique_ids.set(activity.location_name, 'country')

		donor_country_id = unique_ids.set(activity.region_long_name + '(C)', 'country') 
		expense_country_id = unique_ids.set(activity.region_long_name + '(E)', 'country')

		self.country_pairs.add((donor_country_id, expense_country_id))

		use_donor_category = True

		# region tooltip should show total expenses, not the ones calculated by amount
		for year in activity.expense_transactions:
			total_expenses = sum(map(lambda tx: tx.amount, activity.expense_transactions[year]))
			self.update_expense_region_tooltip(year, expense_country_id, original_country_id, total_expenses)

		for tx in activity.transaction_list:
			
			self.update_last_update(activity, tx.year)
			if  tx.transaction_type == 'C':
				if not tx.valid(): # !!! check this
					continue	
				if use_donor_category:
					donor_id = unique_ids.set(tx.donor_category, 'donor')
				else:
					donor_id = unique_ids.set(tx.provider, 'donor')
				country_id = donor_country_id


				original_donor_id = unique_ids.set(tx.provider, 'donor name - original')

				self.add_donor(tx.year, donor_id, country_id, tx.amount)
				self.update_donor_category_tooltip(tx.year, donor_id, original_donor_id, tx.amount)
				self.update_donor_region_tooltip(tx.year, donor_country_id, original_country_id, tx.amount)

			elif tx.transaction_type == 'E':
				country_id = expense_country_id
				sector_id = unique_ids.set(tx.sector_name, 'sector', tx.sector)
				self.add_sector(tx.year, sector_id, country_id, tx.amount, activity_id)
				self.update_sector_tooltip(tx.year, sector_id, tx.amount)
