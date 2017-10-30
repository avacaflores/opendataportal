import os
import datetime
import csv 
import json
import re
from sets import Set
import xml.etree.ElementTree as ET
from activity import Activity
from transaction import Transaction
import names
import output_manager
import sector_names
import programme_code_name # By Rahul D. for 201 @05Jun15
from pprint import pprint
import sys

class TableView:
	def __init__(self, output_dir="./json/table",input_dir="./mappings"):
		self.countries = []
		self.sector_otc = 0
		self.donor_otc = 0
		self.disbursement_ct = 0
		self.dateFormatStr = "%m/%d/%Y %H:%M:%S"
		self.outputDateFmt = "%m-%d-%y"
		self.output_dir = os.path.abspath(output_dir)
		self.output_country_dir = os.path.abspath(os.path.join(self.output_dir , "country"))
		self.input_dir = input_dir

		self.country_aggregates= {}
		self.donor_ids = {}
		self.sector_ids = {}
		self.project_ids = {}
		self.names_to_ids = {}
		self.pcr_ids = {}

		self.donor_names = {}
		self.debug_lines = []

		self.unique_id_counter = 0
		self.years = []

		self.max_as_of_date = None

		self.input_file_names = [] 
		self.setup_output_directories()

		self.donor_categories = {}
		self.download_links = {} # key - country, value = [] (files)

		self.country_year_expenses = {} # key 1 - year key 2- country

	def setup_output_directories(self):
		#if os.path.isdir(self.output_dir) != True:
			##print "Writing output to:",self.output_dir			
		#	os.mkdir(self.output_dir)
		#output_manager.setup_directory(self.output_dir)
		pass

	def output_download_links(self):
		download_link_path = os.path.abspath(os.path.join(self.output_dir, 'downloads.json'))
		g = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'mappings/filename_to_url.json'))
		filename_to_url = json.load(g)
		g.close()

		for d in self.download_links:
			self.download_links[d] = filename_to_url[self.download_links[d]]	
		f = open(download_link_path, 'w')
		json.dump(self.download_links, f)
		f.close()

	def country_output_filename(self, country,year):
		country = re.sub('[,/ ]','-',country)
		fileName = os.path.abspath(os.path.join(self.output_dir, str(year), country +'.json'))
		#print "Writing to",fileName
		return fileName

	def allcountries_filename(self,year=None):
		if year:
			fileName = os.path.abspath(os.path.join(self.output_dir, 'all_countries_' + year + '.json'))
		else:
			fileName = os.path.abspath(os.path.join(self.output_dir, 'all_countries.json'))
		#print "Writing to",fileName
		return fileName 

	#def load_sector_ids(self):
		#self.sector_ids = sector_names.load()

	# By Rahul D. for 201 @05Jun15
	def load_sector_ids(self):
		self.sector_ids = programme_code_name.load()


	def load_data(self):
		self.load_sector_ids()
		for iatiFileName in self.input_file_names:
			#print "About to open",iatiFileName
			lineNumber = 0
			with open(iatiFileName, 'Ur') as f:
				csvreader = csv.reader(f, delimiter=',')
				for line in csvreader:
					if lineNumber == 0:
						self.set_header_map(line)
					else:
						self.process(line)
					lineNumber += 1
					##print lineNumber,

	def xml_file_names(self, input_dir='source_data'):
		country_files = filter(lambda x: os.path.isfile(os.path.join(input_dir, x)), os.listdir(input_dir))
		return country_files

	def load_xml_data(self, input_dir='source_data'):
		self.load_sector_ids()
		for filename in self.xml_file_names(input_dir):
			with open(os.path.join(input_dir, filename),'Ur') as f:
				country_root = ET.parse(os.path.join(input_dir, filename))
				for activity_xml in country_root.findall('iati-activity'):
					activity = Activity(activity_xml)
					if not self.max_as_of_date or (activity.as_of_date and activity.as_of_date > self.max_as_of_date):
						self.max_as_of_date = activity.as_of_date 
					if activity.location_name not in self.download_links:
						self.download_links[activity.location_name] = filename 


					for transaction in activity.transaction_list:
						if transaction.transaction_type != 'D' and transaction.transaction_type != 'IF': # don't include any disbursement transactions
							if transaction.year >= 2014: # Added By Rahul D. @020715
								self.process_xml(transaction, activity) # 'activity' added by vijay 30 Aug 2017

					# Added By Rahul D. @260615
					for transaction_s in activity.transaction_list_sectors:
						if transaction_s.transaction_type != 'D' and transaction_s.transaction_type != 'IF': # don't include any disbursement transactions
							if transaction_s.year < 2014:
								self.process_xml(transaction_s, activity) # 'activity' added by vijay 30 Aug 2017
					# end

					for year in activity.expense_transactions:
						if year >= 2014: # Added By Rahul D. @020715
							for expense_tx in activity.expense_transactions[year]:
								self.add_country_year_expense(expense_tx.location_name, expense_tx.year, expense_tx.ir_id, expense_tx.amount)
					
					# Added By Rahul D. @260615
					for year_s in activity.expense_transactions_sectors:
						if year_s < 2014: # Added By Rahul D. @020715
							for expense_tx_s in activity.expense_transactions_sectors[year_s]:
								self.add_country_year_expense(expense_tx_s.location_name, expense_tx_s.year, expense_tx_s.ir_id, expense_tx_s.amount)					
					# end
					self.add_project_disbursement(activity) # this comes after because all the countries will be init'd

	def initialize_project(self, year, project_name):
		if year not in self.project_ids:
			self.project_ids[year] = {}
		if project_name not in self.project_ids[year].keys():
			self.project_ids[year][project_name] = self.unique_id_counter
			self.unique_id_counter += 1

	def initialize_pcr(self, pcr_id, pcr_name):
		if pcr_id not in self.pcr_ids.keys():
			self.pcr_ids[pcr_id] = [pcr_name]
		else:
			if pcr_name not in self.pcr_ids[pcr_id]:
				self.pcr_ids[pcr_id].append(pcr_name)


	def initialize_country(self, country, lat, lng):
		if country not in self.country_aggregates.keys():
			self.country_aggregates[country] = {
				'name' : country,
				'lat': lat,
				'lng': lng,
				'by_yr':{}
			}

	def initialize_year(self, country, year):
		# aggregate regardless of country program name
		if year not in self.country_aggregates[country]['by_yr'].keys():
			self.years.append(year)
			self.country_aggregates[country]['by_yr'][year] = {
				'year': year,
				'all':{
					'b': 0,
					'c':0,
					'e':0
				},
				'sct':{},
				'dnr':{},
				'dis':[]
			}

	def initialize_sector_or_donor(self, data, donor_category=None):	
		if data['type']	 == 'D':
			# sectors and donors are not connected to disbursements
			pass 
		else:
			if data['type'] == 'E':
				if data['sector'] not in self.country_aggregates[data['country']]['by_yr'][data['year']]['sct'].keys():
					self.country_aggregates[data['country']]['by_yr'][data['year']]['sct'][data['sector']] = {
						'otc' :[],
						'e': 0	
					}
			elif data['type'] != 'IF':
				if data['donorCode'] not in self.country_aggregates[data['country']]['by_yr'][data['year']]['dnr'].keys():
					self.country_aggregates[data['country']]['by_yr'][data['year']	]['dnr'][data['donorCode']] = {
						'otc': [],
						'c': 0	
					}
					if data['donorCode'] not in self.donor_ids.keys():
						self.donor_ids[data['donorCode']] = data['donorName']

				# mapping for donor category file
				if donor_category not in self.donor_categories:
					self.donor_categories[donor_category] = set()
				self.donor_categories[donor_category].add(data['donorCode'])

	def add_country_year_expense(self, country, year, output_id, amount):
		if year not in self.country_year_expenses:
			self.country_year_expenses[year] = {}
		if country not in self.country_year_expenses[year]:
			self.country_year_expenses[year][country] = {}
		if output_id not in self.country_year_expenses[year][country]:
			self.country_year_expenses[year][country][output_id] = 0

		self.country_year_expenses[year][country][output_id] += amount
		

	def add_project_outcome(self, data):
		# this function updates all totals we are tracking
		country = data['country']
		year = data['year']
		
		pcrId = data['pcrId']
		projectId =  self.project_ids[data['year']][data['projectName']]

		paymentType = data['type'].lower()
		if data['type'] == 'C':
			sectorOrDonor = 'dnr'
			sectorOrDonorId = data['donorCode'] 
		elif data['type'] == 'E':
			sectorOrDonor = 'sct'
			sectorOrDonorId = data['sector']	
		if data['type'] != 'IF':
			self.country_aggregates[country]['by_yr'][year][sectorOrDonor][sectorOrDonorId][paymentType] += data['amount']

			if data['type'] != 'E':
				self.country_aggregates[country]['by_yr'][year]['all'][paymentType] += data['amount']
			
			self.country_aggregates[country]['by_yr'][year][sectorOrDonor][sectorOrDonorId]['otc'].append({
				'otc_id': projectId,
				'otc_sfx': data['outputId'][-3:],
				'pcr_id': pcrId,
				'sdt': self.format_date(data['projectStartDate']),
				'edt': self.format_date(data['projectEndDate']),			
				#'as_of': data['asOfDate'], # this is a date obj, will be converted to correct format during final calculations
				paymentType : data['amount'],
				'description' : data['description']	
				})


	def add_project_disbursement(self, activity):
		if activity.region in Activity.region_blacklist:
			return
		# disbursements aren't tracked on a project level and belong to neither  sectors nor donors
		# add them to the running totals
		self.initialize_country(activity.location_name, activity.latitude, activity.longitude)
		self.initialize_pcr(activity.pcr_id, activity.pcr_name)

		for year,value in activity.planned_disbursements.iteritems():
			self.initialize_project(year, activity.ir_name)
			self.initialize_year(activity.location_name, year)
			projectId =  self.project_ids[year][activity.ir_name]
			self.country_aggregates[activity.location_name]['by_yr'][year]['all']['b'] += value
			self.country_aggregates[activity.location_name]['by_yr'][year]['dis'].append({
					'otc_id': projectId, #activity.ir_id,
					'otc_sfx': activity.ir_id[-3:],
					'pcr_id': activity.pcr_id,
					'sdt': self.format_date(activity.ir_start_date),
					'edt': self.format_date(activity.ir_end_date),
					#'as_of': , # because this is called after the transactions were procesesd in process_xml, this will be accurate
					'b': value,
					'description' : activity.description
				})

		self.disbursement_ct += 1

	def format_date(self, dateStr):
		return datetime.datetime.strptime(dateStr,"%Y-%m-%d").strftime("%m-%d-%y")


	def assign_donor_id(self, data):
		if data['donorCode'] not in self.donor_ids.keys():
			self.donor_ids[data['donorCode']] = data['donorName']

	def get_donor_id(self, name):
		if name not in self.donor_names.keys():
			self.donor_names[name] = self.unique_id_counter
			self.unique_id_counter += 1
		return self.donor_names[name]

	def passes_sanity_check(self, lineData):
		if (lineData['type'] == 'IF') or (lineData['type'] == 'C' and (lineData['donorName'] == None) and (lineData['donorCode'] == None)):
			#print "Commitment is missing donor", lineData['country'], lineData['sector'],lineData['year'] 
			return False

		return True

	def generate_years_available_file(self):
		f = open(os.path.join(self.output_dir,'years.json'),'w')
		json.dump(list(set(self.years)),f )
		f.close()

	def generate_pcr_ids_file(self):
		f = open(os.path.join(self.output_dir, 'pcr_ids.json'),'w')
		#ids_to_pcrs = dict((value, key) for key, value in self.pcr_ids.iteritems())
		#json.dump(ids_to_pcrs,f)

		#for pcr_id in filter(lambda x: len(self.pcr_ids[x]) > 1, self.pcr_ids.keys()):
			#print pcr_id

		json.dump(self.pcr_ids, f)
		f.close()

	def generate_outcome_ids_file(self):

		for year, year_projects in self.project_ids.iteritems(): 
			f = open(os.path.join(self.output_dir, str(year), 'output_names.json'),'w')
			x = dict((value, key) for key, value in year_projects.iteritems())
			json.dump(x,f)
			f.close()	

	def generate_donor_and_sector_ids_file(self):
		# swap keys and values
		f = open(os.path.join(self.output_dir,'donor_and_sector_ids.json'),'w')
		ids_to_pcrs = {} 
		ids_to_pcrs['sectors'] = self.sector_ids 
		ids_to_pcrs['donors'] = self.donor_ids 
		json.dump(ids_to_pcrs,f)
		f.close()	


	def generate_donor_category_map_file(self):
		for dc in self.donor_categories:
			self.donor_categories[dc] = list(self.donor_categories[dc])
		f =open( os.path.join(self.output_dir, 'donor_categories.json'),'w')

		json.dump(self.donor_categories, f)
		f.close()

	def generate_all_countries_year_file(self, year, sectorOrDonor):
		year_buffer = []
		#print "Generating all countries files for", year, self.output_dir, sectorOrDonor
		f = open(os.path.join( self.output_dir, str(year), sectorOrDonor + ".json"),'w')
		
		for country in self.country_aggregates.values():
			country_dict = {
				'name': country['name'],
				'lat': country['lat'],
				'lng': country['lng']		
			}
			if year in country['by_yr'].keys():
				country_dict[sectorOrDonor] = {} 

				for sectorId,sectorData in country['by_yr'][year][sectorOrDonor].iteritems():
					if sectorId != 'otc_n':
						projects = sectorData.pop('otc')
						s = sectorData.copy()
						#s['id'] = sectorId
						country_dict[sectorOrDonor][sectorId] = s
						sectorData['otc'] = projects
				country_dict['all'] = country['by_yr'][year]['all']
				year_buffer.append(country_dict)
		json.dump(year_buffer, f)
		f.close()


	def generate_all_countries_file(self):

		for year in self.years:
			yearOutputDir = os.path.join(self.output_dir,str(year))
			if os.path.isdir(yearOutputDir) != True:
				os.mkdir(yearOutputDir)
			self.generate_all_countries_year_file(year, 'sct')
			self.generate_all_countries_year_file(year, 'dnr')

	def generate_country_file(self, country):
		f = open(self.country_output_filename(country['name']),'w')
		json.dump(country, f)
		
		f.close()

	def generate_country_year_outputs_file(self, country_name, year, country_data):
		outputs = {}
		for sct in country_data['sct']:
			if sct == 'otc_n': 
				continue
			for output in country_data['sct'][sct]['otc']:
				unique_output_id = output['pcr_id'] + '/' + output['otc_sfx']
				if unique_output_id not in outputs.keys():

					outputs[unique_output_id] = {
						'sdt': output['sdt'],
						'edt': output['edt'],
						'otc_id': output['otc_id'],
						'pcr_id': output['pcr_id'],
						'otc_sfx': output['otc_sfx'],
						'as_of': self.max_as_of_date,#output['as_of'],
						'b': 0,
						'sct': {'all': 0},
						'dnr': {'all': 0},
						'description' : output['description']
					}
		
				if sct not in outputs[unique_output_id]['sct'].keys():
					outputs[unique_output_id]['sct'][sct] = 0
				outputs[unique_output_id]['sct'][sct] += output['e']
				# handle exception, By Rahul D. @ 220615
				try:
					outputs[unique_output_id]['sct']['all'] = self.country_year_expenses[year][country_name][unique_output_id]
				except:
					#print "Key ("+unique_output_id+") error with : " +country_name 
					pass
				
		#for unique_output_id in outputs:
		#\	if outputs[unique_output_id]['sct']['all'] < 0:
		#		print 'negative expense', year, country_name, unique_output_id, outputs[unique_output_id]['sct']['all'] 
		for dnr in country_data['dnr']:
			if dnr == 'otc_n':
				continue
			for output in country_data['dnr'][dnr]['otc']:
				unique_output_id = output['pcr_id'] + '/' + output['otc_sfx']
				if unique_output_id not in outputs.keys():
					outputs[unique_output_id] = {
						'sdt': output['sdt'],
						'edt': output['edt'],
						'otc_id': output['otc_id'],
						'pcr_id': output['pcr_id'],
						'otc_sfx': output['otc_sfx'],
						'b': 0,
						'as_of': self.max_as_of_date,#output['as_of'],
						'sct': {'all': 0},
						'dnr': {'all': 0},
						'description' : output['description']	
					}
				if dnr not in outputs[unique_output_id]['dnr'].keys():
					outputs[unique_output_id]['dnr'][dnr] = 0
				outputs[unique_output_id]['dnr'][dnr] += output['c']
				outputs[unique_output_id]['dnr']['all'] += output['c']

		#for unique_output_id in outputs:
		#	if outputs[unique_output_id]['dnr']['all'] < 0:
		#		print 'negative commitment', year, country_name, unique_output_id, outputs[unique_output_id]['dnr']['all'] 
		for dis in country_data['dis']:
			unique_output_id = dis['pcr_id'] + '/' + dis['otc_sfx']
			if unique_output_id not in outputs.keys():
				outputs[unique_output_id] = {
					'sdt': dis['sdt'],
					'as_of': self.max_as_of_date,#dis['as_of'],
					'edt': dis['edt'],
					'otc_id': dis['otc_id'], #unique_output_id,
					'pcr_id': dis['pcr_id'],
					'otc_sfx': dis['otc_sfx'],
					'b': 0,
					'sct': {},
					'dnr': {},
					'description' : 'description text'	
				}	
			outputs[unique_output_id]['b'] += dis['b']

		f = open(self.country_output_filename(country_name, year),'w')
		country_data_dump = {
			'year': country_data['year'],	
			'outputs': outputs.values()
		}
		json.dump(country_data_dump, f)
		f.close()
	def generate_country_year_file(self, country_name, year, country_data):
		f = open(self.country_output_filename(country_name, year),'w')
		all_data = country_data.pop('all')


		for k, v in all_data.iteritems():
			country_data[k] = v
		outputs = []
		for sct in country_data['sct']:
			if sct != 'otc_n':
				for otc in country_data['sct'][sct]['otc']:
					otc['sct_id'] = sct
					if otc not in outputs:
						outputs.append(otc) 
		for dnr in country_data['dnr']:

			if dnr != 'otc_n':
				for otc in country_data['dnr'][dnr]['otc']:
					otc['dnr_id'] = dnr
					if otc not in outputs:
						outputs.append(otc)
		for dis in country_data['dis']:
			if dnr != 'otc_n':
				for otc in country_data['dis']:
					if otc not in outputs:
						outputs.append(otc)

		country_data_dump = {
			'year': country_data['year'],	
			'outputs': outputs
		}
		#print country_name, year, "outcome count:",len(outputs)
		self.sector_otc += len(outputs)

		donor_outputs = []
		for dnr in country_data['dnr']:
			if dnr != 'otc_n':
				for otc in country_data['dnr'][dnr]['otc']:
					otc['dnr_id'] = dnr
					if otc not in donor_outputs:
						donor_outputs.append(otc)
		self.donor_otc += len(donor_outputs)

		json.dump(country_data_dump, f)
		f.close()


	def use_original_activity_sums_for_expenses(self):

		#self.country_aggregates[country]['by_yr'][year]['all']['e'] += amount

		for country in self.country_aggregates:
			for year in self.country_aggregates[country]['by_yr']:
				#print str(len(self.country_aggregates[country]['by_yr'][year]['sct'])) + " => " + str(year)
				if len(self.country_aggregates[country]['by_yr'][year]['sct']) > 0:
					self.country_aggregates[country]['by_yr'][year]['all']['e'] = 0
					for output, amount in self.country_year_expenses[year][country].iteritems():
						#print str(year) + " => " + output + " => " + str(amount)
						self.country_aggregates[country]['by_yr'][year]['all']['e'] += amount




	def final_calculations(self):

		# count number of unique outcomes at pcr level
		# count number of unique outcomes at sector level
		# this should equal the sum of the unique outcomes at pcr level for this sector
		# count number of unique outcomes at donor level
		# this should equal the sum of the unique outcomes at pcr level for this sector
		# count number of unique outcomes at country-year level
		# this should equal the sum of the unique outcomes at sector level and at donor level 
		self.years = list(set(self.years)) # make sure this is a unique file

		self.use_original_activity_sums_for_expenses()
		try:
			self.max_as_of_date = self.max_as_of_date.strftime("%m-%d-%y")
		except:
			#print "As of date not found => " + country_name + " : for year : " + str(year)
			self.max_as_of_date = ""
			pass
		for country_name, country_data in self.country_aggregates.iteritems():
			for year, year_data in country_data['by_yr'].iteritems():
				year_as_of = None 
				sector_otc = set()
				donor_otc = set()
				for sectorId, sector_data in year_data['sct'].iteritems():
					sector_data['otc_n'] = len(sector_data['otc']) 

					#sector_data['as_of'] = max(map(lambda x: x['as_of'], sector_data['otc']))
					for output in sector_data['otc']:
						sector_otc.add(output['pcr_id'] + '/' + output['otc_sfx'])
						output['as_of'] = self.max_as_of_date 

					#if not year_as_of or year_as_of < sector_data['as_of']:
					#	year_as_of = sector_data['as_of']
					sector_data['as_of'] = self.max_as_of_date 
				for donorId, donor_data in year_data['dnr'].iteritems():
					donor_data['otc_n'] = len(donor_data['otc']) 
					#donor_data['as_of'] = max(map(lambda x: x['as_of'], donor_data['otc']))

					for output in donor_data['otc']:
						donor_otc.add(output['pcr_id'] + '/' + output['otc_sfx'])
						output['as_of'] = self.max_as_of_date 

					#if not year_as_of or year_as_of < donor_data['as_of']:
					#	year_as_of = donor_data['as_of']
					donor_data['as_of'] = self.max_as_of_date
				#year_data['sct']['otc_n'] = sum(map(lambda x: x['otc_n'], year_data['sct'].values()))
				#year_data['dnr']['otc_n'] = sum(map(lambda x: x['otc_n'], year_data['dnr'].values()))
				#year_data['all']['otc_n'] = year_data['dnr']['otc_n'] + year_data['sct']['otc_n']
				year_data['all']['otc_n'] = len(sector_otc) 

				year_data['sct']['otc_n'] = len(sector_otc) 
				year_data['dnr']['otc_n'] = len(donor_otc) 

				#for d in year_data['dis']:
				#	if not year_as_of or d['as_of'] > year_as_of:
				#		year_as_of = d['as_of']
				#	d['as_of'] = d['as_of'].strftime('%m-%d-%y')

				year_data['all']['as_of'] = self.max_as_of_date

	def generate_every_country_file(self):
		for country in self.country_aggregates.values():
			#print "Generating files for",country['name'],
			for year in country['by_yr'].keys():
				#print year
				self.generate_country_year_outputs_file(country['name'], year, country['by_yr'][year])	
				#self.generate_country_year_file(country['name'], year, country['by_yr'][year])

 

	def count_countries(self, line):
		country = line[self.headerMap['COUNTRY']]
		if country not in self.countries:
			self.countries.append(country)
	def generate_list_of_countries(self):
		f = open('countries.txt','w')
		#json.dump(sorted(self.countries), f)
		f.write("\n".join(sorted(self.countries)))
		f.close()
	

	def process_xml(self, transaction, currentActivityObj):
		#if transaction.year < 2014:
			#print str(transaction.year) + " == " + transaction.transaction_type
			
		if transaction.region in Activity.region_blacklist:
			return False

		donor_code = self.get_donor_id(transaction.provider)
		lineData = {
			'type' : transaction.transaction_type,
			'country' : transaction.location_name,
			'year' : transaction.year,
			'pcrName' : transaction.pcr_name,
			'pcrId': transaction.pcr_id,
			'outputId': transaction.ir_id,
			'sector' : transaction.sector,
			'donorName' : transaction.provider,
			'donorCode': donor_code, # none in the XML, have to generate my own
			'startDate' : transaction.ir_start_date, 
			'endDate' : transaction.ir_end_date, 
			'projectName': transaction.ir_name,
			'projectStartDate' : transaction.ir_start_date, 
			'projectEndDate': transaction.ir_end_date, 
			'lat': transaction.latitude,
			'lng': transaction.longitude,
			#'asOfDate': transaction.as_of_date,
			'amount': transaction.amount ,
			'description' : currentActivityObj.description
		}

		if not self.passes_sanity_check(lineData):
			#print "Sanity check failed for line",line 
			return False 


		self.initialize_country(lineData['country'], lineData['lat'], lineData['lng'])
		self.initialize_year(lineData['country'], lineData['year'])
		self.initialize_sector_or_donor(lineData, transaction.donor_category)
		self.initialize_project(lineData['year'], lineData['projectName'])
		self.initialize_pcr(lineData['pcrId'], lineData['pcrName'])
		self.add_project_outcome(lineData)

	def sanity_check_line(self, line):
		lineData = {
			'type' : line[self.headerMap['TYPE']],
			'country' : line[self.headerMap['COUNTRY']],
			'year' : line[self.headerMap['YEAR']],
			'outputId': line[self.headerMap['WBS_ELEMENT_EX']],
			'amount': float(line[self.headerMap['AMOUNT']].strip('" ').replace(',',''))
		}
		if lineData['type'] == 'E' and lineData['amount'] < 0:
			error_line = ",".join(['negative expense'] + line)
		else:
			error_line = ""


		return error_line

	def sanity_check_aggregates(self, line, unique_outputs, countries):

		lineData = {
			'type' : line[self.headerMap['TYPE']],
			'country' : line[self.headerMap['COUNTRY']],
			'year' : line[self.headerMap['YEAR']],
			'outputId': line[self.headerMap['WBS_ELEMENT_EX']],
			'amount': float(line[self.headerMap['AMOUNT']].strip('" ').replace(',',''))
		}

		output_key = (lineData['outputId'],lineData['year'], lineData['type'])
		if output_key not in unique_outputs.keys():
			unique_outputs[output_key] = []

		unique_outputs[output_key].append(",".join(['duplicate output for ' + "\"({0})\"".format("-".join(output_key)) ] + line))

		if lineData['country'] not in countries.keys():
			countries[lineData['country']] = {}
		if lineData['year'] not in countries[lineData['country']].keys(): 
			countries[lineData['country']][lineData['year']] = {
				'commitment' : 0,
				'expense' : 0,
				'planned disbursement':0
			}
		if lineData['type'] == 'C':
			countries[lineData['country']][lineData['year']]['commitment'] += lineData['amount']
		elif lineData['type'] == 'E':
			countries[lineData['country']][lineData['year']]['expense'] += lineData['amount']
		elif lineData['type'] == 'D':
			countries[lineData['country']][lineData['year']]['planned disbursement'] += lineData['amount']


	def sanity_check(self):
		unique_outputs = {}
		countries = {}
		sanity_check_file = open('sanity_check.csv','w')
		error_lines = []
		for iatiFileName in self.input_file_names:
			#print "About to open",iatiFileName
			lineNumber = 0
			with open(iatiFileName, 'Ur') as f:
				csvreader = csv.reader(f, delimiter=',')
				for line in csvreader:
					if lineNumber == 0:
						self.set_header_map(line)
					else:
						self.sanity_check_aggregates(line, unique_outputs, countries)
						error_line = self.sanity_check_line(line)
						if error_line:
							error_lines.append(error_line)
					lineNumber += 1
		duplicate_outputs = map(lambda y: "\n".join(y), filter(lambda x: len(x) > 1, unique_outputs.values()))
		#print "Duplicate output count",len(duplicate_outputs)
		#print "Total output count",len(unique_outputs)
		exceeds_disbursement = []
		for country_name, country in countries.iteritems():
			for year in country:
				if (country[year]['commitment'] + country[year]['expense']) > country[year]['planned disbursement']:
					exceeds_disbursement.append(",".join(map(lambda x: str(x), [  'exceeds disbursement', "\"{0}\"".format(country_name), year,'commitment', country[year]['commitment'] , 'planned disbursement', country[year]['planned disbursement'],'expense', country[year]['expense']])))

		sanity_check_file.write("\n".join(exceeds_disbursement))
		sanity_check_file.write("\n".join(duplicate_outputs))
		sanity_check_file.write("\n".join(error_lines))
		sanity_check_file.close()
