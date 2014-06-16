/**
 *
 * @class TranslationSchema
 *
 */
 
module.exports = function TranslationSchema( caminio, mongoose ){

  'use strict';

  var schema = new mongoose.Schema({

    /**
     * @property locale
     * @type String
     */  
    locale: { type: String, required: true, public: true },

    /**
     * @property title
     * @type String
     */  
    title: { type: String, public: true },

    /**
     * @property subtitle
     * @type String
     */  
    subtitle: { type: String, public: true },

    /**
     * @property aside
     */
    aside: { type: String, public: true },

    /**
     * @property aside2
     */
    aside2: { type: String, public: true },

    /**
     * @property aside3
     */
    aside3: { type: String, public: true },


    /**
     * @property content
     * @type String
     */  
    content: { type: String, public: true },

    /**
     * @property metaDescription
     * @type String
     */
    metaDescription: { type: String, public: true },

    /**
     * @property metaKeywords
     * @type String
     */
    metaKeywords: { type: String, public: true },

    /**
     * @property categories
     * @type Array
     */
    categories: { type: [String], public: true }

  });

  return schema;

};
