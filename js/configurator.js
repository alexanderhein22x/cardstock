;(function(window) {

	'use strict';

	var bodyEl = document.body,
		docElem = window.document.documentElement,
		support = { transitions: Modernizr.csstransitions },
		// transition end event name
		transEndEventNames = { 'WebkitTransition': 'webkitTransitionEnd', 'MozTransition': 'transitionend', 'OTransition': 'oTransitionEnd', 'msTransition': 'MSTransitionEnd', 'transition': 'transitionend' },
		transEndEventName = transEndEventNames[ Modernizr.prefixed( 'transition' ) ],
		onEndTransition = function( el, callback ) {
			var onEndCallbackFn = function( ev ) {
				if( support.transitions ) {
					if( ev.target != this ) return;
					this.removeEventListener( transEndEventName, onEndCallbackFn );
				}
				if( callback && typeof callback === 'function' ) { callback.call(this); }
			};
			if( support.transitions ) {
				el.addEventListener( transEndEventName, onEndCallbackFn );
			}
			else {
				onEndCallbackFn();
			}
		},
		// window sizes
		win = {width: window.innerWidth, height: window.innerHeight},
		// some helper vars to disallow scrolling
		lockScroll = false, xscroll, yscroll,
		scrollContainer = document.querySelector('.container'),
		// the main slider and its items
		sliderEl = document.querySelector('.configuration'),
		navbuttonEl = document.querySelector('.nav'),
    navigationEl = scrollContainer.querySelector('.navigation'),
		items = [].slice.call(sliderEl.querySelectorAll('.tab')),
    links = [].slice.call(navigationEl.querySelectorAll('a')),
		// total number of items
		itemsTotal = items.length,
 		linksTotal = links.length,
		// navigation controls/arrows
		navRightCtrl = navbuttonEl.querySelector('.navnext'),
		navLeftCtrl = navbuttonEl.querySelector('.navback'),
		// index of current item
		current = 0;

	// some helper functions:
	function scrollX() { return window.pageXOffset || docElem.scrollLeft; }
	function scrollY() { return window.pageYOffset || docElem.scrollTop; }
	// from http://www.sberry.me/articles/javascript-event-throttling-debouncing
	function throttle(fn, delay) {
		var allowSample = true;

		return function(e) {
			if (allowSample) {
				allowSample = false;
				setTimeout(function() { allowSample = true; }, delay);
				fn(e);
			}
		};
	}

	function init() {
    if(window.location.hash){
      activateTabByHref(window.location.hash);
    } else {
      activateTabByHref(items[0].getAttribute('data-tab-id'));
    }

    toggleNavButtonState(0);
		initEvents();
	}

  window.locatePosByHref = locatePosByHref;
  function locatePosByHref(href){
    if(!href){
      return;
    }

    var i = 0;

    for(;i<itemsTotal;i++){
      if(href && href.length && items[i].getAttribute('data-tab-id') === href.substring(1)){
        return i;
      }
    }

    return -1;
  }

  function activateTabByHref(href){
    if(!href) return;
    href = href[0] === '#' ? href : '#' + href;

    links.forEach(function(link, pos){
      if(link.getAttribute('href') === href){
        classie.add(link.parentNode, 'navigation-current');
      } else {
        classie.remove(link.parentNode, 'navigation-current');
      }
    });
  }

  function toggleNavButtonState(current){
    if(current === 0){
      navLeftCtrl.disabled = true;
      navRightCtrl.disabled = false;
      classie.add(navLeftCtrl, 'navigation-disabled');
      classie.remove(navRightCtrl, 'navigation-disabled');
    } else if (current === items.length - 1){
      navLeftCtrl.disabled = false;
      navRightCtrl.disabled = true;
      classie.remove(navLeftCtrl, 'navigation-disabled');
      classie.add(navRightCtrl, 'navigation-disabled');
    } else {
      navLeftCtrl.disabled = false;
      navRightCtrl.disabled = false;
      classie.remove(navLeftCtrl, 'navigation-disabled');
      classie.remove(navRightCtrl, 'navigation-disabled');
    }
  }

	// event binding
	function initEvents() {
		// left/right navigation
		navRightCtrl.addEventListener('click', function() { navigate('right'); });
		navLeftCtrl.addEventListener('click', function() { navigate('left'); });

    // tab navigation
    links.forEach(function(link, pos){
      link.addEventListener('click', function(ev) {
        navigate(locatePosByHref(link.getAttribute('href')));
        ev.preventDefault();
      });
    });

		// window resize
		window.addEventListener('resize', throttle(function(ev) {
			// reset window sizes
			win = {width: window.innerWidth, height: window.innerHeight};

			// reset transforms for the items (slider items)
			items.forEach(function(item, pos) {
				if( pos === current ) return;
				var el = item.querySelector('.tab__content');
				dynamics.css(el, { translateX: el.offsetWidth });
			});
		}, 10));


		// keyboard navigation events
		document.addEventListener( 'keydown', function( ev ) {
			var keyCode = ev.keyCode || ev.which;
			switch (keyCode) {
				case 37:
					navigate('left');
					break;
				case 39:
					navigate('right');
					break;
			}
		} );

	}

  window.navigate = navigate; // export navigate function
	// navigate the slider
	function navigate(dir) {
		var itemCurrent = items[current],
			currentFadeheader = itemCurrent.querySelector('.tab__content'),
			currentEl = itemCurrent.querySelector('.content-wrap'),
			currentTitleEl = itemCurrent.querySelector('.tab__title');


		// update new current value
		if( typeof dir === 'string' && dir === 'right' ) {
      // if we can go right, go right.
      // otherwise just stop
      if(current < itemsTotal-1){
  			current = current + 1;
      } else {
        return;
      }
		}
		else if( typeof dir === 'string' && dir === 'left' ) {
      // if we can go left, go left.
      // otherwise just stop
      if(current > 0){
  			current = current - 1;
      } else {
        return;
      }
		} else if( typeof dir === 'number' && dir >= 0 ) {
      current = dir;
    } else {
      return;
    }

		var itemNext = items[current],
			nextFadeheader = itemNext.querySelector('.tab__content'),
			nextEl = itemNext.querySelector('.content-wrap'),
			nextTitleEl = itemNext.querySelector('.tab__title');

    activateTabByHref(itemNext.getAttribute('data-tab-id'));
    toggleNavButtonState(current);

		// animate the current content out
		dynamics.animate(currentFadeheader, { opacity: 0 }, {
			duration: 300,
			complete: function() {
				dynamics.css(itemCurrent, { opacity: 0, visibility: 'hidden' });
			}
		});


		// animate the current title out
		dynamics.animate(currentTitleEl, { opacity: 0 }, {
			duration: 450
		});

		// animate the current element out
		dynamics.animate(currentEl, { opacity: 0, translateX: dir === 'right' ? -1*currentEl.offsetWidth/2 : currentEl.offsetWidth/2 }, {
			type: dynamics.spring,
			duration: 2000,
			friction: 1000,
		});

		// set the right properties for the next element to come in
		dynamics.css(itemNext, { opacity: 1, visibility: 'visible' });
		dynamics.css(nextFadeheader, { opacity: 1});
		dynamics.css(nextEl, { opacity: 0, translateX: dir === 'right' ? nextEl.offsetWidth/2 : -1*nextEl.offsetWidth/2 });

		// animate the next content in
		dynamics.animate(nextFadeheader, { opacity: 1 }, {
			duration: 300,
			complete: function() {
				items.forEach(function(item) { classie.remove(item, 'tab--current'); });
				classie.add(itemNext, 'tab--current');
			}
		});

		// animate the next element in
		dynamics.animate(nextEl, { opacity: 1, translateX: 0 }, {
			type: dynamics.spring,
			duration: 2000,
			friction: 1000,
		});

		// set the right properties for the next title to come in
		dynamics.css(nextTitleEl, { opacity: 0 });
		// animate the next title in
		dynamics.animate(nextTitleEl, { opacity: 1 }, {
			duration: 650
		});
	}

	init();

})(window);
