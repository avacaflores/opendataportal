'use strict';

define(function (require) {
  var _ = require('lodash');

  function OutputModel(data, measure, filter) {
    if (!(this instanceof OutputModel)) {
      return new OutputModel(data, measure, filter);
    }
    
    _.extend(this, _.pick(data, 'name', 'sdt', 'edt'));
    
    this.id = data.pcr_id + '/' + data.otc_sfx;
    this.description = data.description;
    
    if (measure === 'c' || measure === 'e') {
      var prop = (measure === 'c') ? 'dnr' : 'sct';

      if (!filter || filter === 'all') {
        this[measure] = data[prop].all;
      } else {
        try {
          this[measure] = data[prop][filter];
        } catch (e) {
          console.log('Unable to retrieve ' + filter + ' for measure ' + measure + ' from ' + this.name);
        }
      }
    } else {
      
      this.b = data.b;
      this.c = data.dnr.all;
      this.e = data.sct.all;

    }
    
    //console.log(data);

  }

  return OutputModel;
});
