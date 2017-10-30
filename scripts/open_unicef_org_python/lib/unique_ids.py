class UniqueIds:
	def __init__(self):
		self.ids = {} 
		self.types = {}
		self.alias = {}
		self.nextId = 0
	def set(self, uid, id_type, alias=None):
		new_id = uid
		if (uid in self.types) and (self.types[uid] != id_type): # donors and countries may have the same name, but should be counted differently
			new_id = "{0} ({1})".format(uid, id_type)	

		if self.get(new_id) == None:
			self.ids[new_id] = self.nextId 
			self.types[new_id] = id_type
			if alias != None:
				self.alias[new_id] = [alias]
			else:
				self.alias[new_id] = []
			self.nextId += 1


		if alias != None and alias not in self.alias[new_id]:
			self.alias[new_id].append(alias)

		return self.ids[new_id]


	def get(self, id, id_type=None):
		if id in self.ids:
			if id_type == None or id_type == self.types[id]:
				return self.ids[id]
			else:
				new_id = "{0} ({1})".format(id, id_type)
				if new_id in self.ids:
					return self.ids[new_id]
		return None

	def reverse_get(self, unique_key):
		try:
			return self.ids.keys()[self.ids.values().index(unique_key)]
		except IndexError:
			return None
	def formatted_reverse_get(self, unique_key):
		try:
			id = self.ids.keys()[self.ids.values().index(unique_key)]
			formatted_result =  {'name': id, "id": self.ids[id], "type": self.types[id]}
			if len(self.alias[id]) > 0:
				formatted_result['internal_ids'] = self.alias[id]
			return formatted_result
		except IndexError:
			return None
	def formatted(self):
		return [{'name': id, "id": self.ids[id], "type": self.types[id]} for id in self.ids]

	def sector_ids(self):
		return map(lambda x: self.ids[x[0]], filter(lambda y: y[1] == 'sector', self.types.iteritems()) )
	def country_ids(self):
		return map(lambda x: self.ids[x[0]], filter(lambda y: y[1] == 'country', self.types.iteritems()) )
	def activity_ids(self):
		return map(lambda x: self.ids[x[0]], filter(lambda y: y[1] == 'activity', self.types.iteritems()) )
	def donor_ids(self):
		return map(lambda x: self.ids[x[0]], filter(lambda y: y[1] == 'donor', self.types.iteritems()) )