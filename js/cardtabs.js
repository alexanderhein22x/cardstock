/**
 * cbpFWTabs.js v1.0.0
 * http://www.codrops.com
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 *
 * Copyright 2014, Codrops
 * http://www.codrops.com
 */
;( function( window ) {

	'use strict';

	function extend( a, b ) {
		for( var key in b ) {
			if( b.hasOwnProperty( key ) ) {
				a[key] = b[key];
			}
		}
		return a;
	}

	function CardTabs( el, options ) {
		this.el = el;
		this.options = extend( {}, this.options );
  		extend( this.options, options );
  		this._init();
	}

	CardTabs.prototype.options = {
		start : 0
	};

	CardTabs.prototype._init = function() {
		// tabs elemes
		this.cardtabs = [].slice.call( this.el.querySelectorAll( 'nav > ul > li' ) );
		// content items
		this.carditems = [].slice.call( this.el.querySelectorAll( '.cardcontent > section' ) );
		// current index
		this.current = -1;
		// show current content item
		this._show();
		// init events
		this._initEvents();
	};

	CardTabs.prototype._initEvents = function() {
		var self = this;
		this.cardtabs.forEach( function( tab, idx ) {
			tab.addEventListener( 'click', function( ev ) {
				ev.preventDefault();
				self._show( idx );
			} );
		} );
	};

	CardTabs.prototype._show = function( idx ) {
		if( this.current >= 0 ) {
			this.cardtabs[ this.current ].className = '';
			this.carditems[ this.current ].className = '';
		}
		// change current
		this.current = idx != undefined ? idx : this.options.start >= 0 && this.options.start < this.carditems.length ? this.options.start : 0;
		this.cardtabs[ this.current ].className = 'cardtab-current';
		this.carditems[ this.current ].className = 'cardcontent-current';
	};

	// add to global namespace
	window.CardTabs = CardTabs;

})( window );
