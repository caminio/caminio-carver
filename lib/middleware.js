module.exports = function( caminio, namespace ){

  'use strict';

  var fs            = require('fs');
  var join          = require('path').join;
  var _             = require('lodash');

  return {
    after: { 
      create: afterCreate,
      save: afterSave,
      destroy: afterDestroy
    },
    defaultLocals: defaultLocals
  };

  function afterCreate( req, res, next ){
    var hookFile = getHookfile(req,res);
    if( !hookFile )
      return next();
    if( 'after.create' in hookFile )
      return hookFile['after.create']( req, res, next );
    next();
  }

  function afterSave( req, res, next ){
    var hookFile = getHookfile(req,res);
    if( !hookFile )
      return next();
    if( 'after.save' in hookFile )
      return hookFile['after.save']( req, res, next );
    next();
  }

  function afterDestroy( req, res, next ){
    var hookFile = getHookfile(req,res);
    if( !hookFile )
      return next();
    if( 'after.destroy' in hookFile )
      return hookFile['after.destroy']( req, res, next );
    next();
  }

  function getHookfile( req, res ){
    if( !req.webpage )
      return;
    if( !fs.existsSync( getLayoutPath(req,res) ) )
      return;
    return require( getLayoutPath(req,res) );
  }

  function getLayoutPath( req, res ){
    return join( res.locals.currentDomain.getContentPath(), namespace, req.webpage.layout+'.hooks.js' );
  }

  function defaultLocals( res ){
    
    res.locals.t = function( str ){
      var localePath = join( res.locals.currentDomain.getContentPath(), 'locales', res.locals.doc.curLang+'.js' );
      console.log('looking for locale', localePath);
      if( !fs.existsSync( localePath ) )
        return str;
      console.log('existsed');
      var translations = require(localePath);
      return translations[str] || str;
    };

    return _.pick( res.locals, ['t','currentDomain','currentUser']);

  }


};
