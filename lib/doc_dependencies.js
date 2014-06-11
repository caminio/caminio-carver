module.exports = function( content, compiler, resolve ){

  'use strict';

  var locals = compiler.options.locals;

  if( !locals.doc )
    return resolve( content );

  locals.ancestors.forEach(function(anc){
    compiler.dependencies({ doc: anc });
  });

  locals.children.forEach(function(child){
    compiler.dependencies({ doc: child });
  });

  locals.siblings.forEach(function(sibl){
    compiler.dependencies({ doc: sibl });
  });

  resolve(content);

};
