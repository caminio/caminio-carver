module.exports = function( caminio, namespace ){

  'use strict';

  var _           = require('lodash');
  var join        = require('path').join;
  var fs          = require('fs');
  var RSVP        = require('rsvp');

  return function( res ){

    return function( content, compiler, resolve ){

      var takeKeys = ['currentDomain','currentUser','domainSettings'];
      var locals = compiler.options.locals = _.merge( compiler.options.locals, _.pick( res.locals, takeKeys) );
      var doc = compiler.options.doc;

      new RSVP.Promise( function( resolve ){ resolve( content ); })
        .then( pluginTranslations )
        .then( loadAncestors )
        .then( setDocPath )
        .then( loadChildren )
        .then( loadSiblings )
        .then( function( content ){
          if( doc ){
            locals.urlNoLang += (locals.children.length > 0 ? '/' : '');
            locals.urlNoLang = locals.urlNoLang === '/index' ? '/' : locals.urlNoLang;
            locals.url = locals.curLang ? join('/',locals.curLang,locals.urlNoLang) : locals.urlNoLang;
            compiler.options.filename = doc.url;
          }
          resolve( content );
        })
        .catch( function(err){ caminio.logger.error('error in setup_locals hook:', err); });

      function pluginTranslations( content ){
        return new RSVP.Promise( function( resolve ){
          locals.t = function( str ){
            var localePath = join( res.locals.currentDomain.getContentPath(), 'locales', locals.curLang+'.js' );
            if( !fs.existsSync( localePath ) )
              return str;
            var translations = require( localePath );
            return translations[str] || str;
          };

          resolve( content );
        });

      }

      function loadAncestors( content ){
        locals.ancestors = [];
        return new RSVP.Promise( function( resolve ){
          if( !doc ) return resolve(content);
          loadParent( doc, function(){
            resolve( content );
          });
        });
      }

      function setDocPath( content ){
        var _path = [];
        return new RSVP.Promise( function( resolve ){
          if( !doc ) return resolve(content);
          locals.ancestors.reverse().forEach(function(anc){
            _path.push(anc.filename);
          });
          doc._path = _path.join('/');
          resolve( content );
        });
      }

      function loadChildren( content ){
        return new RSVP.Promise( function( resolve ){
          if( !doc ) return resolve(content);
          doc.constructor
            .find({ status: 'published', parent: doc._id })
            .exec( function( err, children ){
              if( err ){ caminio.logger.error('error when trying to load children', err); }
              children.forEach(function(child){
                child._path = doc.url;
              });
              locals.children = children;
              resolve( content );
            });
        });
      }

      function loadSiblings( content ){
        return new RSVP.Promise( function( resolve ){
          if( !doc ) return resolve(content);
          doc.constructor
            .find({ status: 'published', camDomain: res.locals.currentDomain._id, parent: doc.parent, _id: { $ne: doc._id } })
            .exec( function( err, siblings ){
              if( err ){ caminio.logger.error('error when trying to load siblings', err); }
              locals.siblings = siblings;
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
            else if( _.find(locals.ancestors, {_id: parent._id}) )
               return cb();
            else
              locals.ancestors.push( parent );
            loadParent( parent, cb );
          });
      }

    };


  };

};
