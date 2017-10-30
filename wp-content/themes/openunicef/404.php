<?php
/**
 * The template for displaying 404 pages (Not Found)
 *
 * @package WordPress
 * @subpackage Open_Unicef
 * @since Open Unicef 1.0
 */

get_header(); ?>

	<div id="primary" class="content-area">
		<div id="content" class="site-content" role="main">

			<header class="Error-bg">
				<span class="page-title"><?php _e( 'Page not found, Please select a page from below links', 'openunicef' ); ?></span>
			</header>

			<div class="page-wrapper">
				<div class="page-content">
                <div class="row_error">
					<div class="v-align-middle">
                    <ul>
                       <li>&raquo <a href="<?php echo home_url(); ?>">Home</a> </li>
                       <li>&raquo <a href="<?php echo home_url('/flow'); ?>">Flow</a> </li>
                       <li>&raquo <a href="<?php echo home_url('/map'); ?>">Map</a> </li>
                       <li>&raquo <a href="<?php echo home_url('/documents'); ?>">Documents</a> </li>
                    </ul>
					</div>
                  </div>  
				</div><!-- .page-content -->
			</div><!-- .page-wrapper -->

		</div><!-- #content -->
	</div><!-- #primary -->

<?php get_footer(); ?>