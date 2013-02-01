/*********************************************
* For the ConsiderIt project.
* Copyright (C) 2010 - 2012 by Travis Kriplean.
* Licensed under the AGPL for non-commercial use.
* See https://github.com/tkriplean/ConsiderIt/ for details.
**********************************************/

var ConsiderIt; //global namespace for ConsiderIt js methods


(function($) {


ConsiderIt = {
  study : false,
  init : function() {
    ConsiderIt.results_page = $('#explore_proposal').length > 0;
    ConsiderIt.point_page = $('.point').length > 0;

    ConsiderIt.delegators();

    ConsiderIt.update_unobtrusive_edit_heights($(".unobtrusive_edit textarea"));

    ConsiderIt.per_request();

    $(document).ajaxComplete(function(e, xhr, settings) {

      if ( settings.url.indexOf('reflect') == -1 ) {
        ConsiderIt.per_request();
      }
    });
    
    $('a.smooth_anchor').click(function(){
      $('html, body').animate({
        scrollTop: $($(this).attr('href')).offset().top}, 1000);
        return false;
    });

    $('.autoResize, .pointform textarea.point-title, .pointform input[type="text"]').autoResize({extraSpace: 10, maxWidth: 'original'});
    //$('.pointform > form').validateOnBlur();

    $('textarea#statement').autoResize({extraSpace: 5});
    
    // $("#points_other_pro, #points_other_con").dynamicList({
    //     speed: 1000,
    //     vertical: true,
    //     total_items: parseInt($(this).find('.total').filter(":first").text()),
    //     items_per_page: 3,
    //     loading_from_ajax: true, 
    //     dim: 550,
    //     resetSizePerPage: true,
    //     total_items_callback: function($carousel){
    //       if ($carousel.find('.total').filter(":first").length > 0) {
    //         return parseInt($carousel.find('.total').filter(":first").text());
    //       } else {
    //         return $carousel.find('li.point_in_list').length;
    //       }
    //     }
    //   });

    if ( ConsiderIt.results_page ) {
      $.get('/' + $.trim($('#proposal_long_id').text()) + '/results', function(data){
        var $segments = $(data['segments']);
        $('.explore#ranked_points').append($segments);

        $('.thanks').fadeOut(function(){
          $(this).siblings('.results_prompt').fadeIn();                

          $('#histogram').animate({'top': '0px'}, 'slow', function(){
            $('.support,.oppose,#axis_arrow,.personal_position.update', $(this)).delay(100).fadeIn();
          });
        });
      });
    }

    //ConsiderIt.positions.initialize_participants_block();

    $('input[type="file"]').customFileInput();

    if ( ConsiderIt.point_page ) {
      $('iframe').focus().contents().trigger('keyup').find('#page').trigger('keyup');            
      $(".unobtrusive_edit textarea").trigger('keyup');      
    }

    // $('.proposals.vertical').infiniteCarousel({
    //   speed: 1500,
    //   vertical: true,
    //   total_items: 5,
    //   items_per_page: 5,
    //   loading_from_ajax: false,
    //   dim: 250
    // });

    //ConsiderIt.points.create.initialize_counters('.newpointform, .editpointform');

    // google analytics
    (function() {
      var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
      ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
      var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
    })();
        
  },
  per_request : function() {
    //$('.point_in_list_margin.pro').draggable(ConsiderIt.draggable_options);

    $('.new_comment .is_counted, .pro_con_list .is_counted').each(function(){
      if( !$(this).data('has_noblecount') ){        

        $(this).NobleCount($(this).siblings('.count'), {
          block_negative: true,
          max_chars : parseInt($(this).siblings('.count').text())          
          //on_negative : ConsiderIt.noblecount.negative_count,
          //on_positive : ConsiderIt.noblecount.positive_count
        });
      }
    });  

    // $("#ranked_points .full_column").each(function(){
    //   $(this).dynamicList({
    //     speed: 1000,
    //     vertical: true,
    //     total_items: parseInt($(this).find('.total').filter(":first").text()),
    //     items_per_page: 4,
    //     loading_from_ajax: true, 
    //     dim: 500,
    //     resetSizePerPage: true,
    //     total_items_callback: function($carousel){
    //       return parseInt($carousel.find('.total').filter(":first").text());
    //     }
    //   });
    // });   

    $('[placeholder]').inlined_labels();

    //$('form.html5:not(.html5formified)').html5form();
    $('form').h5Validate({errorClass : 'error'});

    // $('.pointform .wysiwyg').redactor({
    //   buttons: ['formatting', 'bold', 'italic', 'unorderedlist', 'orderedlist', 'link', 'fullscreen'],
    //   autoresize: true,
    //   inline_label: 'Add details and links (optional)',
    //   css: 'chalkboard.css'
    // });

    // $('.unobtrusive_edit_form .wysiwyg').redactor({
    //   buttons: ['formatting', 'bold', 'italic', 'unorderedlist', 'orderedlist', 'link', 'fullscreen'],
    //   autoresize: true,
    //   inline_label: 'Add details and links (optional)',
    //   css: 'postit.css'
    // });

    $('.autoResize').trigger('keyup');

  },

  delegators : function() {

    /////////////
    // ACCOUNTS
    /////////////
    $(document) 
      .on('click', '.proxy', function() {
          var email = $('#user_email'), password = $('#user_password'), $me = $(this);
          if ( email.val().length == 0 || password.val().length == 0 || email.is('.error') || password.is('.error') ) {
            return;
          } else {
            $.post('<%= Rails.application.routes.url_helpers.users_check_login_info_path %>', {
                'user' : {
                  'email' : email.val(),
                  'password' : password.val()
                }
              }, function(data){

              if ( data.valid ) {
                $me.siblings('input[type="submit"]').trigger('click');
              } else {
                $('#site_registration .password_field .forget_password_prompt').css({'color': 'red', 'font-weight':'bold'});
              }

            });
          }
        })
      .on('focus', 'input#user_password', function(){
        $(this).siblings('.forget_password_prompt').show();
      })
      .on('click', '#post_signup_form a.cancel', function(){
        $.ajax({
          type: 'DELETE',
          url: "<%= Rails.application.routes.url_helpers.user_registration_path %>",
          data: {},
          success: function(data){
            location.reload(true);
          }, error: function(data){
            location.reload(true);
          }

          });
        });
      // .on('click', '.confirmation_required form', function(){
      //     $(this).parents('.message').append('<span> [done]</span>');
      //   })

    $(document)

      .on('click', '#site_registration a.cancel', function(){
        $('.user_dialog, #settings_dialog').dialog('close');
      })

      .on('click', '#acknowledgment a', function(){
        show_tos(700, 700);  
      })

      .on('click', '#zipcode_entered .reset a', function(){
        $(this).siblings('.resetform').show();
      });

    //////////////
    // PROPOSALS
    //////////////
    $(document)
      .on('click', '.proposal_prompt a.show_proposal_description', function(){
        $('.proposal_prompt').removeClass('hiding');
        $(this).remove();
      })
      .on('click', '.description_wrapper a.hidden, .description_wrapper a.showing', function(){
        var $block = $(this).parents('.extra:first'),
            $full_text = $block.find('.full'), 
            show = $(this).hasClass('hidden');

        if (show) {
          $full_text.slideDown();
          $block.find('a.hidden')
            .text('hide')
            .toggleClass('hidden showing');
        } else {
          $full_text.slideUp(1000);
          $block.find('a.showing')
            .text('show')
            .toggleClass('hidden showing');      

          $('html, body').animate({
            scrollTop: 0
          }, 1000);

        }

      })
      .on('hover', '.proposal_menu', function(event){
        var $target = $(this).children('ul');
        if ( event.type == 'mouseenter' ) {
          $target.slideDown('fast', 'linear');
        } else {
          $target.slideUp('fast', 'linear');
        }
      })
      .on('blur', 'input.my_name', function(){
        if ( $(this).val().length > 3 ) {
          $(this).addClass('hidden_edit');
          $(this).autoGrowInput();
          var prompt = $(this).parents('#nameplate');
          prompt.width( prompt.find('.my_name').outerWidth() + prompt.find('.prompt').outerWidth() + 40);

          //update the username of all points written by this user
          $('.point_in_list.added_by_me').find('.nested_user .unknown').text($(this).val());
        }
      })
      .on('click', '.edit_page a', function(){
        $(this).toggleClass('edit_mode');
        $('.unobtrusive_edit_form').toggleClass('implicit_edit_mode explicit_edit_mode');
        if ($(this).hasClass('edit_mode')) {
          $('.unobtrusive_edit_form textarea:first').focus();
        } else {
          $('.unobtrusive_edit_form textarea').blur();
        }
      })      


      .on('click', '.dialog > a', function(){
        var $dialog_window = $(this).parent().children('.detachable');
        $dialog_window.detach().prependTo('#wrap > #content');
        $dialog_window.data('parent', $(this).parent());
        $dialog_window.show();
      })            
      .on('click', '.detachable a.cancel', function(){
        var $dialog_window = $('#wrap > #content > .detachable');
        $dialog_window.detach().appendTo($dialog_window.data('parent'));        
        $dialog_window.hide();
      })                  
      .on('ajax:success', '#sharing_settings form', function(data, response, xhr){
        var $dialog_window = $(this).parents('.detachable'),
            $field = $dialog_window.data('parent').children('a').find('span'),
            publicity = response.publicity;

        if (publicity == 2) {
          $field.text('public');          
        } else if (publicity == 1) {
          $field.text('link only');          
        } else if (publicity == 0) {
          $field.text('private');          
        }
        $dialog_window.detach().appendTo($dialog_window.data('parent')).hide();            
      })
      .on('ajax:success', '#status_settings form', function(data, response, xhr){
        var $dialog_window = $(this).parents('.detachable'),
            $field = $dialog_window.data('parent').children('a').find('span'),
            active = response.active;

        $field.text( active ? 'active' : 'inactive');      
        $dialog_window.detach().appendTo($dialog_window.data('parent')).hide();            
      }) 
      .on('ajax:success', '.edit_role form', function(data, response, xhr){
        var $dialog_window = $(this).parents('.detachable'),
            $field = $dialog_window.data('parent').children('a').find('span'),
            role = response.role_list;

        $field.text( role );          
        $dialog_window.detach().appendTo($dialog_window.data('parent')).hide();        
      }) 

      .on('keyup', '.unobtrusive_edit input[type="text"], .unobtrusive_edit textarea', function(){
        var save_block = $(this).siblings('.save_block');
        if (!save_block.is('.fading')) {      
          save_block.find('input').show();
          save_block.find('.updated').hide();
        }
      })
      .on('ajax:success', '.unobtrusive_edit_form', function(data, response, xhr){
        var $save_block = $(this).find('.save_block');
        //$save_block.find('input').remove();
        $save_block.addClass('fading');

        $save_block.find('input').hide();

        $save_block.find('.updated').show().delay(1200).fadeOut(function(){
          $save_block.removeClass('fading');
        }); 
        if ( $(this).attr('sync_with') ){
          $($(this).attr('sync_with')).text($(this).find('textarea').val());
        }
      })
      .on('focus', '.unobtrusive_edit input[type="text"], .unobtrusive_edit textarea', function(){
        var save_block = $(this).siblings('.save_block');
        save_block.show();
      })      
      .on('blur', '.unobtrusive_edit input[type="text"], .unobtrusive_edit textarea', function(e){
        var save_block = $(this).siblings('.save_block');
        if (!save_block.is('.fading')) {
          save_block
            .find('.updated').hide();
        }
        //if ( !$(e.target).hasClass('.save_block') && !$(e.target).parents('.save_block').length > 0 ) {
        //  save_block.hide();
        //}
      })
      // .on('ajax:success', '.filter a', function(event, data){
      //   $('.proposal_list').replaceWith($(data.proposals));


      //   if ($(this).parent().is('.tag.selected') ){
      //     $(this).parent().removeClass('selected').siblings().removeClass('selected');
      //   } else{
      //     $(this).parent()
      //       .addClass('selected')
      //       .siblings() 
      //         .removeClass('selected');          
      //   }

      // });

    //////////////
    // POINTS
    //////////////

    // // mouseover a point
    // $(document).on('hover', '.point_in_list:not(#expanded)', function( event ) {
    //   if ( $('.point_in_list.expanded').length == 0 ){
    //     if ( $(this).hasClass('point_in_list_board')) {
    //       var $histogram = $('#histogram');
    //       $histogram.toggleClass('hovering_over_point');
    //       var includers = $.parseJSON($(this).attr('includers')), selector = [];
    //       for ( var i = 0; i < includers.length; i+=1 ) {
    //         selector.push('#user-' + includers[i] + ' .view_statement img');
    //       }
          
    //       if (event.type == 'mouseenter') {
    //         $(selector.join(','), $histogram).addClass('includer_of_hovered_point');
    //         $('#user-' + $(this).attr('user') + ' .view_statement img').addClass('author_of_hovered_point');            
    //       } else {
    //         $(selector.join(','), $histogram).removeClass('includer_of_hovered_point');
    //         $('#user-' + $(this).attr('user') + ' .view_statement img').removeClass('author_of_hovered_point');                        
    //       }

    //     }
    //   }
    // });


    // mouseover read more button
    $(document).on('hover', '.point_in_list_margin .point_text_toggle.more:not(#expanded)', function(event){
      if ( $('.point_in_list#expanded').length == 0 ){
        var parent = $(this).parents('.point_in_list_margin');
      }
    });

    // new button clicked
    // $(document).on('click', '.pro_con_list.dynamic .newpoint .newpointbutton a.write_new', function(){
    //   //$('.droppable').fadeOut();

    //   $(this).fadeOut(100, function(){
    //     //$('.newpoint').hide();
    //     $(this).parents('.newpoint').find('.pointform')
    //       .fadeIn('fast', function(){
    //         $(this).find('iframe').focus().contents().trigger('keyup').find('#page');            
    //         $(this).find('input,textarea').trigger('keyup');
    //         $(this).find('.point-title').focus(); 

    //       })

    //   });  
    // });

    // new/edit point cancel clicked
    // $(document).on('click', '.pro_con_list.dynamic .new_point_cancel', function(){
    //   var form = $(this).parents('.pointform');
    //   form
    //     .fadeOut(function(){
    //       $(this).parents('.newpoint').find('.write_new').fadeIn(); 
    //       //form.find('.point_link_form').remove();
    //       form.find('textarea').val('').trigger('keydown');
    //       form.find('label.inline').addClass('empty');
    //       $('.newpoint').fadeIn();

    //       //$('.droppable').fadeIn();
    //     });
    //     $(this).parents('.point_in_list').removeClass('edit_mode');
    // });

    // Create callback




    // $(document).on('ajax:success', '.pro_con_list.dynamic .newpoint .newpointform form', function(data, response, xhr){
    //   var $new_point = $(response['new_point']);
    //   $new_point.addClass('added_by_me');
    //   if ($new_point.find('.nested_user .unknown').length > 0 && $('#nameplate input.my_name.hidden_edit').length > 0){
    //     var nameplate_name = $('#nameplate input.my_name.hidden_edit').val();
    //     $new_point.find('.nested_user .unknown').text(nameplate_name);
    //   }

    //   $(this).parents('.full_column:first').find('.point_list:first').append($new_point);
    //   $(this).find('textarea').val('').trigger('keydown');
    //   $(this).find('.point-title-group .count').html(140);
    //   //$(this).find('.point-description-group .count').html(2000);
      
    //   $(this).find('.new_point_cancel').trigger('click');

    // });

    // edit point
    $(document).on('click', 'a.editpoint', function(e){
      var point = $(this).parents('.point_in_list,.point');
      point.toggleClass('edit_state');
    });

    // Update callback
    $(document).on('ajax:success', '.pro_con_list.dynamic .editpointform form', function(data, response, xhr){
      $(this).parents('.point_in_list:first').replaceWith(response['new_point']);
      hide_lightbox(); 
    });

    // Delete callback
    $(document).on('ajax:success', '.pro_con_list.dynamic a.delete_point', function(data, response, xhr){
      var $deleted_point = $(this).parents('.point_in_list').filter(":first");
      if ($deleted_point.is('#expanded')){
        unexpand_point($deleted_point);
      }           
      $deleted_point.fadeOut();
    });

    var close_point_click = function(e){
      if ( !$(e.target).is('#expanded') && $(e.target).parents('.point_in_list#expanded').length == 0  && $('body > .ui-widget-overlay').length == 0 && $(e.target).filter(':visible').length > 0) {
        $('.point_in_list#expanded .toggle.less:visible').trigger('click');

      }
    };

    var close_point_key = function(e) { 
      if (e.keyCode == 27 && $('body > .ui-widget-overlay').length == 0) {
        $('.point_in_list#expanded .toggle.less:visible').trigger('click');
      }
    };

    // Toggle point details ON
    // $(document).on('click', '.point_in_list:not(.noclick):not(#expanded)', function(){
    //   var real_point = $(this), point_id = real_point.attr('point');
          
    //   var placeholder = $('<li>'); 
    //   placeholder
    //     .attr('id', real_point.attr('id'))
    //     .height(real_point.height())
    //     .addClass(real_point.attr('class'))
    //     .css('visibility', 'hidden');

    //   //close other open points...
    //   $('#expanded .toggle.less:visible').trigger('click');

    //   real_point.after(placeholder);

    //   var body = real_point.find('> .body'),
    //       full = body.find('> .full'),
    //       extra = real_point.find('.extra'),
    //       is_pro = real_point.hasClass('pro'),
    //       is_margin = real_point.hasClass('point_in_list_margin'),
    //       details_loaded = extra.find('> .ajax_loading').length == 0;

    //   real_point.data({
    //     'container': placeholder.parent()
    //   });

    //   real_point
    //     .css({
    //       'top': placeholder.position().top,
    //       'left': placeholder.position().left,
    //       'background-image': 'none'
    //       //'visibility' : 'hidden'
    //     });

    //   if (real_point.is('.point_in_list_margin') ) {

    //     var $hidden = real_point.children();
    //     $hidden.css('visibility', 'hidden');
    //   }
    //   real_point.offset(); // forces Chrome to execute proper animation

    //   var top = $('.slate:visible').offset().top - placeholder.parents('.point_list').offset().top, 
    //       left = $('.slate:visible').offset().left - 136;

    //       //left = ConsiderIt.results_page ? $('.slate:visible').offset().left - 136 : $('.margin:first').offset().left + 9;
    //   left -= placeholder.parents('.point_list').offset().left

    //   real_point
    //     .attr('id', 'expanded')
    //     .css({
    //       'top': top, 'left': left,
    //       'background-image': ''
    //       //'visibility': ''
    //     });

    //   if (real_point.is('.point_in_list_margin') ) {
    //     setTimeout(function(){$hidden.css('visibility', '');},300);
    //   }
    //   $(document)
    //     .click(close_point_click)
    //     .keyup(close_point_key);

    //   $('html, body').animate({
    //     scrollTop: $('.slate:visible').offset().top - 20
    //   }, 1000);

    //   if ( !details_loaded ) {
    //     var proposal_id = $.trim($('#proposal_long_id').text());

    //     $.get('/' + proposal_id + '/points/' + point_id, {'origin' : is_margin ? 'margin' : 'self'}, function(data){
    //       $('.extra', real_point)
    //         .html(data.details)
    //         .find('textarea').autoResize({extraSpace:0});    

    //       setTimeout(function(){
    //         real_point.find('iframe').focus().contents().trigger('keyup').find('#page').trigger('keyup');   
    //         real_point.find(".unobtrusive_edit textarea").trigger('keyup');
    //       }, 1000);

    //       $('#content').css('height', Math.max($('#content').height(), $('.slate:visible').offset().top + real_point.height() + 100));

    //     });
    //   } else{
    //     setTimeout(function(){
    //       real_point.find('iframe').focus().contents().trigger('keyup').find('#page').trigger('keyup');   
    //       real_point.find(".unobtrusive_edit textarea").trigger('keyup');        
    //     }, 1000);

    //     $('#content').css('height', Math.max($('#content').height(), $('.slate:visible').offset().top + real_point.height() + 100));

    //   }      


    // });

    // // Toggle point details OFF
    // var unexpand_point = function($point) {
    //   var placeholder = $('#point-' + $point.attr('point'), $point.data('container'));

    //   $(document)
    //     .unbind('click', close_point_click)
    //     .unbind('keyup', close_point_key);

    //   $point
    //     .css({'left':'','top':'','height':'', 'width': ''})
    //     .attr('id', placeholder.attr('id'));
    //   //placeholder.after($point);
    //   placeholder.remove();

    //   $point.trigger('mouseleave');
    //   $('#content').css('height', '');

    // };
    // $(document).on('click', '#expanded .toggle.less', function(){
    //   unexpand_point($(this).parents('#expanded'));
    // });

    //////////////
    // INCLUSIONS
    //////////////


    // Remove from list
    // $(document).on('ajax:success', '.uninclude_point_form', function(data, response, xhr){

    //   var old_point = $(this).parents('.point_in_list_self'),
    //     margin_point_list = old_point.hasClass('pro') ? $('#points_other_pro .point_list') : $('#points_other_con .point_list'),
    //     carousel = margin_point_list.parents('.dynamicList');

    //   if (old_point.is('#expanded')){
    //     unexpand_point(old_point);
    //   } 
    //   old_point.fadeOut(function(){
    //     old_point = old_point.detach(); 
    //     margin_point_list.append(old_point);
    //     old_point
    //       .removeClass('point_in_list_self')
    //       .addClass('point_in_list_margin')
    //       //.fadeIn(function(){
    //         carousel.dynamicList({'operation': 'refresh', 'total_items': parseInt(response['total_remaining'])});
    //       //});
    //   });
    // });

    //////////////
    //COMMENTS
    //////////////

    // post new comment
    $(document).on('ajax:success', '.new_comment form', function(data, response, xhr){
      var new_point = response['new_point'];

      $(this).parents('.new_comment').filter(":first").before(new_point);
      $(this).find('textarea, .the_subject input').val("");

      if ( response['is_following'] ) {
        var commentable = $(this).parents('.commentable:first');
        commentable.find('.follow').hide();
        commentable.find('.unfollow').show();
      }
    });

    // update comment
    $(document).on('ajax:success', '.comment form', function(data, response, xhr){
      var updated_comment = response['updated_comment'];
      $parent = $(this).parents('.comment').filter(":first");
      $parent.replaceWith(updated_comment);
    });

    $(document).on('click', '.comment .edit_comment a', function(){
      $(this).parents('.edit_comment').find('.edit_form').toggleClass('hide');
      $(this).parents('.edit_comment').find('> a').toggleClass('hide');
    });


    //////////////
    // POSITIONS
    //////////////

    // Toggle position statement clicked

    // $(document).on('mouseenter', "#histogram .bar.hard_select .view_statement", function(event){
    //   if ( $('#expanded').length == 0 ) {
    //     $(this).children('.details').show();
    //   }
    // });    

    // $(document).on('mouseout', "#histogram .bar.hard_select .view_statement", function(event){
    //   if ( $('#expanded').length == 0 ) {      
    //     $(this).children('.details').hide();
    //   }
    // });    


    // var close_bar_click = function(e){
    //   if ( !$(e.target).is('.bar.selected') && $(e.target).parents('.bar.selected').length == 0 && $('.point_in_list#expanded').length == 0 && !$(e.target).hasClass('pro_con_list') && $(e.target).parents('.pro_con_list').length == 0 ) {
    //     $('.bar.selected').trigger('click');
    //   }
    // };

    // var close_bar_key = function(e) { 
    //   if (e.keyCode == 27 && $('.point_in_list#expanded').length == 0 && $('body > .ui-widget-overlay').length == 0) {
    //     $('.bar.selected').trigger('click');
    //   }
    // };

    // function select_bar($bar, hard_select) {
    //   var bucket = $bar.attr('bucket'),
    //       $stored = $('#domain_'+bucket),
    //       $histogram = $('#histogram');

    //   $('.bar.selected', $histogram).removeClass('selected hard_select soft_select');
    //   $bar.addClass('selected ' + (hard_select ? 'hard_select' : 'soft_select'));

    //   $stored.show();
    //   $('#ranked_points .pro_con_list:not(#domain_' + bucket + '), .statements').hide();
    //   var $col = $('.full_column', $stored);
    //   if ( !$col.data('carousel_initialized') ) {
    //     $col.dynamicList({'operation': 'refresh'});
    //     $col.data('carousel_initialized', true);
    //   }
    //   $(document)
    //     .click(close_bar_click)
    //     .keyup(close_bar_key);
    // }

    // $(document).on('click', '#histogram .bar.full:not(.hard_select)', function(){
    //   if ( $('#expanded').length == 0 ) {
    //     select_bar($(this), true);
    //   }
    // });
    
    // $(document).on('mouseover', '#histogram .bar.full:not(.selected)', function(){
    //   if ( $('#expanded').length > 0 || $('#histogram .bar.hard_select').length > 0) { return; }
    //   select_bar($(this), false);
    // });

    // function deselect_bars($selected_bar) {
    //   $('#domain_all')
    //     .show()
    //     .siblings('.pro_con_list').hide();
      
    //   //$('.pro_con_list')
    //   //  .removeClass('segmented');

    //   $('.view_statement .details:visible', $selected_bar).hide();
      
    //   $selected_bar.removeClass('selected hard_select soft_select');

    //   $(document)
    //     .unbind('click', close_bar_click)
    //     .unbind('keyup', close_bar_key);
    // }

    // $(document).on('click', '#histogram .bar.selected:not(.soft_select)', function(){
    //   deselect_bars($(this));
    // });
    // $(document).on('mouseleave', '#histogram .bar.full.soft_select', function(e){
    //   var $selected_bar = $('#histogram .bar.selected');
    //   if ( $selected_bar.length == 0 ) { return; }
    //   deselect_bars($selected_bar);        
    // });    
        
    $(document).on('click', "#histogram .position_statement .important_points .show, .position_statement .important_points .hide", function(){
      $(this).parent().children().fadeToggle(); 
    });

    //////////////
    //PROPOSAL
    //////////////
    $(document).on('ajax:success', "#ranked_points .point_filter", function(data, response, xhr){
      //$(this).siblings.removeClass('selected');
      //$(this).addClass('selected');
      // TODO: store, don't replace
      $(this).parents('#domain_all').replaceWith($(response.points));

    });

  },

  positions : {

    // initialize_participants_block : function( ) {

    //   var cur_low = null, tile_sizes = {};

    //   for ( var bucket = 0; bucket<= 6; bucket+=1 ) {
    //     var container = $('#bucket-' + bucket + '.bar'),
    //         p = $('> .people_bar', container),
    //         participants = $('> .statement img', p);

    //     var dim = get_tile_size(container.width(), container.height(), participants.length);

    //     tile_sizes[bucket] = dim;        
    //     if ( participants.length > 0 ) {
    //       cur_low = cur_low ? Math.min(dim, cur_low) : dim;
    //     }
    //   }

    //   for ( var bucket = 0; bucket<= 6; bucket+=1 ) {
    //     var container = $('#bucket-' + bucket + '.bar'),
    //         p = $('> .people_bar', container),
    //         participants = $('> .statement img', p),
    //         icon_size = tile_sizes[bucket]; //cur_low

    //     var per_row = Math.floor( container.width() / icon_size);
    //     for ( var i = 0; participants.length % per_row != 0 && i < per_row - participants.length % per_row; i+=1 ) {
    //       p.prepend('<li style="visibility:hidden; float: right; height:' + icon_size + 'px; width:'+icon_size+'px;">')
    //     }
    //     //participants
    //     //  .css({'width': cur_low, 'height': cur_low});
    //     participants
    //       .css({'width':icon_size, 'height':icon_size})
    //     //container.css('height', 'auto');
    //   }

    //   $('.people_bar').show();
    // },

    // set_slider_value : function(new_value){
        
    //   var max_effect = 65, base = 110, value = new_value - 1;
    //   $( '.slider_table .right').css('font-size', base + max_effect * value + '%' )
    //   $( '.slider_table .left').css('font-size', base - max_effect * value + '%')
      
    //   $('#stance-value').val( value );  
    //   ConsiderIt.update_unobtrusive_edit_heights($(".slider_label .unobtrusive_edit textarea"));
    // },
    
    close_segment_click : function(e){
      if ( $(e.target).parents('.point_in_list#expanded').length == 0  && $('body > .ui-widget-overlay').length == 0) {
        $('.point_in_list#expanded .toggle.less:visible').trigger('click');
      }
    },

    close_segment_key : function(e) { 
      if (e.keyCode == 27) {
        $('.point_in_list#expanded .toggle.less:visible').trigger('click');
      }
    },
    
    // set_stance : function(bucket, dontadjust) {
    //   if (dontadjust) bucket = parseInt(bucket)
    //   $('.stance_name').text(ConsiderIt.positions.stance_name(bucket));
    // },
    
    // stance_name : function(d) {
    //   switch (d) {
    //     case 0: 
    //       return "strong opposers"
    //     case 1: 
    //       return "opposers"
    //     case 2:
    //       return "mild opposers"
    //     case 3:
    //       return "neutral parties"
    //     case 4:
    //       return "mild supporters"
    //     case 5:
    //       return "supporters"
    //     case 6:
    //       return "strong supporters"
    //   }
    // }  
    
  },

  update_unobtrusive_edit_heights : function (els) {
    els.each(function(){
        var lineHeight = parseFloat($(this).css("line-height")) || parseFloat($(this).css("font-size")) * 1.5;
        var lines = $(this).attr("rows")*1 || $(this).prop("rows")*1;
        $(this).css("height", lines*lineHeight);
    });    
  },

  //update_carousel_heights: function(){
    // $('.points_other .point_list').css({
    //   'height': $('.pro_con_list').height()
    // })
  //},
  noblecount :  {
    positive_count : function( t_obj, char_area, c_settings, char_rem ) {
      
      if ( char_area.hasClass( 'too_many_chars' ) ) {
        var submit_button = t_obj.parents( 'form' ).find( 'input[type="submit"]' );

        char_area.removeClass( 'too_many_chars' ).css( {
          'font-weight' : 'normal',
          'font-size' : '125%'
        } );
    
        submit_button
            .animate( {
              opacity : 1,
              duration : 50
            } ).attr( 'disabled', false ).css( 'cursor', 'pointer' );
        t_obj.data( 'disabled', false );
      } else if ( char_rem < c_settings.max_chars && $( t_obj ).data( 'disabled' ) ) {
        var submit_button = t_obj.parents( 'form' ).find( 'input[type="submit"]' );

        t_obj.data( 'disabled', false );
        submit_button
            .attr( 'disabled', false );
      } else if ( char_rem == c_settings.max_chars ) {

        var submit_button = t_obj.parents( 'form' ).find( 'input[type="submit"]' );

        t_obj.data( 'disabled', true );
        submit_button
            .attr( 'disabled', true );
      }
      
    },    
    negative_count : function( t_obj, char_area, c_settings, char_rem ) {
      if ( !char_area.hasClass( 'too_many_chars' ) ) {
        char_area.addClass( 'too_many_chars' ).css( {
          'font-weight' : 'bold',
          'font-size' : '175%'
        } );
    
        t_obj.parents( parent_selector ).find( submit_selector )
            .animate( {
              opacity : .25,
              duration : 50
            } ).attr( 'disabled', true ).css( 'cursor', 'default' );
        t_obj.data( 'disabled', true );
    
      } 
    }
  }
  
};

})(jQuery);


// TODO: integrate better into code

// FROM: https://github.com/ryanb/complex-form-examples/blob/master/public/javascripts/application.js
function remove_fields(link) {
  jQuery(link).parents('.point_link_form').remove();
}

function add_fields(link, association, content) {
  var new_id = new Date().getTime();
  var regexp = new RegExp("new_" + association, "g");
  var new_content = content.replace(regexp, new_id);
  jQuery(link).parent().prepend(new_content);
}

function show_tos(width, height) {
  var screenX     = typeof window.screenX != 'undefined' ? window.screenX : window.screenLeft,
      screenY     = typeof window.screenY != 'undefined' ? window.screenY : window.screenTop,
      outerWidth  = typeof window.outerWidth != 'undefined' ? window.outerWidth : document.body.clientWidth,
      outerHeight = typeof window.outerHeight != 'undefined' ? window.outerHeight : (document.body.clientHeight - 22),
      left        = parseInt(screenX + ((outerWidth - width) / 2), 10),
      top         = parseInt(screenY + ((outerHeight - height) / 2.5), 10),
      features    = ('width=' + width + ',height=' + height + ',left=' + left + ',top=' + top + ',scrollbars=yes');

      var tos = window.open('/home/terms-of-use', 'Terms of Use', features);

  if (tos.focus)
    tos.focus();

  return false;
}

function login(provider_url, width, height) {
  var screenX     = typeof window.screenX != 'undefined' ? window.screenX : window.screenLeft,
      screenY     = typeof window.screenY != 'undefined' ? window.screenY : window.screenTop,
      outerWidth  = typeof window.outerWidth != 'undefined' ? window.outerWidth : document.body.clientWidth,
      outerHeight = typeof window.outerHeight != 'undefined' ? window.outerHeight : (document.body.clientHeight - 22),
      left        = parseInt(screenX + ((outerWidth - width) / 2), 10),
      top         = parseInt(screenY + ((outerHeight - height) / 2.5), 10),
      features    = ('width=' + width + ',height=' + height + ',left=' + left + ',top=' + top + ',scrollbars=yes');

  newwindow = window.open(provider_url, '_blank', features);

  if (window.focus)
    newwindow.focus();

  return false;
}

function video_window(width, height, link, title) {
  var screenX     = typeof window.screenX != 'undefined' ? window.screenX : window.screenLeft,
      screenY     = typeof window.screenY != 'undefined' ? window.screenY : window.screenTop,
      outerWidth  = typeof window.outerWidth != 'undefined' ? window.outerWidth : document.body.clientWidth,
      outerHeight = typeof window.outerHeight != 'undefined' ? window.outerHeight : (document.body.clientHeight - 22),
      left        = parseInt(screenX + ((outerWidth - width) / 2), 10),
      top         = parseInt(screenY + ((outerHeight - height) / 2.5), 10),
      features    = ('width=' + width + ',height=' + height + ',left=' + left + ',top=' + top + ',scrollbars=no');

      var tos = window.open(link, title, features);

  if (tos.focus)
    tos.focus();

  return false;
}



(function($) {
$.fn.autoGrowInput = function(o) {

    o = $.extend({
        maxWidth: 1000,
        minWidth: 0,
        comfortZone: 10
    }, o);

    this.filter('input:text').each(function(){

        var minWidth = o.minWidth,
            val = '',
            input = $(this),
            testSubject = $('<tester/>').css({
                position: 'absolute',
                top: -9999,
                left: -9999,
                width: 'auto',
                fontSize: input.css('fontSize'),
                fontFamily: input.css('fontFamily'),
                fontWeight: input.css('fontWeight'),
                letterSpacing: input.css('letterSpacing'),
                whiteSpace: 'nowrap'
            }),
            check = function() {
                if (val === (val = input.val())) {return;}

                // Enter new content into testSubject
                var escaped = val.replace(/&/g, '&amp;').replace(/\s/g,' ').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                testSubject.html(escaped);

                // Calculate new width + whether to change
                var testerWidth = testSubject.width(),
                    newWidth = (testerWidth + o.comfortZone) >= minWidth ? testerWidth + o.comfortZone : minWidth,
                    currentWidth = input.width(),
                    isValidWidthChange = (newWidth < currentWidth && newWidth >= minWidth)
                                         || (newWidth > minWidth && newWidth < o.maxWidth);

                // Animate width
                if (isValidWidthChange) {
                    input.width(newWidth);
                }

            };

        testSubject.insertAfter(input);

        $(this).bind('keyup keydown blur update', check);

    });

    return this;

};
})(jQuery);

//http://blog.colin-gourlay.com/blog/2012/02/safely-using-ready-before-including-jquery/
(function($,d){$.each(readyQ,function(i,f){$(f)});$.each(bindReadyQ,function(i,f){$(d).bind("ready",f)})})(jQuery,document)
