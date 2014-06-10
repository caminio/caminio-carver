module.exports = function( caminio, mongoose, namespace ){

  'use strict';

  namespace = namespace || 'webpages';

  return {
    langSchemaExtension: require('./mongoose/lang_schema_extension')( caminio, mongoose ),
    after: require('./lib/middleware')( caminio, namespace ).after,
    defaultLocals: require('./lib/middleware')(caminio, namespace ).defaultLocals
  };

};
