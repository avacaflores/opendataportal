<?php
/**
 * Template Name: Our Stories
 */
//echo get_site_url();exit;
//echo $wp_version ;exit;
get_header();
?>
<link href='//fonts.googleapis.com/css?family=Roboto+Slab:300,400,700,900' rel='stylesheet' type='text/css'>
<link href='//fonts.googleapis.com/css?family=Roboto:900,400,700,500|Roboto+Slab:400,700' rel='stylesheet' type='text/css' />
<link href="<?php echo get_template_directory_uri(); ?>/bower_components/DataTables/media/css/jquery.dataTables.min.css" rel="stylesheet" />
<link href="<?php echo get_template_directory_uri(); ?>/styles/main.css" rel="stylesheet" type="text/css">
<link rel="stylesheet" href="http://netdna.bootstrapcdn.com/font-awesome/4.2.0/css/font-awesome.min.css">
<link href="<?php echo get_template_directory_uri(); ?>/styles/documents-nav.css" rel="stylesheet" type="text/css">

<script src="<?php echo get_template_directory_uri(); ?>/bower_components/jquery/dist/jquery.js"></script>
<script src="<?php echo get_template_directory_uri(); ?>/bower_components/components-bootstrap/js/bootstrap.min.js"></script>

<script>
    $(document).ready(function(){
        $('.nav-icon').tooltip({ container: 'body' });
    });    
</script> 
<div class="container">
    <div class="doc-bx">
        <div class="storyLeft">
            <div class="storyContent"   >
                <iframe  width="100%" height="4150" src="http://blogs.unicef.org/"></iframe>
            </div>
        </div>        
    </div>
</div>
<?php get_footer(); ?>