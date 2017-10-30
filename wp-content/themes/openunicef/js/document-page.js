function setHeight(){
    var topHeader = $('.thin_nav').outerHeight(true);
    var header = $('.top').outerHeight(true);
    var footer = $('.footer').outerHeight(true);
    var totHeight = $(window).height();
    var docBox = (totHeight - header - footer - topHeader);

    $('.container').css({
        'min-height': docBox + 'px'
    });
}
$(document).ready(function (){
    $('.nav-icon').tooltip({container: 'body'});
    
    $(window).on('resize', function () {
        setHeight();
    });

    setHeight();
});
var countLoop;
var tempScrollTop;

$('#main-nav').stop().animate({left: 0}, 1000);
function showMetheDoc(me, taxType, taxName, taxCount, fromCall) {
     
      
    
    
    $(".dot-plc-bg").css({background: "none", border: "0"});

    tempScrollTop = $(window).scrollTop();

    //var defaultTotRec= "<?php echo $showingNoOfRec; ?>";

    //var taxCurrentNoPage = $("#currNoPage").val();
    //var taxNextNoPage = parseInt(taxCurrentNoPage) + 4;
    
    $("#currSection").val(taxType);
    $("#currCategory").val(taxName);

    if (fromCall == 'peg') {
        $("#currNoPage").val(taxCount);
        var taxCountSend = taxCount;
    } else {
        $("#category-post-content").html('');
        $("#currNoPage").val(0);
        var taxCountSend = 0;
        countLoop = 1;
    }

    $("li.last-child").click(function (event) {
        var parentID = $(this).closest("ul.parentUL").attr('id');
        $('#' + parentID + ' li.last-child').removeClass('active-bg');
        $(this).addClass("active-bg");
    });
    $(".dot-plc-bg").show();
    $("#document-page-loading").show();
    var doc_keyword = $("#doc_keyword").val();
	$("#doc_keyword").val('');
    
    var ajaxdata = {
        "action": "load-filter",
        section: taxType,
        cat: taxName,
        showRec: taxCountSend,
        doc_keyword: doc_keyword
    }
     
    if( me != 'undefine' ){
        $("#selectedCatId").val(me.attr("term-id"));
        if( me.attr("term-id") == filterCategory){     
            $("#advanceSearchFields").slideDown();

            ajaxdata.cross_cutting      = $("#cross_cutting").val();
            ajaxdata.geographic_area    = $("#geographic_area").val();
            ajaxdata.year               = $("#year").val();
            ajaxdata.report_type        = $("#report_type").val();
            ajaxdata.orderby            = $("#orderby").val();
            ajaxdata.allFilterBoxCategories        = allFilterBoxCategories;

        }else{
            $("#advanceSearchFields").slideUp();
        }
    }else{
       // $("#advanceSearchFields").slideUp();
       
       if(  $("#advanceSearchFields").is(":visible")   ) {
            ajaxdata.cross_cutting      = $("#cross_cutting").val();
            ajaxdata.geographic_area    = $("#geographic_area").val();
            ajaxdata.year               = $("#year").val();
            ajaxdata.report_type        = $("#report_type").val();
            ajaxdata.orderby            = $("#orderby").val();
            ajaxdata.allFilterBoxCategories        = allFilterBoxCategories;
       }
       
    }
    
    
    
    $.ajax({
        type: 'POST',
        url: ajaxurl,
        data: ajaxdata,
        success: function (response) {
            alreadyloading = false;
            
			doc_keyword = doc_keyword.trim();
			if(doc_keyword != '') {
				$("#searchOutputString").html('Showing serach result of ' + doc_keyword);
				$("#searchOutputString").show();
			}
			else {
				$("#searchOutputString").html();
				$("#searchOutputString").hide();
			}
			
			$(".dot-plc-bg").show();
            $(".doc-bx .doc-left .dot-plc-bg").css({background: "#f2f3f4 none repeat scroll 0 0", border: "1px solid #e2e4e6"});
            $("#document-page-loading").hide();
            //$("#category-post-content").empty();
            $("#category-post-content").append(response);
            $(window).scrollTop(tempScrollTop);
            return false;
        },
        complete: function () {
            $("#crntTotal").html($("#category-post-content ul li").length);

            $("#allTotal").html($("#category-post-content ul #published_posts").last().val());
            if ($("#crntTotal").html() == 0) {
                $("#allTotal").html(0);
            }
            if ($("#crntTotal").html() == $("#allTotal").html()) {
                $(".readmore_bar").hide();
            } else {
                $(".readmore_bar").show();
            }
            $(".dot-plc-bg-cnt-docpg").css("visibility", "visible");

            //published_posts
        }
    });

}

 
var alreadyloading = false;

countLoop = 1;

$(document).ready(function (){
    $(".readmore_bar").click(function () {
    //if ($('body').height() <= ($(window).height() + $(window).scrollTop())) {					
        if (alreadyloading == false) {
            //console.log('countLoop--->'+countLoop+'totPages--->'+$("#totNoOfPages").val());
            if ((countLoop < $("#totNoOfPages").val()) && ($("#totNoOfPages").val() > 1)) {
                // ALL records finished
                alreadyloading = true;
                var findCurrentSec = $("#currSection").val();
                var findCurrentCat = $("#currCategory").val();
                var findCurrentNoPage = $("#currNoPage").val();
                var findNextNoPage = parseInt(findCurrentNoPage) + 10;

                $("#currNoPage").val(findNextNoPage);
                showMetheDoc('undefine',findCurrentSec, findCurrentCat, findNextNoPage, 'peg');
                countLoop++;


            }
        }

    });
    
});

function goBtnclickHandler(){
    $("#document-menu ul li a[term-id=17]").trigger('click');
}
function resetBtnclickHandler(){
    $(".form-group select").val(0);
}
function orderBychangeHandler(){
    $("#document-menu ul li a[term-id=17]").trigger('click');
}


  