module.exports = function( caminio, namespace ){

  'use strict';

  var fs            = require('fs');
  var join          = require('path').join;

  return {
    after: { 
      create: afterCreate,
      save: afterSave,
      destroy: afterDestroy
    }
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


};
