<?php
/**
 * Template Name: Home
 */
get_header();
?>
<style>
    .wrapper_index{
        height : auto;
    }
    .bar_chart_outcome{
        height : 400px;    
        overflow-x: hidden;
        overflow-y: auto;
        
    }
    .modal-dialog{
        width : 700px;
    }
    .bar_chart_outcome tspan{
        fill:#77BDD9;        
        cursor: pointer;
        font-weight: bold;
        font-size: 12px;
    }
    .bar_chart_outcome tspan:hover{
        fill:red;    
        background : yellow;
    }
    #barpopupspan{
        float:left;
        padding-bottom: 25px;    
    }
    #barpopupspan a{        
        color:black;
        font-weight: bold;
    }
    #barpopupspan a:hover{        
        color:red;
    }
</style>
<script type="text/javascript">
    var summaryTotalJson ; 
</script>
<link href="<?php bloginfo('template_directory') ?>/styles/jquery.mCustomScrollbar.css" rel="stylesheet" />
<script src="<?php echo get_template_directory_uri(); ?>/js/bowser.min.js"></script>
<script src="<?php echo get_template_directory_uri(); ?>/js/extendingpiechart.js"></script>
<div class="center">
    
    <div class="center-logo-plc"><img src="<?php echo get_template_directory_uri(); ?>/assets/unicef-transparency-portal-logo.png"></div>
    
    <h1 class="center-heading"><?php echo get_bloginfo('name'); ?></h1>
        <p>
        <span class="show">
			Transparency and accountability is a top priority for UNICEF in delivering development and humanitarian results for children. The UNICEF Transparency Portal is part of our continuous efforts to being open and transparent through direct communication to the public on how and where we use resources. UNICEF’s efforts are reflected in our scores in the annual <a href="http://ati.publishwhatyoufund.org/" target="_blank">Aid Transparency Index</a> - UNICEF is now ranked as the 3rd most transparent out of 46 major donor organizations worldwide. <span class="read_more">Read more</span>

            <span class="unfold">
                <br>UNICEF is also recognized as the organization that has made the most significant progress since joining the <a href="http://www.aidtransparency.net/" target="_blank">International Aid Transparency Initiative</a> (IATI), and is one of only 10 organizations that fulfilled their commitment to making information about their finances, programmes and results public by the end of 2015.
				
				<br><br>As a member of the UN Development Group’s inter-agency Transparency Task Team, UNICEF is actively advocating for increased transparency across the UN system. Through this, a number of other UN agencies have signed up to IATI and committed to publicly disclose information on aid spending and make it easier for all stakeholders to find, use and compare standardized data.
				
				<br><br>UNICEF was recently appointed to the IATI Governing Board, and is contributing to efforts to move discourse beyond compliance to the IATI Common Standard, to one where transparency underpins the delivery of development and humanitarian programmes, and drives global efforts for more efficient and effective use of aid.
				
				<br><br>UNICEF has been pursuing a series of measures to make more information about programme and operation performance as well as funds spending available to the public. This enhances on-going efforts to make the organization more efficient, responsive, and better able to collaborate and achieve results for children, especially the most disadvantaged and marginalized.
				
				<br><br>UNICEF’s <a href="http://www.unicef.org/about/legal_disclosure.html" target="_blank">Information Disclosure Policy</a> explicitly outlines its commitment to making programmes and operations information available to the public. UNICEF has in place a policy for full public disclosure of internal audit reports issued after 30 September 2012.  A growing number of <a href="<?php echo get_site_url(); ?>/documents/" target="_blank">corporate documents</a> such as country programme documents, evaluation reports, details on supply and logistics, financial rules and regulations, and annual programme results reports are also accessible through this portal.
				
				<br><br>Information available in the open datasets on this website has been extracted directly from UNICEF's operating system (VISION) as well as other data systems, and reflects inputs made by individual UNICEF Offices. The contents of the datasets are updated on a monthly basis with efforts focused on improvements in completeness, quality and comprehensiveness.
				
				<br><br>All financial information on this website should always be considered as provisional. Use of these datasets is guided by UNICEF’s <a href="http://www.unicef.org/about/legal_disclosure.html" target="_blank">Information Disclosure Policy</a> and has been made available under the <a href="http://opendatacommons.org/licenses/odbl/1.0/" target="_blank">Open Database License (ODbL)</a>.
            </span>

        </span>
    </p>
</div>

<img class="home_img" src="<?php echo get_template_directory_uri(); ?>/assets/home_img.gif" alt="unicef images">
</div>

<div class="position_summary position_summary_cstm">
    <div class="summary_and_line_charts">
        <h2>Summary</h2>

        <div class="category">
            <h3></h3>
            <span class="pretty_number p_n_b"></span>
            <div class="graph_c"></div>
        </div>

        <div class="category">
            <h3>s</h3>
            <span class="pretty_number p_n_c"></span>
            <div class="graph_e"></div>
        </div>

   <!-- <div class="category" >
            <h3></h3>
            <div>
                <div id="VO1" class="pie_chart_outcome_a" style="margin-left:5px;">
                    <div class="pie"></div>
                    <div class="legend"></div>            
                </div>
            </div>
        </div>  
		
				
    <div id="tweetScroller" class="tweetPlc">
            <?php //dynamic_sidebar( 'sidebar-2' ); ?>  
         </div> 
	-->	
       

    </div>

    <div class="summary">
        <h2>Distribution of Programme Funds</h2>
        <input type="hidden" value="-1" id="VO2_PreIndex" />
        <input type="hidden" value="-1" id="VO3_PreIndex" />
        <input type="hidden" value="-1" id="VO4_PreIndex" />
        <div class="category" id="myPiedetail_a">
            <h3>Where the money comes from <span class="donor info"></span></h3>
            <div id='VO2' class="pie_chart_a">
            </div>
            <span class="pretty_number"></span>
            <div class="count count_a"></div>

            <!--<div class="pie"></div>
            <div class="legend"></div>-->


            <div class="list_a"></div>
            <div class="details details_a"></div>
            <div class="view_full_list">expand full list</div>
        </div>

        <div class="category" id="myPiedetail_b">
            <h3>Where the money goes</h3>
            <div id="VO3" class="pie_chart_b">
            </div>
            <span class="pretty_number"></span>
            <div class="count count_b"></div>


            <!--   <div class="pie"></div>
               <div class="legend"></div>-->


            <div class="list_b"></div>
            <div class="details details_b"></div>
            <div class="view_full_list">expand full list</div>
        </div>

        <div class="category" id="myPiedetail_c">
            <h3>What the money is spent on <span class="sector info"></span></h3>
            <div id="VO4" class="pie_chart_b">
            </div>
            <span class="pretty_number"></span>
            <div class="count count_c"></div>

            <div class="list_c"></div>
            <div class="details details_c"></div>
            <div class="view_full_list">expand full list</div>
        </div>
    </div>
</div>

<!--<div class="explore">
  <div class="icon_group">
<?php
//$headerMenu = array_reverse($headerMenu);
/* foreach ((array)$headerMenu as $key => $menu_item )
  {
  if($menu_item->object_id == 47){
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
  }
  } */
?>
  </div>
</div>

<div class="disclaimer">
  <div class="max-width">
      <p><span style="font-weight:bold;">DISCLAIMER:</span> All financial information on this website should always be considered as provisional and its use and re-use must conform to the OKD Compliant Creative Commons Attribution Share-Alike 3.0 Unported license. <a href="http://www.unicef.org/about/legal_disclosure.html" target="_blank">Information Disclosure Policy</a></p>&nbsp; 		 
  </div>
</div>-->

<!-- Start : Outcome popup -->
<div class="modal fade" id="outcome_details" tabindex="-1" role="dialog" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">

            <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
                <h4 class="modal-title"></h4>
            </div>

            <div class="modal-body">

                <div class="row">
                    <div class="col-md-12">
                        <div class="well">
                            <h4 class="outcome_title"></h4>
                            <div id="modal-body" class="bar_chart_outcome">

                                <span class="pretty_number"></span>
                                <div class="count count_c_outcome"></div>

                                <div class="list_c_outcome"></div>
                                <div class="details details_c_outcome"></div>        

                            </div>
                            <div  style="clear:both;"></div>
                            <div id="barpopupspan" style=""></div>
                            <div  style="clear:both;"></div>
                        </div>
                    </div>
                </div>

            </div>

        </div>
    </div>
</div>
<style>
    /*## client disable functionality tmp  ##*/ 
    #myPiedetail_a .count_a, #myPiedetail_a .list_a, #myPiedetail_a .details_a, #myPiedetail_a .view_full_list{
        display :none;
        visibility :hidden;
    }
    
</style>
<!-- End : Outcome popup  -->  
<?php get_footer(); ?>