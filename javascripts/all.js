var usersState, usersIncome = 0, usersZip, stateData, adultHouse, childHouse, useState, useCharity, useMarket, useAlternative, sources = [], services = [], monthlyBudget;

// $.getJSON( "javascripts/statesnokey.json", function( data ) {
//   states = data;
//  });


// states key:[ state,  name,  median,  icon,  snap,  wic, insecure,  hardship,  lunch, breakfast]

$.getJSON( "/food-sources/javascripts/statesnokey.json", function( data ) {
  states = data;
 });

$(document).ready(function(){
  // Null out value if user clicks on input
  $(document).on('focus', 'input', function() {
    $(this).val('');
  })

  // HIDE SOME ELEMENTS
  $(".question, #container, .locale, #ziperror, #incomeerror, #income-result, .answer-popup, .intro-answer, .services-frequency li, .results-wrapper").hide();

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

  $(".household-question").on("click touch", ".answer", function(){
    adultHouse = parseInt($('#household-adult').val());
    childHouse = parseInt($('#household-child').val());
    var household = adultHouse + childHouse;

    if (household < 3) {
      $('#household-relative').append('below');
    } else {
      $('#household-relative').append('above');
    }
    $('.number-household').text(household);
  });

  // SOURCE QUESTION. Set source array and then set the data-next-section buttons to the next section. have all next-section buttons set to email at first.

  $('.source-question').on("click touch", ".source-submit", function() {
    var numSelected = $('.source-question .selected').length;
    $( ".source-question .selected" ).each(function( index ) {
      var thisSection = $(this).attr('data-section')
      sources.push(thisSection);
    });

    $.each( sources, function (index, value) {
      if ( index < numSelected ) {
        $('.'+sources[index] + ' .final .next-question').attr('data-next-question', sources[index+1]);
      }
    });

    $('.source-question').slideUp();
    $('.'+sources[0]).slideDown();
  });

  $('.services-question').on("click touch", ".source-submit", function() {
    var numSelected = $('.services-question .selected').length;
    $( ".services-question .selected" ).each(function( index ) {
      var thisSection = $(this).attr('data-section')
      services.push(thisSection);
      $("."+thisSection).show();
    });

    $('.services-question').slideUp();
    $('.services-frequency').slideDown();
  });

  $("#zipbox input").keyup(function(event){
    if(event.keyCode == 13){
      zipIncomeSubmit();
    }
  });

  // MARKET SECTION

  $('.monthly-budget').on("click touch", ".answer", function() {
    var thisBudget = $(this).siblings('.dollars').val();
    if ( thisBudget === null) {

    } else {
      monthlyBudget = thisBudget;
    }
  })

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
    var zip_in = $('#zipcode');
    var zip_box = $('#zipbox');

    // Make HTTP Request
    if ( usersState == null ) {
      $.ajax({
        url: "http://api.zippopotam.us/us/" + zip_in.val(),
        cache: false,
        dataType: "json",
        type: "GET",
        success: function(result, success) {
          // Make the city and state boxes visible
          $('#zipcode').slideUp();
          $('.locale').slideDown();

          // US Zip Code Records Officially Map to only 1 Primary Location
          places = result['places'][0];
          $("#citybox").append(places['place name']);
          $("#statebox").append(places['state']);
          usersState = (places['state']).split(' ').join('_').toLowerCase();
          usersZip = zip_in.val();
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
    var income_in = $('#income').val().replace(/\D+/g, '');
    if ( usersIncome === 0 ) {
      if ( $('#income').val() == "" ) {
        $('#incomeerror').slideDown();
      } else {
        usersIncome = income_in;
        $('#income').slideUp();
        $('#income-result').slideDown();
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
        $('#income-relative').text("BELOW");
      }
      $('#stateMedian').append(commaSeparateNumber(stateData[2]));
      $('#food-hardship').append(stateData[7]);
      $('#income-difference').countTo({
        from: 0,
        to: difference,
        speed: 2000,
        refreshInterval: 50,
      });
      scrollUp();
    }
  }

  function showResults() {
    var questions = $(".question").length -1,question_modulus = questions % 3, results_range = Math.floor(questions/3), break1 = 0, break2 =0;

    $('html,body').animate({scrollTop: $(".results").offset().top - 50}, function(){$('.score-field').slideDown();});
    $(".results").show();
    $(".your-score-weight").prepend('<h2 class="user-score">' + answerss + ' out of ' + $('.question').length + '!</h2>');
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

  // SCROLL
  function scrollUp() {
    $('html, body').animate({
      scrollTop: $(".wrapper").offset().top - 200
    }, 1000);
  }

});
