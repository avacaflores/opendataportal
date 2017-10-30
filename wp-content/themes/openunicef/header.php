<?php
/**
 * The Header template for our theme
 *
 * Displays all of the <head> section and everything up till <div id="main">
 *
 * @package WordPress
 * @subpackage Open_Unicef
 * @since Open Unicef 1.0
 */
?><!DOCTYPE html>
<!--[if IE 7]>
<html class="ie ie7" <?php language_attributes(); ?>>
<![endif]-->
<!--[if IE 8]>
<html class="ie ie8" <?php language_attributes(); ?>>
<![endif]-->
<!--[if !(IE 7) & !(IE 8)]><!-->
<html <?php language_attributes(); ?>>
<!--<![endif]-->
<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>">
	<meta name="viewport" content="width=device-width">
	<title><?php wp_title( '|', true, 'right' ); ?></title>		
	<meta name="description" content="UNICEF OPEN DATA">
	<meta name="author" content="DFA / OPENDATA">
	<!--[if gte IE 10]><!-->
		<meta http-equiv="X-UA-Compatible" content="IE=EmulateIE10">
	<!--[endif]-->
	<?php 
		//wp_head();
        
        global $hosted_folder_name;
		global $currentPageID,$headerMenu;
		$currentPageID = $post->ID;
        $site_base_url = get_site_url();
        $template_path = $hosted_folder_name . '/wp-content/themes/openunicef';
        $template_path_rel = '/wp-content/themes/openunicef';
        global $tab_selected_dflt;
        global $tab_selected_spent;
		global $tab_selected_spent_donor;
        $tab_selected_dflt = "selected";
        $tab_selected_spent = "";
		$tab_selected_spent_donor = "";
	$default_year = get_option( "openunicef_default_year", '0000');        
        $current_year = date('Y'); 
        
	$new_selected_year = ($default_year == "0000") ? $current_year :  $default_year; 
        
	?>
	<script type="text/javascript">		
            <?php 
                if($default_year != "0000"){
                ?>
                var DEFAULT_SELECTED_YEAR = "<?php echo $new_selected_year;?>";
                <?php
                }
            ?>
	</script>
	<!--[if lt IE 9]>
	<script src="http://html5shiv.googlecode.com/svn/trunk/html5.js"></script>
	<![endif]-->

    <link href="<?php echo get_template_directory_uri(); ?>/styles/common.css" rel="stylesheet" type="text/css" />
	<link href="<?php echo get_template_directory_uri(); ?>/bower_components/components-bootstrap/css/bootstrap.min.css" rel="stylesheet" />
	<link href="<?php echo get_template_directory_uri(); ?>/styles/screen.css" rel="stylesheet" type="text/css" />
	<?php if (!empty($currentPageID) && $currentPageID==2) { // home page ?>
        <link href='//fonts.googleapis.com/css?family=Roboto:900,400,700,500|Roboto+Slab:400,700' rel='stylesheet' type='text/css' />
	    <link href="<?php echo get_template_directory_uri(); ?>/styles/screen-v2.css" rel="stylesheet" type="text/css" />
        <link href="<?php echo get_template_directory_uri(); ?>/styles/main_home.css" rel="stylesheet" type="text/css">

    <?php } ?>

    <?php if (!empty($currentPageID) && $currentPageID==6) { // flow page ?>
        <link href='//fonts.googleapis.com/css?family=Roboto+Slab:300,400,700,900' rel='stylesheet' type='text/css'>
	    <link href="<?php echo get_template_directory_uri(); ?>/styles/main.css" rel="stylesheet" type="text/css">
		


    <?php } ?>

    <?php if (!empty($currentPageID) && $currentPageID==7) { // map page ?>
        <link href='//fonts.googleapis.com/css?family=Roboto+Slab:300,400,700,900' rel='stylesheet' type='text/css'>
        <link href="<?php echo get_template_directory_uri(); ?>/bower_components/DataTables/media/css/jquery.dataTables.min.css" rel="stylesheet" />
	    <link href="<?php echo get_template_directory_uri(); ?>/styles/main.css" rel="stylesheet" type="text/css">
		


    <?php } ?>

	<?php if (!empty($currentPageID) && $currentPageID==47) { // document page ?>
	    <link href='//fonts.googleapis.com/css?family=Roboto+Slab:300,400,700,900' rel='stylesheet' type='text/css'>
	    <link href='//fonts.googleapis.com/css?family=Roboto:900,400,700,500|Roboto+Slab:400,700' rel='stylesheet' type='text/css' />
	    <link href="<?php echo get_template_directory_uri(); ?>/bower_components/DataTables/media/css/jquery.dataTables.min.css" rel="stylesheet" />
	    <link href="<?php echo get_template_directory_uri(); ?>/styles/main.css" rel="stylesheet" type="text/css">
	    <link rel="stylesheet" href="http://netdna.bootstrapcdn.com/font-awesome/4.2.0/css/font-awesome.min.css">
		<link href="<?php echo get_template_directory_uri(); ?>/styles/documents-nav.css" rel="stylesheet" type="text/css">		
	<?php } ?>

    <?php if (!empty($currentPageID) && $currentPageID==7) { // map page variables
        $programme_areas = array();
        $programme_codes_areas = array();
        $countries = array();
		$donors = array();
        $matched_search_value = "";
		
        if (!empty($_GET['k']) && $_GET['k']=='programme') {
            $tab_selected_dflt = "";
            $tab_selected_spent = "selected";
			$tab_selected_spent_donor = "";
            $get_programme_name = !empty($_GET['q']) ? stripslashes(urldecode($_GET['q'])) : "";
            $summary_sectors_json = curl_get_contents($site_base_url . $template_path_rel . "/json/summary/summary_sectors.json");
            $summary_sectors = json_decode($summary_sectors_json, true);
			
            if (!empty($summary_sectors)) {
                foreach ($summary_sectors as $iter=>$collect) {
                    if ($collect['year'] == $new_selected_year) {
                        if (!empty($collect['top_10'])) {
                            foreach ($collect['top_10'] as $iter1=>$collect1) {
                                $programme_areas[$collect1['name']] = $collect1['programme_code'];
                            }
                        }
                        if (!empty($collect['other'])) {
                            foreach ($collect['other'] as $iter2=>$collect2) {
                                $programme_areas[$collect2['name']] = $collect2['programme_code'];
                            }                            
                        }
                    }
                }
            $programme_codes_areas = array_flip($programme_areas);
            }
            $matched_search_value = !empty($programme_areas[$get_programme_name]) ? addslashes($programme_areas[$get_programme_name]) : "";
        }
        if (!empty($_GET['k']) && $_GET['k']=='country') {
            $get_country_name = !empty($_GET['q']) ? stripslashes(urldecode($_GET['q'])) : "";
            $summary_countries_json = curl_get_contents($site_base_url . $template_path_rel . "/json/summary/summary_countries.json"); 
            $summary_countries = json_decode($summary_countries_json, true);
			
            if (!empty($summary_countries)) {
                foreach ($summary_countries as $iter=>$collect) {
                    if ($collect['year'] == $new_selected_year) {
                        if (!empty($collect['top_10'])) {
                            foreach ($collect['top_10'] as $iter1=>$collect1) {
                                $countries[$collect1['name']] = $collect1['name'];
                            }
                        }
                        if (!empty($collect['other'])) {
                            foreach ($collect['other'] as $iter2=>$collect2) {
                                $countries[$collect2['name']] = $collect2['name'];
                            }                            
                        }
                    }
                }
            }
            $matched_search_value = !empty($countries[$get_country_name]) ? addslashes($countries[$get_country_name]) : "";
        }
		$matched_country_search_value = "";
		$matched_country_search_value = !empty($_GET['counval']) ? stripslashes(urldecode($_GET['counval'])) : "";
		if (!empty($_GET['k']) && $_GET['k']=='country') {
			$matched_country_search_value = $matched_search_value;
		}
		
		//Donors
		if (!empty($_GET['k']) && $_GET['k']=='donor') {
			 $tab_selected_dflt = "";
            $tab_selected_spent = "";
			$tab_selected_spent_donor = "selected";
			$get_donor_name = !empty($_GET['q']) ? stripslashes(urldecode($_GET['q'])) : "";
			$matched_search_value = !empty($get_donor_name) ? addslashes($get_donor_name) : "";
        }
    }
	
	//Code for "Search Feature" - Vikash Jain
	$programme_areas_search = array();
	$programme_codes_areas_search = array();
	$countries_search = array();
	$donors_search = array();
	//Programme
	$summary_sectors_json_search = curl_get_contents($site_base_url . $template_path_rel . "/json/summary/summary_sectors.json");
	$summary_sectors_search = json_decode($summary_sectors_json_search, true);
	if (!empty($summary_sectors_search)) {
		foreach ($summary_sectors_search as $iter=>$collect) {
			if ($collect['year'] == $new_selected_year) {
				if (!empty($collect['top_10'])) {
					foreach ($collect['top_10'] as $iter1=>$collect1) {
						$programme_areas_search[$collect1['name']] = $collect1['programme_code'];
					}
				}
				if (!empty($collect['other'])) {
					foreach ($collect['other'] as $iter2=>$collect2) {
						$programme_areas_search[$collect2['name']] = $collect2['programme_code'];
					}                            
				}
			}
		}
		$programme_codes_areas_search = array_flip($programme_areas_search);
		sort($programme_codes_areas_search);
	}
	
	//Countries
	$summary_countries_json_search = curl_get_contents($site_base_url . $template_path_rel . "/json/summary/summary_countries.json"); 
	$summary_countries_search = json_decode($summary_countries_json_search, true);
	if (!empty($summary_countries_search)) {
		foreach ($summary_countries_search as $iter=>$collect) {
			if ($collect['year'] == $new_selected_year) {
				if (!empty($collect['top_10'])) {
					foreach ($collect['top_10'] as $iter1=>$collect1) {
						$countries_search[$collect1['name']] = $collect1['name'];
					}
				}
				if (!empty($collect['other'])) {
					foreach ($collect['other'] as $iter2=>$collect2) {
						$countries_search[$collect2['name']] = $collect2['name'];
					}                            
				}
			}
		}
		sort($countries_search);
	}
	
	//Donors
	$summary_donors_and_sector_json = curl_get_contents($site_base_url . $template_path_rel . "/json/table/donor_and_sector_ids.json");
	$summary_donors_and_sector = json_decode($summary_donors_and_sector_json, true);
	foreach ($summary_donors_and_sector['donors'] as $iter=>$collect) {
		$donors_only[$collect] = $iter;
	}
	
	$summary_donors_json_search = curl_get_contents($site_base_url . $template_path_rel . "/json/summary/summary_donors.json");
	$summary_donors_search = json_decode($summary_donors_json_search, true);
	if (!empty($summary_donors_search)) {
		foreach ($summary_donors_search as $iter=>$collect) {
			if ($collect['year'] == $new_selected_year) {
				if (!empty($collect['top_10'])) {
					foreach ($collect['top_10'] as $iter1=>$collect1) {
						$donors_search[$collect1['name']] = $collect1['name'];
					}
				}
				if (!empty($collect['other'])) {
					foreach ($collect['other'] as $iter2=>$collect2) {
						$donors_search[$collect2['name']] = $collect2['name'];
					}                            
				}
			}
		}
		$del_val = 'amounts under 1000';
		if(($key = array_search($del_val, $donors_search)) !== false) {
			unset($donors_search[$key]);
		}
		sort($donors_search);
	}
	?>

    <script type="text/javascript">
		// var TEMPLATE_PATH = "<?php // echo get_template_directory_uri(); ?>";    
        var TEMPLATE_PATH = "<?php echo $template_path; ?>";
        var SITE_BASE_URL = "<?php echo $site_base_url;?>";
	</script>
    <script type="text/javascript">
        <?php if (!empty($currentPageID) && $currentPageID==7) { // map page variables ?> 
                var SEARCH_FOR = '<?php echo !empty($_GET['k']) ? urldecode($_GET['k']) : ""?>';
                var SEARCH_VALUE = '<?php echo !empty($matched_search_value) ? $matched_search_value : ""?>';
				var COUNTRY_SEARCH_VALUE= '<?php echo !empty($matched_country_search_value) ? $matched_country_search_value : ""?>';
				var PROGRAMME_CODES_AREAS_OBJ = <?php echo json_encode($programme_codes_areas);?>;
        <?php } ?>
				var DONORS_OBJ = <?php echo json_encode($donors_only);?>;
	</script>
</head>
<body>
	<div class="my_tooltip"></div>
	<div class="thin_nav">
		<span class="back">
			<a class="back" href="http://www.unicef.org">Back to UNICEF.org</a>
		</span>
		<span class="social_media">
                        <a class="border" href="<?php echo $site_base_url;?>/rss-feeds/" >RSS Feeds</a>
			<a class="border" href="https://www.facebook.com/unicef?_rdr=p" target="_blank">Facebook</a>
			<a class="border" href="https://twitter.com/unicef" target="_blank">Twitter</a>
			<a href="http://www.supportunicef.org" target="_blank">Support UNICEF</a>
		</span>
	 </div>

	 <?php if(($currentPageID) && ($currentPageID == 2 )) echo '<div class="wrapper_index">';  ?>
		 <header class="top">
			<!--<h1><?php echo get_bloginfo('name'); ?></h1>-->
			<a href="http://www.unicef.org/" target="_blank">
			  <img class="logo" src="<?php echo get_template_directory_uri(); ?>/assets/unicef_logo.png" alt="unicef logo">
			</a>

			<?php
				/** script to show Menu items **/

				$fetchMenu = array(
								'order'                  => 'ASC',
								'orderby'                => 'menu_order',
								'post_type'              => 'nav_menu_item',
								'post_status'            => 'publish',
								'post_parent'            => '0',
								'output'                 => ARRAY_A,
								'output_key'             => 'menu_order',
								'nopaging'               => true,
								'update_post_term_cache' => false
							); 
				
				$headerMenu = wp_get_nav_menu_items('header_menu',$fetchMenu);	

			?>
  
  <div class="search_filter"> 

    <span class="year dropdown"> 
    <div style="max-height: 366px;">
        <label>
		<select id="country_search_id" class="btn_head_dd"  title="All Countries" rel="All Countries">
		<option class="option" value="0">All Countries</option>
		<?php foreach($countries_search as $countries){ ?>
			<option class="option" value="<?php echo $countries;?>" <?php if($matched_country_search_value == $countries) {echo 'selected';} ?>><?php echo $countries;?></option>
		<?php } ?>
		</select>
       </label>
    </div>
    </span>

	<span class="year dropdown"> 
    <div style="max-height: 366px;">
        <label>
		<select id="programme_areas_search_id" class="btn_head_dd" title="All Programme Areas" rel="All Programme Areas">
		<option class="option" value="0">All Programme Areas</option>
		<?php foreach($programme_codes_areas_search as $programme_codes_area){ ?>
			<option class="option" value="<?php echo $programme_codes_area;?>" <?php if($get_programme_name == $programme_codes_area) {echo 'selected';} ?>><?php echo $programme_codes_area;?></option>
			<?php } ?>
		</select>
       </label>
    </div>
    </span>

	<span class="year dropdown"> 
    <div style="max-height: 366px;">
		<label>
		<select id="resource_partners_search_id" class="btn_head_dd" title="All Resource Partners" rel="All Resource Partners">
		<option class="option" value="0">All Resource Partners</option>
		<?php foreach($donors_search as $donors){ ?>
			<option class="option" value="<?php echo $donors;?>" <?php if($get_donor_name === $donors) {echo 'selected';} ?>><?php echo $donors;?></option>
			<?php } ?>
		</select>
            </label>

    </div>
    </span>

    <button class="btn_search_dd" type="button">
       <img src="<?php echo get_template_directory_uri();?>/assets/icons/search-icon-header.png"> 
     </button>
    </div>
  <!-- header filter search ends here -->

			<nav id="main-nav">
			  <ul>
				<?php
					foreach ((array)$headerMenu as $key => $menu_item )
					{
						$activeMenu = '';						

						if(($currentPageID == $menu_item->object_id) || ($currentPageID == $menu_item->object_id)){
							$activeMenu = 'active';	
						}

						//Our Stories 124
						if($menu_item->object_id == 124){
							echo '<li><a href="javascript:void(0)" onclick="window.open(\'https://blogs.unicef.org\', \'_blank\');" class="' .$activeMenu. '"><div class="nav-icon button" data-placement="bottom" title="'. $menu_item->post_excerpt .'"/> </div>' .$menu_item->title.'</a></li>';
						}else{
							echo '<li><a href="' .get_permalink($menu_item->object_id). '" class="' .$activeMenu. '"><div class="nav-icon button" data-placement="bottom" title="'. $menu_item->post_excerpt .'"/> </div>' .$menu_item->title.'</a></li>';
						}
						
					}
				?>				
			  </ul>
			</nav>
             <?php if (!empty($currentPageID) && $currentPageID==6) { // only for flow page ?>
                <p class="last-updated"></p>
             <?php } ?>
		</header>
		
		<?php

		//Set empty the SESSION values those are in use for document functionality in function.php

		if(isset($_SESSION['CATEGORY'])){
				$_SESSION['CATEGORY'] = '';		
		}

		if(isset($_SESSION['RESOURCE-PARTNERS'])){
				$_SESSION['RESOURCE-PARTNERS'] = '';		
		}

		if(isset($_SESSION['RECIPIENT-COUNTRIES'])){
				$_SESSION['RECIPIENT-COUNTRIES'] = '';			
		}

		if(isset($_SESSION['SECTORS'])){
				$_SESSION['SECTORS'] = '';			
		}

		if(isset($_SESSION['GRANT-DESCRIPTION'])){
				$_SESSION['GRANT-DESCRIPTION'] = '';			
		}

		if(isset($_SESSION['REPORT-TYPE'])){
				$_SESSION['REPORT-TYPE'] = '';			
		}

		?>