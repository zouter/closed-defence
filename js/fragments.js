/* global Reveal */


/* code for handling */

var pt = pt || {};

var currentSlideId;
var currentFragment;

pt.handleEvent = function(isSlideEvent) {
  'use strict';

  currentSlideId = Reveal.getCurrentSlide().id;
  currentFragment = parseInt(Reveal.getIndices().f) + 1;

  activateFragment(currentSlideId, currentFragment, isSlideEvent)
};

activateFragment = function(currentSlideId, currentFragment, isSlideEvent) {
  // Don't go any further if the slide has no ID (i.e. the string is empty).
  if (!currentSlideId) {
    return;
  }

  // If there is no entry corresponding to the current slide in the map, don't go further.
  var functions = pt.slideActives[currentSlideId];
  if (functions == null) {
    return;
  }

  var actives = functions["actives"];

  var allActives = _.flatten(actives)
  var curActives = actives[currentFragment]
  var postActives = _.flatten(_.slice(actives, currentFragment))

  if (curActives == null) { curActives = [] }

  if (allActives != null) {
    allActives.forEach(function (index) {
      var selector = "[data-index='" + index + "']"
      d3.selectAll(selector).classed("canactive", true)
      if (curActives.includes(index)) {
        d3.selectAll(selector).classed("active", true)
        d3.selectAll(selector).classed("inactive", false)
      } else {
        d3.selectAll(selector).classed("active", false)
        d3.selectAll(selector).classed("inactive", true)
      }

      if (postActives.includes(index)) {
        d3.selectAll(selector).classed("postactive", false)
      } else {
        d3.selectAll(selector).classed("postactive", true)
      }
    })
  }


  var fragmentFunction = functions[currentFragment];
  if (fragmentFunction != null) {
    fragmentFunction();
  }
}

pt.handleSlideEvent = function() {
  'use strict';
  pt.handleEvent(true);
};

pt.handleFragmentEvent = function() {
  'use strict';
  pt.handleEvent(false);
};

Reveal.addEventListener('slidechanged', pt.handleSlideEvent);

Reveal.addEventListener('fragmentshown', pt.handleFragmentEvent);

Reveal.addEventListener('fragmenthidden', pt.handleFragmentEvent);




/* code for mapping */

pt.slideActives = {
  'overview': {
    init: function(slideId) {
    }
  },
  'big-questions': {
    'actives': [
      [],
      ["transcriptomics"]
    ]
  },
  'intro': {
    'actives': [
      [],
      ["goals"]
    ]
  },
  'triwise': {
    'init': function(slideId) {
    },
    'actives': [
      ["problem", "existing"],
      ["problem", "existing", "needed"],
      ["solution"],
      ["solution", "non-diffexp"],
      ["solution", "diffexp-1"],
      ["solution", "diffexp-2"],
      ["solution", "significant"],
      ["conclusion"],
      ["conclusion", "future"]
    ]
  },
  'modbenchmark': {
    'init': function(slideId) {
    },
    'actives': [
      ["problem", "knowing", "applications"],
      ["problem", "knowing", "assumption"],
      ["problem", "knowing", "assumption", "evaluate"],
      ["solution", "solution-2"],
      ["solution", "solution-2", "local"],
      ["solution", "solution-2", "local", "network-inference"],
      ["solution", "solution-2", "local", "network-inference", "method-backgrounds", "raw-results"],
      ["solution", "solution-2", "local", "network-inference", "method-backgrounds", "raw-results", "running-time"],
      ["solution", "solution-2", "local", "network-inference", "method-backgrounds", "raw-results", "running-time", "summary"],
      ["conclusion"],
      ["conclusion", "future"]
    ]
  },
  'dynbenchmark': {
    'actives': [
      ["problem", "problem-1"],
      ["problem", "problem-2"],
      ["problem", "problem-2", "technologies"],
      ["solution", "solution-1", "guidelines"],
      ["solution", "solution-1", "highlight"],
      ["solution", "solution-2", "dynguidelines"],
      ["conclusion"],
      ["conclusion", "future"]
    ]
  },
  'dyno': {
    'actives': [
      [],
      ["extensions"]
    ]
  },
  'komparo': {
    'actives': [
      ["modules"],
      ["modules", "modern"],
      ["modules", "modern", "promotes"],
    ]
  }
};



function registerFakeFragments(slide, fragmentIndices, stateChangeHandler) {
  var state = Reveal.getState()
  var currentFragment = parseInt(slide.find(".fragment.current-fragment").data("fragment-index"))

  slide.find(".fragment").remove()

  const identifier = `fake-${Math.round(1000000000*Math.random())}`;
  let i = 1;
  for (let fragmentIndex of fragmentIndices) {
    const span = document.createElement('span');
    span.dataset.target = identifier;
    span.classList.add('fragment');
    span.classList.add('fake-fragment');
    span.setAttribute('data-fragment-index', JSON.stringify(fragmentIndex));
    span.dataset.stateIndex = JSON.stringify(i);

    slide.append(span);
    ++i;
  }
  
  Reveal.setState(state)
}

Reveal.addEventListener( 'ready', function( event ) {
  /* Init slides and create fragments */
  _.map(pt.slideActives, function(slideInfo, slideId) {
    if ("actives" in slideInfo) {
      var nFragments = slideInfo["actives"].length;
      registerFakeFragments($("#" + slideId), Array.from(Array(nFragments - 1).keys()));
    }
    if ("init" in slideInfo) {
      pt.slideActives[slideId]["init"](slideId);
    }
  })

  /* Init svgs */

  $("div[data-svg]").map(function () { 
    var element = this;
    svgLocation = $(element).data("svg"); 
    $.get(svgLocation, function (data) {
      $(element).append(data.documentElement)

      activateFragment(currentSlideId, currentFragment, false)
    })
  })
} );
