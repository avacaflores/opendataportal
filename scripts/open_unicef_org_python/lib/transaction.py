from datetime import datetime
import xml.etree.ElementTree as ET
import names
import donor_categories
import os
import consolidated_donors
from pprint import pprint
import sys

class Transaction:
	donor_category_mapping = donor_categories.load(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..', 'mappings/donor_categories.csv'))
	# By Rahul D. @19May15
	transaction_types_mapping = {'2':'C', '3':'D', '4':'E', '1':'IF', '5':'IR', '6':'LR', '7':'R', '8':'QP', '9':'QS', '10':'CG'}
	# Consolidate donors of multiple dept into one, By Rahul D. @ 25-06-15
	consolidate_donors_mapping = consolidated_donors.load()
	
	'''consolidate_donors_mapping = {
		'Canada' : ["canada/iha", "canada/gid"],
		'United States of America' : ["national center for hiv/aids", "united states of america", "usa usaid", "usa cdc", "usa (usaid) ofda", "usa (state) bprm", "usa (state) bpma", "usa (inl)gtip", "usa department of state nea", "usa inl", "usaid/food for peace", "united states of america"],
		'Democratic Republic of the Congo' : ["ministry of health - dr congo"],
		'Central African Republic' : ["ministry of health - car"],
		'Japan' : ["Japan International Cooperation Age"],
		'Sweden' : ["sida - sweden"]			
	}'''
	# end
	
	#donors_missing_categories = set()
	def __init__(self, transaction_xml,activity,  use_donor_category=False):
		self.latitude = activity.latitude
		self.longitude = activity.longitude
		self.region = activity.region
		self.location_name = activity.location_name
		#self.provider = names.alias(transaction_xml.findall("provider-org/narrative")[0].text ) # By Rahul D. @19May15
		
		provider_temp = transaction_xml.findall("provider-org/narrative")[0].text
		
		if provider_temp is not None:
			self.provider = names.alias(provider_temp)
			# print self.provider.encode('utf-8')
		else:
			self.provider = names.alias("")
			# print self.provider

		self.donor_category = self.get_donor_category(self.provider)

		#self.original_name = None
		self.ir_id = activity.ir_id
		self.ir_name = activity.ir_name
		self.ir_code = activity.ir_code

		self.ir_start_date = activity.ir_start_date
		self.ir_end_date = activity.ir_end_date

		self.pcr_id = activity.pcr_id
		self.pcr_name = activity.pcr_name

		self.sector = None
				
		#self.receiver = transaction_xml.findall("receiver-org") # By Rahul D. @22May15		
		self.receiver = transaction_xml.findall("receiver-org/narrative") # By Rahul D. @22May15		
		if len(self.receiver) > 0:
			self.receiver = self.receiver[0].text
		else:
			self.receiver = ""

		self.amount = transaction_xml.findall("value") 
		if len(self.amount) > 0:
			try:
				self.amount = float(self.amount[0].text)
			except ValueError:
				print "Invalid amount value", transaction_xml.text
				self.amount = None
		else:
			self.amount = None
			
		# By Rahul D. @19May15
		self.transaction_type = Transaction.transaction_types_mapping[transaction_xml.findall('transaction-type')[0].attrib["code"]]

		# Consolidate donors of multiple dept into one, By Rahul D. @250615
		if self.transaction_type=='C' and (self.donor_category).lower()=='governments':
			for donor_key in Transaction.consolidate_donors_mapping:
				if (self.provider).lower() in Transaction.consolidate_donors_mapping[donor_key]:
					self.provider = donor_key
		
			#print self.donor_category +" => "+ self.provider +" => "+ self.transaction_type
		# end
		self.year = transaction_xml.findall('transaction-date')
		self.as_of_date = None
		if len(self.year) > 0:
			try:
				self.year = datetime.strptime(self.year[0].attrib['iso-date'], "%Y-%m-%d").year
			except:
				self.year = None
			try:
				as_of_date = transaction_xml.findall('transaction-date')	
				self.as_of_date = datetime.strptime(as_of_date[0].attrib['iso-date'], "%Y-%m-%d") # note this is a datetime object, not a string
			except:
				self.as_of_date = None
		else:
			self.year = None
		
	def get_sector_name(self, sector_id):
		return Transaction.sector_name_mapping[sector_id]


	def get_donor_category(self, donor_code):
		try:
			return Transaction.donor_category_mapping[donor_code]
		except KeyError:
			#Transaction.donors_missing_categories.add(donor_name)
			return donor_code 		
	def formatted(self):
		return ",".join(map(lambda x: str(x), ['year:',self.year, 'amount:', self.amount, 'type:', self.transaction_type, 'provider:',self.provider, 'receiver:',self.receiver]))
	def valid(self):
		current_year = datetime.now().year 
		if self.year > current_year:
			return False

		if (self.year == None) or (self.amount == None and self.transaction_type == 'Commitment') or (len(self.provider) < 1 and len(self.receiver) < 1) or (self.transaction_type == None):
			print "Invalid transaction: ", self.formatted()
			return False
		return True

