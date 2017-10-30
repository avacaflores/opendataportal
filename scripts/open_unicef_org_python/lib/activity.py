import xml.etree.ElementTree as ET
import os
from transaction import Transaction
import copy
import region_names
import sector_names
#import regions_code_names # By Rahul D. @19May15
import programme_code_name # By Rahul D. @21May15
from datetime import datetime
import json
from pprint import pprint
import sys
import logging

class Activity:
	region_blacklist = region_names.load_region_blacklist()
	sector_name_mapping = sector_names.load()
	region_name_map = region_names.load_region_names()
	programme_area_mapping = programme_code_name.load() # By Rahul D. @21May15
	#regions_code_mapping = regions_code_names.load() # By Rahul D. @19May15
	
	def __init__(self, activity_xml):
		self.as_of_date = None
		self.activity_xml = activity_xml

		# parse the activity	
		self.parse()

	''' Function : getRelActInfo
	Purpose : Extract related activity info from related-activity tag, As per change in 201 upgrade
	Added By : Rahul D.
	Added Date : 01July15 '''
	def getRelActInfo(self, rActRef=''):
		if rActRef is not None:
			rActRef = rActRef.strip()
			data = rActRef.split(' ')
		try:
			if len(data) >= 1:
				rel_act_id = data[0]
				data.pop(0)
				if len(data) > 0:
					rel_act_name = ' '.join(data)
				else:
					rel_act_name = None
				info = {'rel_act_id' : rel_act_id, 'rel_act_name' : rel_act_name}
		except KeyError:
			info = {'rel_act_id' : None, 'rel_act_name' : None}
			pass
		
		return info
	# end, getRelActInfo

	def parse(self):
		outcome_programmes = [] #By Rahul D. @22May15
		self.last_updated = datetime.strptime(self.activity_xml.attrib['last-updated-datetime'], '%Y-%m-%dT%H:%M:%S')
		self.planned_disbursements = {}
		planned_disbursement_list_xml = self.activity_xml.findall('./planned-disbursement')
		for pd_xml in planned_disbursement_list_xml:
			year = int(pd_xml.find('./period-end').attrib['iso-date'].split('-')[0])
			value = float(pd_xml.find('./value').text)
			self.planned_disbursements[year] = value
			#as_of_date = pd_xml.find('value').attrib['value-date']
			try:
				# as_of_date = pd_xml.attrib['updated'] By Rahul D. @18May15
				as_of_date = pd_xml.find('value').attrib['value-date']
				new_as_of_date = datetime.strptime(as_of_date, '%Y-%m-%d')
				if not self.as_of_date or new_as_of_date > self.as_of_date:
					self.as_of_date = new_as_of_date
				#as_of_dates.add(as_of_date)
			except ValueError:
				pass
		# end planned-disbursement
			
		self.budgets = {}
		for bd_xml in self.activity_xml.findall('./budget'):
			year = int(bd_xml.find('./period-end').attrib['iso-date'].split('-')[0])
			value = float(bd_xml.find('./value').text)
			self.budgets[year] = value
		# end budget
			
		self.ir_name = self.activity_xml.findall('./title/narrative')[0].text #By Rahul D. @18May15			
		self.description = 	self.activity_xml.find('description[@type="1"]').find('narrative').text # added by vijay @29 Aug 2017 
		self.ir_id =  self.activity_xml.findall('./iati-identifier')[0].text.split('-')[-1] # correct output id?
		self.ir_code = self.activity_xml.findall('./iati-identifier')[0].text

		# 2690/A0/05/042/426
		
		self.region = self.activity_xml.findall('./recipient-region/narrative')[0].text # By Rahul D. @19Mayl15
		self.region_long_name = region_names.region_map(self.activity_xml.findall('./recipient-region/narrative')[0].text, Activity.region_name_map) # By Rahul D. @19Mayl15

		if hasattr(self.activity_xml.find('.//location/name/narrative'), 'text'):
			self.location_name = self.activity_xml.find('.//location/name/narrative').text #By Rahul D. @18May15
		else :
			self.location_name = ""
		
		#self.longitude = self.activity_xml.find('.//location/coordinates').attrib['longitude'] By Rahul D. @18May15
		#self.latitude = self.activity_xml.find('.//location/coordinates').attrib['latitude'] By Rahul D. @18May15

		self.cords = self.activity_xml.find('.//location/point/pos').text # By Rahul D. @18May15
		
		# Start set lat and lng as 201 requirement
		self.longitude = "" # By Rahul D. @18May15
		self.latitude = "" # By Rahul D. @18May15
		if self.cords is not None:
			data_cords = self.cords.split(' ')
		try:	
			if len(data_cords) == 2:
				self.latitude = data_cords[0]
				self.longitude = data_cords[1]
		except KeyError:
			pass
		# End set lat and lng as 201 requirement
		try:
			self.pcr_name = self.activity_xml.findall('.//related-activity')[0].text # By Rahul D. @01-July-15
			self.pcr_id = self.activity_xml.findall('.//related-activity')[0].attrib['ref']
			# By Rahul D. @01July15
			pcrInfo = self.getRelActInfo(self.pcr_id)
			self.pcr_name = pcrInfo['rel_act_name']
			self.pcr_id = pcrInfo['rel_act_id']
			# End
		except:
			self.pcr_name = None
			self.pcr_id = None
		# self.ir_start_date = self.activity_xml.find(".//activity-date[@type='start-actual']").attrib['iso-date'] # start-actual, confirmed 
		# self.ir_end_date = self.activity_xml.find(".//activity-date[@type='end-actual']").attrib['iso-date'] # start-actual, confirmed 

		self.ir_start_date = self.activity_xml.find(".//activity-date[@type='2']").attrib['iso-date'] # start-actual, confirmed 
		self.ir_end_date = self.activity_xml.find(".//activity-date[@type='4']").attrib['iso-date'] # end-actual, confirmed 

		self.year = self.ir_start_date.split('-')[0] #  this was provided in the CSV but inferred here

		transaction_xml_list = self.activity_xml.findall('./transaction')
		self.transaction_list = []
		self.transaction_list_sectors = []
		self.expense_transactions = {} # indexed by year; expense is separate from transaction list because the sector percentages used to calculate individual amounts don't always sum up to 100 and should not be used at the output and pcr levels
		self.expense_transactions_sectors = {}
		# end sector_xml_list 
		for tx_xml in transaction_xml_list:
			tx = Transaction(tx_xml, self)
			# Added By : Rahul D. @26-06-15, Purpose : Get all transaction's sectors before 2014
			if tx.year < 2014:
				if tx.transaction_type == 'E':				
					sector_vocabulary_e	= tx_xml.findall('sector')[0].attrib['vocabulary']
					sector_code 		= tx_xml.findall('sector')[0].attrib['code']
					try:
						if sector_vocabulary_e != '99': # read only sectors before 2014
							tx1 			= copy.deepcopy(tx)
							tx1.sector 		= sector_code
							tx1.sector_name = Activity.sector_name_mapping[sector_code]
							tx1.amount 		= tx.amount
							self.transaction_list_sectors.append(tx1)
					except KeyError:
						pass
				elif tx.transaction_type != 'IF':
					self.transaction_list_sectors.append(tx)				
			# end if block
			if tx.transaction_type == 'E':				
				sector_vocabulary	= tx_xml.findall('sector')[0].attrib['vocabulary']
				programme_area 		= tx_xml.findall('sector')[0].attrib['code']
				original_amt 		= tx.amount
				
				if sector_vocabulary == '99' and tx.year >= 2014: # read only programme after of 2014
					if tx.year not in self.expense_transactions:
						self.expense_transactions[tx.year] = [] 
					self.expense_transactions[tx.year].append(tx)

				if sector_vocabulary != '99' and tx.year < 2014: # read only sectors of before 2014
					if tx.year not in self.expense_transactions_sectors:
						self.expense_transactions_sectors[tx.year] = [] 
					self.expense_transactions_sectors[tx.year].append(tx)

				# Start : introduce sector at transaction level
				try:
					if sector_vocabulary == '99': # read only programme
						tx2 			= copy.deepcopy(tx)
						tx2.sector 		= programme_area
						tx2.sector_name = Activity.programme_area_mapping[programme_area]
						tx2.amount 		= original_amt
						self.transaction_list.append(tx2)
				except KeyError: # handle strange programme areas
						if sector_vocabulary == '99': # read only programme
							tx2 = copy.deepcopy(tx)
							if tx.year > 2014:
								tx2.sector = 'PA00-00'
								tx2.sector_name = 'Programme area-TBD'
							else:
								tx2.sector = 'PA00-00'
								tx2.sector_name = 'N/A-Programme area'
							tx2.amount = original_amt
							self.transaction_list.append(tx2)
						pass
				# End : introduce sector at transaction level
			elif tx.transaction_type != 'IF':
				self.transaction_list.append(tx)			