module.exports = function( caminio, namespace ){

  'use strict';

  var _           = require('lodash');
  var join        = require('path').join;
  var fs          = require('fs');
  var RSVP        = require('rsvp');

  return function( res ){
 
    return function( content, compiler, resolve ){

      new RSVP.Promise( function( resolve ){ resolve( content ); })
        .then( pluginTranslations )
        .then( loadAncestors )
        .then( loadChildren )
        .then( function( content ){
          var takeKeys = ['t','currentDomain','currentUser','children','ancestors','siblings'];
          compiler.options.locals = _.merge( compiler.options.locals, _.pick( res.locals, takeKeys) );
          resolve( content );
        });

    };

    function pluginTranslations( content ){
      return new RSVP.Promise( function( resolve ){
        
        res.locals.t = function( str ){
          var localePath = join( res.locals.currentDomain.getContentPath(), 'locales', res.locals.doc.curLang+'.js' );
          if( !fs.existsSync( localePath ) )
            return str;
          var translations = require( localePath );
          return translations[str] || str;
        };

        resolve( content );
      });

    }

    function loadAncestors( content ){
      res.locals.ancestors = [];
      return new RSVP.Promise( function( resolve ){
        loadParent( res.locals.doc, function(){
          resolve( content );
        });
      });
    }

    function loadChildren( content ){
      return new RSVP.Promise( function( resolve ){
        res.locals.doc.constructor
          .find({ parent: res.locals.doc._id })
          .exec( function( err, children ){
            if( err ){ caminio.logger.error('error when trying to load children', err); }
            res.locals.children = children;
            resolve( content );
          });
      });
    }

    function loadParent( doc, cb ){
      if( !doc || !doc.parent )
        return cb();
      doc.constructor
        .findOne({ _id: doc.parent })
        .exec( function( err, parent ){
          if( err ){ caminio.logger.error('error when trying to load ancestors', err); }
          if( !parent )
            caminio.logger.error('failed to load parent for', doc.filename);
          else
            res.locals.ancestors.push( parent );
          loadParent( parent, cb );
        });
    }

  };

};
