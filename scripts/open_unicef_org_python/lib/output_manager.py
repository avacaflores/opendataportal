import shutil
import os

def setup_directory(dirname):
	cleanup_directory(dirname)
	create_directory(dirname)

def create_directory(dirname):
	if not os.path.isdir(dirname):
		os.mkdir(dirname)


def cleanup_directory(dirname):
	if os.path.isdir(dirname):
		#choice = raw_input("Delete directory {0}? (y/n)".format(dirname))
		#if choice == 'y':
		try:
			shutil.rmtree(dirname)
		except OSError as e:
			print e.strerror



