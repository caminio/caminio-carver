module.exports = function( caminio, mongoose ){

  'use strict';

  return {
    langSchemaExtension: require('./mongoose/lang_schema_extension')( caminio, mongoose )
  };

};
