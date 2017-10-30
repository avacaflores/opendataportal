import subprocess
import argparse
import json
import lib
from lib import download_state
from lib.download_state import DownloadState
import os
import sys
def main():

	parser = argparse.ArgumentParser(description = "Download and generate json files for IATI visualization")
	parser.add_argument("--output-dir", help="output-dir", default=None)
	parser.add_argument("--input-dir", help="input-dir", default='source_data')
	parser.add_argument("--skip-download", help="true if skipping download", action='store_true')
	parser.add_argument("--status-file", help="download state file", default="./last_download_state.json")

	args = parser.parse_args() 

	current_dir = os.path.dirname(os.path.abspath(__file__))

	download_script_path = os.path.join(current_dir, 'download_files.py')
	generate_flow_file_script_path = os.path.join(current_dir, 'generate_flow_files.py')
	generate_summary_files_script_path = os.path.join(current_dir, 'generate_summary_files.py')
	generate_table_files_script_path = os.path.join(current_dir, 'generate_table_files.py')
	generate_indicator_files_script_path = os.path.join(current_dir, 'generate_indicator_files.py')


	if not args.skip_download:
		print 'Downloading files and saving to', args.input_dir
		p = subprocess.Popen("python {0} --output-dir {1} --status-file {2}".format(download_script_path, args.input_dir, args.status_file).split(" "))
		p.wait()
		# Download state does not work because the "data_updated" field does not accurately reflect when data gets updated
		#download_state = DownloadState(args.status_file)
		#if not download_state.last_run_had_new_data:
		#	print "No new data, not updating files"
		#	return
	print 'Generating files from files in',args.input_dir,'and writing output to', args.output_dir
	p = subprocess.Popen("python {0} --output-dir {1}/flow --input-dir {2}".format(generate_flow_file_script_path, args.output_dir, args.input_dir).split(" "))
	p.wait()
	p2 = subprocess.Popen("python {0} --output-dir {1}/summary --input-dir {2}".format(generate_summary_files_script_path, args.output_dir, args.input_dir).split(" "))
	p2.wait()
	p3 = subprocess.Popen("python {0} --output-dir {1}/table --input-dir {2}".format(generate_table_files_script_path, args.output_dir, args.input_dir).split(" "))
	p3.wait()

	p4 = subprocess.Popen("python {0} --output-dir {1}/table/indicators --input-dir {2}".format(generate_indicator_files_script_path, args.output_dir, args.input_dir).split(" "))
	p4.wait()

if __name__ == '__main__':
	main()

