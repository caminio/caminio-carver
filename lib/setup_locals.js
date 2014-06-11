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
        .then( setDocPath )
        .then( loadChildren )
        .then( loadSiblings )
        .then( function( content ){
          var takeKeys = ['t','currentDomain','currentUser','children','ancestors','siblings'];
          compiler.options.locals = _.merge( compiler.options.locals, _.pick( res.locals, takeKeys) );
          compiler.options.filename = res.locals.doc.url;
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

    function setDocPath( content ){
      var _path = [];
      return new RSVP.Promise( function( resolve ){
        res.locals.ancestors.reverse().forEach(function(anc){
          _path.push(anc.filename);
        });
        res.locals.doc._path = _path.join('/');
        resolve( content );
      });
    }

    function loadChildren( content ){
      return new RSVP.Promise( function( resolve ){
        res.locals.doc.constructor
          .find({ status: 'published', parent: res.locals.doc._id })
          .exec( function( err, children ){
            if( err ){ caminio.logger.error('error when trying to load children', err); }
            res.locals.children = children;
            resolve( content );
          });
      });
    }

    function loadSiblings( content ){
      return new RSVP.Promise( function( resolve ){
        res.locals.doc.constructor
          .find({ status: 'published', parent: res.locals.doc.parent })
          .exec( function( err, siblings ){
            if( err ){ caminio.logger.error('error when trying to load siblings', err); }
            res.locals.siblings = siblings;
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
