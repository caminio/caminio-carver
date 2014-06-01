module.exports.normalizeFilename = function normalizeFilename( str ){
  
  'use strict';

  return str
          .toLowerCase()
          .replace(/ä/g,'ae')
          .replace(/ü/g,'ue')
          .replace(/ö/g,'oe')
          .replace(/ß/g,'sz')
          .replace(/[^\w.]/g,'_');
};
