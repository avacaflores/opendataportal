import xml.etree.ElementTree as ET
import os
import json
import argparse
from datetime import datetime
import re
import lib
from lib import output_manager
from lib import names
from lib import unique_ids
from lib.flow_view import FlowView

from lib.activity import Activity
from lib import region_names

from pprint import pprint
import sys

def remove_comments_from_files(input_dir, country_file):	############## Changed
	file_name = os.path.join(input_dir, country_file)
	with open(file_name, 'rb') as infile:
		data = infile.read()
		data = data.replace("<!-- %UNICEF_INTERNAL_ELEMENT%", "")
		data = data.replace("%UNICEF_INTERNAL_ELEMENT% -->", "")
	with open(file_name, 'wb') as infile:
		infile.write(data)

def parse_files(input_dir, country_files, wv, unique_ids):
	for country_file in country_files:
		remove_comments_from_files(input_dir, country_file)	############## Changed
		country_root = ET.parse(os.path.join(input_dir,country_file))

		for activity_xml in country_root.findall('iati-activity'):
			activity = Activity(activity_xml)
			wv.parse_activity(activity,  unique_ids)

def output(output_dir, wv, unique_ids):
	wv.output(output_dir, unique_ids)

if __name__ == '__main__':


	parser = argparse.ArgumentParser(description = "Generate files for Flow Diagram")
	parser.add_argument("--input-dir", help="input-dir", default="source_data")
	parser.add_argument("--output-dir", help="output-dir", default='json/flow')

	args = parser.parse_args() 

	country_files = filter(lambda x: os.path.isfile(os.path.join(args.input_dir, x)), os.listdir(args.input_dir))

	#print "Source data:", args.input_dir,"Output directory:" ,args.output_dir

	donors = {}
	sectors = {}
	wv = FlowView()
	unique_id_map = unique_ids.UniqueIds()
	parse_files(args.input_dir, country_files, wv, unique_id_map)
	output(args.output_dir, wv, unique_id_map)



