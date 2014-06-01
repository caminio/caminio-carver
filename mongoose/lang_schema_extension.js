module.exports = function( caminio, mongoose ){

  'use strict';

  var join        = require('path').join;

  /**
   * @class CaminioCarverPlugin
   * @method translations
   *
   * @param {Schema} schema - a mongoose schema
   * @param {Object} options (see the mongoose plugin documentation for details)
   *
   */
  function CarverPlugin( schema ){

    var _                 = require('lodash');
    var normalizeFilename = require('../lib/util').normalizeFilename;
    var TranslationSchema = require('./translation_schema')( caminio, mongoose );

    schema.add({

      translations: { type: [ TranslationSchema ], public: true },

      filename: { type: String, public: true },

      status: { type: String, public: true, default: 'draft' }

    });

    schema.virtual('filenamePrefix')
      .get(function(){
        return this._filenamePrefix;
      })
      .set(function(val){
        this._filenamePrefix = val;
      });

    schema.virtual('curTranslation')
    .get(function(){
      if( !this._curLang )
        return this.translations[0];
      var guess = _.find( this.translations, { locale: this._curLang } );
      if( guess ){ return guess; }
      return this.translations[0];
    });

    schema.methods.hasTranslation = function( lang ){
      return _.find( this.translations, { locale: lang } );
    };

    schema.virtual('curLang')
    .set(function(lang){
      this._curLang = lang;
    });

    schema.pre('save', function(next){
      if(this.filename)
        this.filename = normalizeFilename( this.filename );
      if( !this.isNew )
        return next();
      if( !this.filename )
        this.filename = normalizeFilename( this.translations[0].title );
      next();
    });

    schema.virtual('url')
      .get( function(){
        return join( (this.filenamePrefix || ''), this.filename );
      });

  }

  return CarverPlugin;

};
