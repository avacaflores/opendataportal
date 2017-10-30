import urllib2
import httplib
import json
import os
import argparse
import datetime
import lib
from lib import output_manager
from lib import download_state
from lib.download_state import DownloadState

def get_last_updated(result):
	for extra in result['extras']:
		if extra['key'] == 'data_updated':
			return extra['value']
	return None

def download_all_files_available(output_dir, download_status_file_path):
	IATI_REGISTRY_API_UNICEF_ACTIVITY_FILES_URI = "http://iatiregistry.org/api/3/action/package_search?q=organization:unicef&start={offset}&rows={rows_per_page}"
	offset = 0
	rows_per_page = 100

	total_rows = None 
	rows_processed = None 

	url_to_filename = {}

	#download_state = DownloadState(download_status_file_path) 

	output_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), output_dir)
	while (total_rows > rows_processed) or (total_rows is None):
		try:
			api_url = IATI_REGISTRY_API_UNICEF_ACTIVITY_FILES_URI.format(offset=offset, rows_per_page=rows_per_page) 
			print "Getting",api_url

			try:
				response = urllib2.urlopen(api_url)
			except httplib.HTTPException:
				#download_state.add_download_error(api_url)
				continue

			response = json.load(response)	

			if not response["success"] :
				print "Bad response", api_url
			for result in response["result"]["results"]:
				urls = map(lambda x:  x["url"], filter(lambda x: "url" in x.keys() , result["resources"]	))

				data_updated_date = get_last_updated(result) 
				#file_has_new_data = download_state.update_last_updated_date(result['id'], data_updated_date)

				if total_rows == None:
					total_rows = int(response["result"]["count"])
					rows_processed = 0
				rows_processed += 1 

				#if not file_has_new_data: 
				#	print "		",result['title'],"did not change, skipping download"
				#	continue

				for url in urls:
					filename = url.split('/')[-1]
					print "		Getting:",url,"Saving as:",filename
					url_to_filename[url] = filename
					try:
						activity_file = urllib2.urlopen(url)
					except httplib.IncompleteRead:
						errors['errors']['download_error'].append(api_url)
						continue

					f = open(os.path.join(output_dir, filename),'w')
					f.write(activity_file.read())
					f.close()


			offset += 100 


		except urllib2.URLError as e:
			continue
			#download_state.add_download_error(api_url)
			#if hasattr(e, 'reason'):
			#	print "Couldn't reach '",api_url,"' (",e.reason,")"
			#elif hasattr(e, 'code'):
			#	print "Server returned error for'",api_url,"' (",e.code,")"

	#download_state.dump(download_status_file_path)

	mappings_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'mappings/filename_to_url.json')
	f = open(mappings_file,'w')
	json.dump(dict(zip(url_to_filename.values(), url_to_filename.keys())),f)
	f.close()
	print "Downloaded", rows_processed,"files"

if __name__ == '__main__':
	parser = argparse.ArgumentParser(description = "Download raw files from IATI registry")
	parser.add_argument("--output-dir", help="output directory", default="source_data")	
	parser.add_argument("--status-file", help="file recording state of last download", default="./last_download_state.json")	

	args = parser.parse_args()

	output_manager.setup_directory(args.output_dir)
	download_all_files_available(args.output_dir, args.status_file)
