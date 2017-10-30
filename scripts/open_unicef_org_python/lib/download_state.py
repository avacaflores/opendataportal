import os
import json

class DownloadState:


	def __init__(self, filename=None):
		# set defaults
		self.last_updated_dates = {}
		self.errors = {
			'download_errors': []
		}
		self.has_new_data = False # this will be true if there are more or less packages than before, or if any of the packages has a different updated date
		self.current_num_package_ids = 0
		self.previous_number_of_package_ids = 0
		self.last_run_had_new_data = True

		# load from previous file, if any
		self.load(filename)


	def load(self,filename):
		if filename and (not os.path.isfile(filename)):
			return
		#print 'Loading',filename
		data = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..',filename)))
		self.last_updated_dates = data['last_updated']
		self.previous_number_of_package_ids = len(self.last_updated_dates)
		self.last_run_had_new_data = data['has_new']

	def add_download_error(self, url):
		self.errors['download_errors'].append(url)

	def update_last_updated_date(self, package_id, new_update_date):
		self.current_num_package_ids += 1
		if (package_id not in self.last_updated_dates) or (self.last_updated_dates[package_id] != new_update_date):
			self.has_new_data = True
			self.last_updated_dates[package_id] = new_update_date
			return True

		return False


	def dump(self, output_file_path):
		if self.previous_number_of_package_ids != self.current_num_package_ids:
			self.has_new_data = True

		output_dict = {
			'last_updated': self.last_updated_dates,
			'errors': self.errors,
			'has_new': self.has_new_data
		}
		f = open(output_file_path, 'w')
		json.dump(output_dict, f)
		f.close()

