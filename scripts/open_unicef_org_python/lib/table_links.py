import os
import csv
import re
import shutil
import json
import output_manager
import xml.etree.ElementTree as ET
import urllib

class TableLinks:
	def __init__(self, output_dir):
		self.countries = {}
		self.headerMap = {}
		self.output_dir = os.path.join(output_dir,'links')
	def set_header_map(self, line):
		for field in line:
			self.headerMap[field.strip()] = line.index(field)
		#print self.headerMap

	def process(self, line):
		country = line[self.headerMap['Recipient Country (Country Name)']]
		links ={ 
			'Country Office Website': line[self.headerMap['Activity Website (URL)']],
			'Current Country Programme Document': line[self.headerMap['CPD English']],
			'CPD Extension': line[self.headerMap['CPD Extension']],
			'Most Recent Annual Report': line[self.headerMap['Annual Report']],
		}	
		if country in self.countries.keys():
			print "Repeating entry for", country
		self.countries[country] = links 

	def input_file_names(self):
		return [os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', "mappings/Links_utf8.csv")]

	def load_data(self):
		for iatiFileName in self.input_file_names():
			print "About to open",iatiFileName
			lineNumber = 0
			with open(iatiFileName, 'Ur') as f:
				csvreader = csv.reader(f, delimiter=',')
				for line in csvreader:
					if lineNumber == 0:
						self.set_header_map(line)
					else:
						self.process(line)
					lineNumber += 1

	def dump_data(self):
		output_manager.setup_directory(self.output_dir)
		#print 'writing to..',self.output_dir
		for country in self.countries:
			fname = os.path.join(self.output_dir,re.sub('[,/ ]','-',country.strip()) + ".json") 
			f = open(fname,'w')
			#print 'writing to..',fname
			json.dump(self.countries[country],f)
			f.close()
        
        ## below methods are added by vijay on
	## 14/10/2016 for adding document links from xml files
	def pickXml(self, xmlPath):
		tree = ET.parse(xmlPath)
		root = tree.getroot()
		iactivity = root.findall('iati-activity')
		document_link = iactivity[0].findall('document-link') # get first activity document-links
		doc_links_arr = []
		for document in document_link:
			# traverse all document-links one by one
			title = document.find('title')
			narrative = title.find('narrative').text # link text
			doc_url = document.attrib['url']
			mylink = {"url_text": narrative, "url": doc_url}
			doc_links_arr.append(mylink)
		return doc_links_arr
        
	def generate_json(self, output_path, doc_links_arr, country_name):
		# chnages in front end (js\data\iatiData.js) and (themes\openunicef\footer.php)
		mypath = os.path.join(output_path, country_name)
		mypath = mypath + '.json'
		if os.path.isfile(mypath):
			#print "found " + mypath
			#print "now appending"
			f = open(mypath)
			data = {}
			with f as data_file:
				data = json.load(data_file)
			f.close()
			f = open(mypath, "r+")
			data["document_links"] = doc_links_arr
			data = dict(data)
			json.dump(data, f)
			f.close()
		else:
			#print "not found " + mypath
			#print "now creating new"
			data = {}
			data['document_links'] = doc_links_arr
			f = open(mypath, "w")
			json.dump(data, f)
			f.close()

	def traverse_all_xmls(self):
		jsonPath = self.output_dir
		xmlPath = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..','source_data')
		#print "xmlPath"+xmlPath
	    
                #print "vijay"
                #print xmlPath
	    
                #doc_links_arr = {}
                #doc_links_arr = self.pickXml("/var/www/vhosts/data_staging/source_data/iatiActivity_India.xml")                
                #self.generate_json(jsonPath, doc_links_arr, "India")
		for subdir, dirs, files in os.walk(xmlPath):
			for file in files:            
					if file.endswith(".xml"):
						if file.find("iatiActivity_") > -1:
							country_nameArr = file.split("iatiActivity_")
							country_name = country_nameArr[1]
							country_name=urllib.unquote(country_name).decode('utf8') 
							country_name = country_name.replace(" ", "-")
							country_name = os.path.splitext(country_name)[0]
							doc_links_arr = {}
							doc_links_arr = self.pickXml(os.path.join(subdir, file))
							self.generate_json(jsonPath, doc_links_arr, country_name)
        
                        
