import argparse
import lib
from lib.table_view import TableView
from lib.table_links import TableLinks
from lib import output_manager
import subprocess
from pprint import pprint
import sys

def generate_table(output_dir, input_dir):
	output_manager.setup_directory(output_dir)
	l = TableLinks(output_dir)
	l.load_data()
	l.dump_data()
        l.traverse_all_xmls()

	u = TableView(output_dir, input_dir)

	u.load_xml_data(input_dir)
	u.output_download_links() # won't work unless we have individual country files, otherwise everything will link to the global file
	u.final_calculations()
	u.generate_all_countries_file()
	u.generate_every_country_file()
	u.generate_pcr_ids_file()
	u.generate_outcome_ids_file()
	u.generate_donor_and_sector_ids_file()
	u.generate_years_available_file()
	u.generate_donor_category_map_file()


if __name__ == '__main__':


	parser = argparse.ArgumentParser(description = "Generate table files")
	parser.add_argument("--input-dir", help="input-dir", default="source_data")
	parser.add_argument("--output-dir", help="output-dir", default='json/table')

	args = parser.parse_args() 

	generate_table(args.output_dir, args.input_dir)
