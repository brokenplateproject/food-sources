var usersState, usersIncome = 0, usersZip, stateData, adultHouse = 0, childHouse = 0, useState, useCharity, useMarket, useAlternative, sources = [], services = [], alternative = [], monthlyBudget;

// states key:[ state,  name,  median,  icon,  snap,  wic, insecure,  hardship,  lunch, breakfast]

$.getJSON( "/javascripts/statesnokey.json", function( data ) {
  states = data;
 });

// $.getJSON( "javascripts/statesnokey.json", function( data ) {
//   states = data;
//  });

$(document).ready(function(){
  // Null out value if user clicks on input
  $(document).on('focus', 'input', function() {
    $(this).val('');
  })

  // HIDE SOME ELEMENTS
  $("#gform input, .question, #container, .locale, #ziperror, #householderror, #incomeerror, #income-result, .answer-popup, .intro-answer, .results-wrapper, .person, .input-error,.services-frequency li, .serviceserror").hide();

  // MULTIPLE CHOICE SELECT ALL THAT APPLY
  $(".questions").on('click', '.answers li', function(){
    if ($(this).hasClass('selected')) {
      $(this).removeClass('selected');
    } else {
      $(this).addClass('selected');
    }
  });

  // OPEN ANSWER_POPUP PORTION OF THE CURRENT QUESTION

  $(".questions").on('click', '.answer', function(){
    questions = $('.question').length;
    questionsBroj = parseInt(questions)-1;

    var answer_popup = $(this).parent().next('.answer-popup'),
    question = $(this).parent().parent().parent()

    answer_popup.slideDown();
    $(this).parent().slideUp();
  });

  $(".question").on("click touch", ".next-question", function(){
    var current_question = $(this).attr("data-question"), next_question = $(this).attr("data-next-question");
    var current_form_input = $(this).attr("data-input");
    if (current_form_input != null ) {
      $('#'+current_form_input).val($('.'+current_form_input).val());
    }
    $("."+current_question).hide();
    $("."+next_question).fadeIn(100);
  });



  // INTRO


  $("#intro").on("click touch", ".next-button", function(){
    zipIncomeSubmit();
  });

  // Close intro response and open up the first question
  $(".state-income").on("click touch", ".next-button", function(){
    $('.intro-answer').slideUp();
    $('#container').css('display', 'block');
    $('.household-question').slideDown();
  });

  $(".household-question").on("click touch", ".next-button", function(){
    adultHouse = parseInt($('#household-adult').val());
    childHouse = parseInt($('#household-child').val());
    var household = adultHouse + childHouse;

    if (household == 0) {
      $('#householderror').slideDown();
    } else {
      closeHousehold( adultHouse, childHouse );
    }
  });

  function closeHousehold( theseAdults, theseKids ) {
    $('.household-question .question-body').slideUp();
    $('.household-question .answer-popup').slideDown();
    $('#adults').val(theseAdults);
    $('#children').val(theseKids);
  }

  // SOURCE QUESTION. Set source array and then set the data-next-section buttons to the next section. have all next-section buttons set to email at first.

  $('.source-question').on("click touch", ".source-submit", function() {
    var numSelected = $('.source-question .selected').length;
    if (numSelected > 0 ) {
      $( ".source-question .selected" ).each(function( index ) {
        var thisSection = $(this).attr('data-section')
        sources.push(thisSection);
      });

      $.each( sources, function (index, value) {
        if ( index < numSelected ) {
          $('.'+sources[index] + ' .final').attr('data-next-question', sources[index+1]);
        }
      });

      $('.source-question').slideUp();
      $('.'+sources[0]).slideDown();
    } else {
      $('#sourceerror').slideDown();
    }
  });

  $('.store-type').on("click touch", ".source-submit", function() {
    if ($('.store-type .selected').length === 0) {
      $('.store-type .input-error').slideDown();
    } else {
      $('.store-type .selected').each(function(index){
        var thisFormInput = $(this).attr('data-input');
        $('#'+thisFormInput).val(true);
      });
      $('.store-type').slideUp();
      $('.'+$(this).attr('data-next-question')).slideDown();
    }
  });

  $('.transportation-question').on("click touch", ".source-submit", function() {
    if ($('.transportation-question .selected').length === 0) {
      $('.transportation-question .input-error').slideDown();
    } else {
      $('.transportation-question .selected').each(function(index){
        var thisFormInput = $(this).attr('data-input');
        $('#'+thisFormInput).val(true);
      });
      $('.transportation-question').slideUp();
      $('.'+$(this).attr('data-next-question')).slideDown();
    }
  });

  $('.charitySection').on("click touch", ".source-submit", function() {
    var numSelected = $('.services-question .selected').length;
    if ( numSelected > 0 ) {
      $( ".services-question .selected" ).each(function( index ) {
        var thisSection = $(this).attr('data-section')
        services.push(thisSection);
        $("."+thisSection).show();
      });

      $('.services-question').slideUp();
      $('.services-frequency').slideDown();
    } else {
      $('.charitySection .serviceserror').slideDown();
    }
  });

  $('.alternativeSection').on("click touch", ".source-submit", function() {
    var numSelected = $('.alternativeSection .selected').length;
    $( ".alternativeSection .selected" ).each(function( index ) {
      var thisSection = $(this).attr('data-section')
      $('#'+thisSection).val('true');
    });

    $('.alternativeSection').slideUp();
    $('.results').slideDown();
  });

  $('.services-frequency').on("click touch", ".source-submit", function() {
    $('#foodpantry').val($('.foodpantry').val());
    $('#soupkitchen').val($('.soupkitchen').val());
    $('#mealdelivery').val($('.mealdelivery').val());
    $('#schoolbackpack').val($('.schoolbackpack').val());
    $('.services-frequency .question-body').slideUp();
    $('.services-frequency .answer-popup').slideDown();
    scrollUp();
  });

  $("#zipbox input").keyup(function(event){
    if(event.keyCode == 13){
      zipIncomeSubmit();
    }
  });

  // MARKET SECTION

  $('.monthly-budget').on("click touch", ".answer", function() {
    var thisBudget = $(this).siblings('.dollars').val();
    if ( thisBudget === 0) {

    } else {
      monthlyBudget = thisBudget;
      $('#budget').val(thisBudget);
    }
  })

  $('.snap-question').on("click touch", ".answer", function() {
    $('#snap').val($('input[data-input="snap"]').val());
    $( ".snap-question .person, .snap-answer .person" ).each(function( index ) {
      if ( index < stateData[4] ) {
        $(this).addClass('recipient');
      }
      $(this).delay(20 * index).fadeIn();
    });
  });

  $('.wic-question').on("click touch", ".answer", function() {
    $('.wic-question .answer-popup').slideDown();
    scrollUp();
    $( ".wic-question .person" ).each(function( index ) {
      if ( index < stateData[5] ) {
        $(this).addClass('recipient');
      }
      $(this).delay(20 * index).fadeIn();
    });
    $('#wic').val($(this).attr('data-input'));
  });

  $('.lunch-question').on("click touch", ".answer", function() {
    $('.lunch-question .answer-popup').slideDown();
    scrollUp();
    $('#schoolmeals').val($(this).attr('data-input'));
  });

  // Results
  $('.results').on("click touch", '.source-submit', function() {
    $('.results-questions').slideUp();
    $('.results-wrapper').slideDown();
  })


  function zipIncomeSubmit() {
    checkIncome();
    checkZip();
    closeIntro();
  }

  function checkZip(){
    var zip_in = $('#zipcodeui');
    var zip_box = $('#zipbox');

    // Make HTTP Request
    if ( usersState == null ) {
      $.ajax({
        url: "https://api.zippopotam.us/us/" + zip_in.val(),
        cache: false,
        dataType: "json",
        type: "GET",
        success: function(result, success) {
          // Make the city and state boxes visible
          $('#zipcodeui').slideUp();
          $('.locale').slideDown();

          // US Zip Code Records Officially Map to only 1 Primary Location
          places = result['places'][0];
          $("#citybox").append(places['place name']);
          $("#statebox").append(places['state']);
          usersState = (places['state']).split(' ').join('_').toLowerCase();
          usersZip = zip_in.val();
          $('#zipcode').val(usersZip);
          $('#state').val(places['state']);
          // stateData = states[usersState];
          assignStateData(usersState);
          zip_box.addClass('success').removeClass('error');
          closeIntro();
        },
        error: function(result, success) {
          zip_box.removeClass('success').addClass('error');
          $('#ziperror').slideDown();
        }
      });
    }

  };

  function assignStateData( stata ) {
    for (i = 0; i < states.length; i++) {
      if ( states[i][0] === stata ) {
        stateData = states[i];
      }
    }
  }

  function checkIncome() {
    var income_in = $('#incomeui').val().replace(/\D+/g, '');
    if ( usersIncome === 0 ) {
      if ( $('#incomeui').val() == "" ) {
        $('#incomeerror').slideDown();
      } else {
        usersIncome = income_in;
        $('#incomeui').slideUp();
        $('#income-result').slideDown();
        $('#income').val(income_in);
        $('#income-value').countTo({
          from: 0,
          to: income_in,
          speed: 2000,
          refreshInterval: 50,
        });

        if ( $('#incomeerror').css('display') == 'block' ) {
          $('#incomeerror').slideUp();
        }
      }
    }
  };

  // SWITCH STATE
   $(".state-select-wrapper").on('click touch', '.source-submit', function(){
    var newState = $('#state-select').val();
    $('.userState').text(states[newState][1]);
    $('.snap-data').text(states[newState][4]);
    $('.wic-data').text(states[newState][5]);
    $('.insecure-data').text(states[newState][6]);
    $('.hardship-data').text(states[newState][7]);
    $('.lunch-data').text(states[newState][8]);
    $('.breakfast-data').text(states[newState][9]);
    $('.stateMedian').text(commaSeparateNumber(states[newState][2]));
    $('.food-hardship').text(states[newState][7]);
    scrollUp();
  });

// states key:[ 0 state, 1 name, 2 median, 3 icon, 4 snap, 5 wic, 6 insecure, 7 hardship, 8 lunch, 9 breakfast]

  function closeIntro() {
    if ( usersState != null && usersIncome != 0) {
      $('input').blur();
      var difference = Math.abs(parseInt(stateData[2]) - parseInt(usersIncome));
      $('#intro').slideUp();
      $('#container').css('display', 'block');
      $('.userState').text(stateData[1]);
      $('.userIncome').text(commaSeparateNumber(usersIncome));
      $('.intro-answer').slideDown( );
      $('.snap-data').text(stateData[4]);
      $('.wic-data').text(stateData[5]);
      $('.insecure-data').text(stateData[6]);
      $('.hardship-data').text(stateData[7]);
      $('.lunch-data').text(stateData[8]);
      $('.breakfast-data').text(stateData[9]);
      if (stateData[2] > usersIncome) {
        $('.income-relative').text("BELOW");
      }
      $('.stateMedian').append(commaSeparateNumber(stateData[2]));
      $('.food-hardship').append(stateData[7]);
      $('.income-difference').countTo({
        from: 0,
        to: difference,
        speed: 2000,
        refreshInterval: 50,
      });
      scrollUp();
    }
  }

  function commaSeparateNumber(val){
    while (/(\d+)(\d{3})/.test(val.toString())){
      val = val.toString().replace(/(\d+)(\d{3})/, '$1'+','+'$2');
    }
    return val;
  };

  $.fn.countTo = function(options) {
  // merge the default plugin settings with the custom options
  options = $.extend({}, $.fn.countTo.defaults, options || {});

  // how many times to update the value, and how much to increment the value on each update
  var loops = Math.ceil(options.speed / options.refreshInterval),
  increment = (options.to - options.from) / loops;

  return $(this).each(function() {
  var _this = this,
  loopCount = 0,
  value = options.from,
  interval = setInterval(updateTimer, options.refreshInterval);

  function updateTimer() {
    value += increment;
    loopCount++;
    $(_this).html(addCommas(value.toFixed(options.decimals)))

      if (typeof(options.onUpdate) == 'function') {
        options.onUpdate.call(_this, value);
      }

      if (loopCount >= loops) {
        clearInterval(interval);
        value = options.to;

        if (typeof(options.onComplete) == 'function') {
          options.onComplete.call(_this, value);
        }
      }
    }

    function addCommas(nStr){
      nStr += '';
      x = nStr.split('.');
      x1 = x[0];
      x2 = x.length > 1 ? '.' + x[1] : '';
      var rgx = /(\d+)(\d{3})/;
      while (rgx.test(x1)) {
      x1 = x1.replace(rgx, '$1' + ',' + '$2');
      }
      return x1 + x2;
      }
    });
  };

  $.fn.countTo.defaults = {
    from: 0, // the number the element should start at
    to: 100, // the number the element should end at
    speed: 1000, // how long it should take to count between the target numbers
    refreshInterval: 100, // how often the element should be updated
    decimals: 0, // the number of decimal places to show
    onUpdate: null, // callback method for every time the element is updated,
    onComplete: null // callback method for when the element finishes updating
  };
});

  // SCROLL

function scrollUp() {
  $('html, body').animate({
    scrollTop: $(".wrapper").offset().top - 200
  }, 100);
}

function setPersonChart( chart, data ) {
  $( "."+chart+" .person" ).each(function( index ) {
    if ( index < stateData[data] ) {
      $(this).addClass('recipient');
    }
    $(this).fadeIn();
  });
}


