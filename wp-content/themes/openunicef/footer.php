<?php
/**
 * The template for displaying the footer
 *
 * Contains footer content and the closing of the #main and #page div elements.
 *
 * @package WordPress
 * @subpackage Open_Unicef
 * @since Open Unicef 1.0
 */

 global $currentPageID;
 global $showingNoOfRec;
 global $headerMenu;
?>

<div class="explore">
    <div class="icon_group">
		  <?php
				foreach ((array)$headerMenu as $key => $menu_item )
				{
					if($menu_item->object_id == 2){
						echo '<div class="nav-icon" title="'. $menu_item->post_excerpt .'">
							<a href="' .get_permalink($menu_item->object_id). '">
								<h3>' .$menu_item->title. '</h3>
								<img class="icon" src="' .get_template_directory_uri(). '/assets/icons/home_big.png" alt="flow">
							</a>
						</div>';
					}else if($menu_item->object_id == 47){
						echo '<div class="nav-icon" title="'. $menu_item->post_excerpt .'">
							<a href="' .get_permalink($menu_item->object_id). '">
								<h3>' .$menu_item->title. '</h3>
								<img class="icon" src="' .get_template_directory_uri(). '/assets/icons/document_big.png" alt="flow">
							</a>
						</div>';
					}else if($menu_item->object_id == 7){
						echo '<div class="nav-icon" title="'. $menu_item->post_excerpt .'">
							<a href="' .get_permalink($menu_item->object_id). '">
								<h3>' .$menu_item->title. ' visualization</h3>
								<img class="icon" src="' .get_template_directory_uri(). '/assets/icons/map_big.png" alt="flow">
							</a>
						</div>';
					}else if($menu_item->object_id == 6){
						echo '<div class="nav-icon" title="'. $menu_item->post_excerpt .'">
							<a href="' .get_permalink($menu_item->object_id). '">
								<h3>' .$menu_item->title. ' visualization</h3>
								<img class="icon" src="' .get_template_directory_uri(). '/assets/icons/flow_big.png" alt="flow">
							</a>
						</div>';
					}else if($menu_item->object_id == 124){
						echo '<div class="nav-icon" title="'. $menu_item->post_excerpt .'">
							<a href="javascript:void(0)" onclick="window.open(\'https://blogs.unicef.org\', \'_blank\');">
								<h3>' .$menu_item->title. '</h3>
								<img class="icon" src="' .get_template_directory_uri(). '/assets/icons/stories_big.png" alt="flow">
							</a>
						</div>';
					}
				}
		  ?>
    </div>
  </div>

<div class="disclaimer">
    <div class="max-width">
        <p><span style="font-weight:bold;">DISCLAIMER:</span> All financial information on this website should always be considered as provisional and its use and re-use must conform to the  <a href="http://opendatacommons.org/licenses/odbl/1.0/" target="_blank">Open Database License (ODbL)</a> and UNICEF’s <a href="http://www.unicef.org/about/legal_disclosure.html" target="_blank">Information Disclosure Policy</a>.</p>&nbsp; 		 
    </div>
</div>

<footer>
    <div class="footer">
      <a href="http://www.unicef.org/about/index.html" target="_blank">About UNICEF</a>
      <a href="http://www.unicef.org/about/contact.html" target="_blank">Contact Us</a>
      <a href="http://www.unicef.org/about/legal.html" target="_blank">Legal</a>
    </div>
  </footer>

  <?php if(($currentPageID) && ($currentPageID == 7 )){ ?>

	  <div class="modal fade" id="details" tabindex="-1" role="dialog" aria-hidden="true">
		<div class="modal-dialog">
		  <div class="modal-content">
			<div class="modal-header">
			  <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
			  <h4 class="modal-title">{{ country }} <img class="icon" src="<?php echo get_template_directory_uri(); ?>/images/flag/{{ country_flag }}-Flag-24.png" alt="Flag"></h4>
			</div>
			<div class="modal-body">


			  <div v-if="id" class="row">
				<div class="col-md-6">
				  <h4 id="output-id">{{ id }}</h4>				   
				  <p id="output-name"  >{{ name }}</p>
				</div>
				<div class="col-md-3">
				  <h5>start date</h5>
				  <p id="output-sdt">{{ sdt }}</p>
				</div>
				<div class="col-md-3">
				  <h5>end date</h5>
				  <p id="output-edt">{{ edt }}</p>
				</div>
			  </div>
			  
			   

			  <div class="row">
				<div class="col-md-12">
				  <div class="well">
					<h4 class="year">{{ year }}</h4>
					<div class="bar-chart"></div>
					 
				  </div>
				  <div v-if="indicatorData.length > 0" class="headline">
                        <h5 id="results">Results: </h5>{{headlinestatement}}
                  </div>
				  <h4 v-if="indicatorData.length > 0" class="indiatorTitle" >Indicator Details</h4>
				  <div v-if="indicatorData.length > 0" class="newIndicatorData">
                        <table class="data-table table dataTable no-footer">
                            <tr>
                                <th rowspan="2">Indicator</th> 
                                <th colspan="2">Baseline</th> 
                                <th>Target</th> 
                                <th>Status</th>                                       
                            </tr>
                            <tr>                                           
                                <th>Value</th>
																<th>Year</th>
                                <th>Value</th> 
                                <th>Value</th>                                        
                            </tr>
                            {{#if indicatorData.length > 0}}                                        
                                <tr v-repeat="indicatorData" >
                                    <td >{{indicator_name}}</td> 
									<td >{{baseline_value | numberformat}}</td>
									<td >{{baseline_year}}</td>
									<td >{{target_value | numberformat }}</td>
									 
									<td >{{status_value}}</td>
									                                        
                                </tr>
                            {{/if}}
                        </table>
                    </div> 
				</div>
			  </div>
			  <div class="row">
				<div class="col-md-6">
				  <h5>Additional Links</h5>
				  <ul id="additional-links" class="links">
					<?php
                        //<li v-repeat="links"><a href="{{ $value }}" target="_blank" v-if="$value">{{ $key }}</a></li>
                    ?>
                    {{#if document_links.length > 0}}
                    <li v-repeat="document_links"  >
                        <a href="{{ url }}" target="_blank" v-if="url_text">{{ url_text }}</a>
                    </li>
                    {{/if}}
                    
                    
				  </ul>
				</div>
				<div class="col-md-6">
				  <h5>Export Data</h5>
				  <ul id="downloads" class="links">
					<li v-if="downloads"><a href="{{ downloads }}" target="_blank">Export all {{ country }} data</a></li>
					<li v-if="!downloads">Data unavailable</li>
				  </ul>
				</div>
			  </div>
			</div>
		  </div>
		</div>
	  </div>
  <?php } ?>

  <script>
    (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function()
    { (i[r].q=i[r].q||[]).push(arguments)}
    ,i[r].l=1*new Date();a=s.createElement(o),
    m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
    })(window,document,'script','//www.google-analytics.com/analytics.js','ga');
    ga('create', 'UA-54515425-1', 'auto');
    ga('send', 'pageview');
  </script>

    <?php if(($currentPageID) && ($currentPageID == 7 )){ ?>

	<script id="sentence-b" type="x-template">
    In
    <span class="year dropdown"
        v-component="year-dropdown"
        v-with="year">
    </span>
    UNICEF {{verb}} to spend a total of
    <span class="amount disbursement">{{ amount | usd }}</span>
    in
    <span class="country dropdown"
        v-component="country-dropdown"
        v-with="country"></span>.
  </script>
  <script id="sentence-c" type="x-template">
    <div class="donor info"></div>
    In <span class="year dropdown"
            v-component="year-dropdown"
            v-with="year"></span>
    UNICEF allocated a total of 
    <span class="amount commitment">{{ amount | usd }}</span> received from
    <span class="filter donor dropdown"
            v-component="donor-dropdown"
            v-with="filter"></span>
    to programmes in <span class="country dropdown"
            v-component="country-dropdown"
            v-with="country"></span>.
  </script>
  <script id="sentence-e" type="x-template">
    <div class="sector info"></div>
    In
    <span class="year dropdown"
        v-component="year-dropdown"
        v-with="year"></span>
    UNICEF {{ verb }} a total of
    <span class="amount expense">{{ amount | usd }}</span>
    in aid for
    <span class="filter sector dropdown"
        v-component="sector-dropdown"
        v-with="filter"></span>
    {{ preposition }}
    <span class="country dropdown"
        v-component="country-dropdown"
        v-with="country"></span>.
  </script>

	<!--[if lt IE 9]>
	<script src="<?php echo get_template_directory_uri(); ?>/bower_components/es5-shim/es5-shim.js"></script>
	<script src="<?php echo get_template_directory_uri(); ?>/bower_components/es5-shim/es5-sham.js"></script>
	<![endif]-->


	<?php } ?>

	<?php if(($currentPageID) && ($currentPageID == 2 )){ ?>

		<script src="<?php echo get_template_directory_uri(); ?>/bower_components/jquery/dist/jquery.js"></script>
        <script src="<?php echo get_template_directory_uri(); ?>/bower_components/components-bootstrap/js/bootstrap.min.js"></script>
        <script src="<?php echo get_template_directory_uri(); ?>/bower_components/lodash/dist/lodash.js"></script>
        <script src="<?php echo get_template_directory_uri(); ?>/bower_components/d3/d3.min.js"></script>  
        <script src="<?php echo get_template_directory_uri(); ?>/js/component/barChartOutcome.js"></script>  
        <script src="<?php echo get_template_directory_uri(); ?>/js/component/barChartExpenditureByCountryRegions.js"></script>  

        <!-- HIGHCHARTS FILES  -->
        <script src="http://code.highcharts.com/highcharts.js"></script>
        <script src="http://code.highcharts.com/maps/modules/map.js"></script>
        <script src="http://code.highcharts.com/highcharts-3d.js"></script>
        <script src="<?php echo get_template_directory_uri(); ?>/js/summary_fn.js"></script>
		  
		  <script>
			$('.nav-icon').tooltip({ container: 'body' });
		  </script>
	<?php } ?>
	
	<?php if(($currentPageID) && ($currentPageID == 6 )){ // flow page ?>
		<script src="<?php echo get_template_directory_uri(); ?>/bower_components/jquery/dist/jquery.js"></script>
		<script src="<?php echo get_template_directory_uri(); ?>/bower_components/components-bootstrap/js/bootstrap.min.js"></script>
        <script src="<?php echo get_template_directory_uri(); ?>/bower_components/d3/d3.min.js"></script> 

		<script id="sentence-template" type="x-template">
            In <span class="year dropdown" v-component="year-dropdown" v-with="year"></span> UNICEF allocated a total of <span class="amount commitment">{{ donations | usd }}</span>  to programmes in {{ country_count }} countries around the world and spent <span class="amount expense">{{ expenses | usd }}</span> on activities spanning {{ sectors }} Programme {{ sectors | pluralize Area }}.
		</script>

		<script src="<?php echo get_template_directory_uri(); ?>/bower_components/d3-sankey/sankey/sankey.js"></script>
		<script src="<?php echo get_template_directory_uri(); ?>/bower_components/requirejs/require.js" data-main="<?php echo get_template_directory_uri(); ?>/js/sankey.js"></script>
		<script>
			$('#main-nav').stop().animate({ left: 0 }, 1000);
			$('.nav-icon').tooltip( { container: 'body'});
		</script>
	<?php } ?>

	<?php if(($currentPageID) && ($currentPageID == 7 )){ ?>
		<script src="<?php echo get_template_directory_uri(); ?>/bower_components/jquery/dist/jquery.js"></script>		
    <script src="<?php echo get_template_directory_uri(); ?>/bower_components/DataTables/media/js/jquery.dataTables.min.js"></script>
    <script src="<?php echo get_template_directory_uri(); ?>/bower_components/components-bootstrap/js/bootstrap.min.js"></script>
    <script type="text/javascript" src="https://maps.googleapis.com/maps/api/js?key=AIzaSyDPtrl4-F9IreUYlW6O0PoXvaJODsae3i8"></script>
    <script src="<?php echo get_template_directory_uri(); ?>/bower_components/d3/d3.min.js"></script>
    <?php /*
    <!------------- Highcharts Library Files -------------------->
    <script src="http://cdnjs.cloudflare.com/ajax/libs/proj4js/2.2.2/proj4.js"></script>
    <!--<script src="http://code.highcharts.com/highcharts.js"></script>-->
    <script src="http://code.highcharts.com/maps/highmaps.js"></script>
    <script src="http://code.highcharts.com/maps/modules/map.js"></script>
    <script src="http://code.highcharts.com/modules/exporting.js"></script>

    <script src="http://code.highcharts.com/maps/modules/data.js"></script>
    <script src="http://code.highcharts.com/mapdata/countries/in/in-all.js"></script>
    <!-------------------- Development File ------------------->
    <script type="text/javascript" src="../wp-content/themes/openunicef/js/drawmap.js"></script>
    <!--------------------- CSS File -------------------------->
    <link rel="stylesheet" type="text/css" href="../wp-content/themes/openunicef/drawmap.css"/> 
     */
    ?>
    <script src="<?php echo get_template_directory_uri(); ?>/bower_components/requirejs/require.js" data-main="<?php echo get_template_directory_uri(); ?>/js/main.js"></script>
    <!--------------------JQuery Library Files -------------------->
            <!--<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js"></script>-->

                                        <!--<script src="../wp-content/themes/openunicef/bower_components/jquery/dist/jquery.js"></script>-->
                                <!--	<script src="http://malsup.github.io/jquery.blockUI.js"></script>-->
                                        <!--<script src="http://code.jquery.com/ui/1.11.4/jquery-ui.js"></script>-->



    <script>
    $('#main-nav').stop().animate({left: 0}, 1000);
    //$('.nav-icon').tooltip();
    $('.nav-icon').tooltip({container: 'body'});
    </script>	
	<?php } ?>

	<?php if (($currentPageID) && (  ($currentPageID == 47) || ($currentPageID == 112) || ($currentPageID == 113)  )  ) { ?>

                                <!--<script src="<?php echo get_template_directory_uri(); ?>/bower_components/jquery/dist/jquery.js"></script>				-->
                                <!--<script src="http://code.jquery.com/jquery-latest.min.js" type="text/javascript"></script>-->
    <script src="<?php echo get_template_directory_uri(); ?>/bower_components/jquery/dist/jquery.js"></script>
    <script src="<?php echo get_template_directory_uri(); ?>/bower_components/components-bootstrap/js/bootstrap.min.js"></script>
    <script>
        var ajaxurl = "<?php echo admin_url('admin-ajax.php'); ?>";
    </script>   
    <script src="<?php echo get_template_directory_uri(); ?>/js/document-page.js"></script>
    <script src="<?php echo get_template_directory_uri(); ?>/js/script.js"></script> 		

<?php } ?>

	<script>
	$(document).ready(function() {
		//Country
		$('#country_search_id').change(function() {
			var item_val = $(this).val();
			$(this).attr('title', item_val);			
			$(this).attr('rel', item_val);
		});
		
		$('#country_search_id option').hover(function() {
			$('#country_search_id').attr('title', '');
		},
		function() {
			$('#country_search_id').attr('title', $('#country_search_id').attr('rel'));
		});
		
		//programme areas
		$('#programme_areas_search_id').change(function() {
			var item_val = $(this).val();
			$(this).attr('title', item_val);			
			$(this).attr('rel', item_val);
		});
		
		$('#programme_areas_search_id option').hover(function() {
			$('#programme_areas_search_id').attr('title', '');
		},
		function() {
			$('#programme_areas_search_id').attr('title', $('#programme_areas_search_id').attr('rel'));
		});
		
		//resource partners
		$('#resource_partners_search_id').change(function() {
			var item_val = $(this).val();
			$(this).attr('title', item_val);			
			$(this).attr('rel', item_val);
		});
		
		$('#resource_partners_search_id option').hover(function() {
			$('#resource_partners_search_id').attr('title', '');
		},
		function() {
			$('#resource_partners_search_id').attr('title', $('#resource_partners_search_id').attr('rel'));
		});
		
		//Set tooltip for selected dropdown
		var selected_coun_val = $('#country_search_id').val();
		if(selected_coun_val != 0) {
			$('#country_search_id').attr('title', selected_coun_val);
		}
		var selected_program_val = $('#programme_areas_search_id').val();
		if(selected_program_val != 0) {
			$('#programme_areas_search_id').attr('title', selected_program_val);
		}
		var selected_donor_val = $('#resource_partners_search_id').val();
		if(selected_donor_val != 0) {
			$('#resource_partners_search_id').attr('title', selected_donor_val);
		}
	});
	</script>
	
	<script>
	function urlEncoder_search(str) {
	  str = (str + '')
		.toString();
	  return encodeURI(str)
		.replace(/!/g, '%21')
		.replace(/'/g, '%27')
		.replace(/&/g, '%26')
		.replace(/\*/g, '%2A')
		.replace(/#/g, '%23')
		.replace(/%20/g, '+');
	}

	$(document).ready(function() {
		$('.btn_search_dd').click(function() {
			if($('#programme_areas_search_id').val() != '0' && $('#resource_partners_search_id').val() != '0') {
				alert('You can not select "Programme Areas" and "Resource Partners" simultaniuosly. Please select any one of them.');
				return false;
			}
			else {
				if($('#programme_areas_search_id').val() != '0') {//Go to programme_areas tab
					var title = $('#programme_areas_search_id').val();
					var counval = $('#country_search_id').val();
					var jump = SITE_BASE_URL + '/map?k=programme&q=' + urlEncoder_search(title) + '&counval=' + counval;
					window.open(jump,'_blank');
				}
				else if($('#resource_partners_search_id').val() != '0') {//Go to donor tab	
					var title = $('#resource_partners_search_id').val();
					var counval = $('#country_search_id').val();
					var jump = SITE_BASE_URL + '/map?k=donor&q=' + urlEncoder_search(title) + '&counval=' + counval;
					window.open(jump,'_blank');
				}
				else {//Go to country tab
					var title = $('#country_search_id').val();
					var jump = SITE_BASE_URL + '/map?k=country&q=' + urlEncoder_search(title);
					window.open(jump,'_blank');
				}			
			}
		});
	});
	</script>
</body>
</html>
