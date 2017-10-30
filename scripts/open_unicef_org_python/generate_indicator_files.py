import argparse
import lib
from lib.indicators import Indicators
import subprocess
from pprint import pprint
import sys

def generate_indicators(output_dir, input_dir):
	
	I = Indicators(input_dir, output_dir);
	I.traverse_all_xmls();
	#print input_dir;
	#print output_dir;
	


if __name__ == '__main__':


	parser = argparse.ArgumentParser(description = "Generate table files")
	parser.add_argument("--input-dir", help="input-dir", default="source_data")
	parser.add_argument("--output-dir", help="output-dir", default='json/table')

	args = parser.parse_args() 

	generate_indicators(args.output_dir, args.input_dir)
