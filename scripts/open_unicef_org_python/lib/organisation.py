import xml.etree.ElementTree as ET
from datetime import datetime

class Organisation: 
	def __init__(self, organisation_xml):
		self.xml = organisation_xml
		self.parse()

	def parse(self):
		self.recipient_country_budgets = {}

		self.skipped = 0
		for rcb_xml in self.xml.findall('./recipient-country-budget'):
			country = rcb_xml.find('./recipient-country').text
			try:
				year = datetime.strptime(rcb_xml.find('./period-end').attrib['iso-date'], '%Y-%m-%d').year
			except:
				self.skipped += 1
				continue

			try:	
				value = float(rcb_xml.find('./value').text)
			except:
				self.skipped += 1
				continue
			if year not in self.recipient_country_budgets:
				self.recipient_country_budgets[year] = 0
			self.recipient_country_budgets[year] += value

