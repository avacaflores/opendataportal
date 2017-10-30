<?php
/**
 * Open Unicef functions and definitions
 *
 * Sets up the theme and provides some helper functions, which are used in the
 * theme as custom template tags. Others are attached to action and filter
 * hooks in WordPress to change core functionality.
 *
 * When using a child theme (see https://codex.wordpress.org/Theme_Development
 * and https://codex.wordpress.org/Child_Themes), you can override certain
 * functions (those wrapped in a function_exists() call) by defining them first
 * in your child theme's functions.php file. The child theme's functions.php
 * file is included before the parent theme's file, so the child theme
 * functions would be used.
 *
 * Functions that are not pluggable (not wrapped in function_exists()) are
 * instead attached to a filter or action hook.
 *
 * For more information on hooks, actions, and filters, @link https://codex.wordpress.org/Plugin_API
 *
 * @package WordPress
 * @subpackage Open_Unicef
 * @since Open Unicef 1.0
 */

/*
 * Set up the content width value based on the theme's design.
 *
 * @see openunicef_content_width() for template-specific adjustments.
 */
if ( ! isset( $content_width ) )
	$content_width = 604;

/**
 * Add support for a custom header image.
 */
require get_template_directory() . '/inc/custom-header.php';

/**
 * Open Unicef only works in WordPress 3.6 or later.
 */
if ( version_compare( $GLOBALS['wp_version'], '3.6-alpha', '<' ) )
	require get_template_directory() . '/inc/back-compat.php';

/**
 * Open Unicef setup.
 *
 * Sets up theme defaults and registers the various WordPress features that
 * Open Unicef supports.
 *
 * @uses load_theme_textdomain() For translation/localization support.
 * @uses add_editor_style() To add Visual Editor stylesheets.
 * @uses add_theme_support() To add support for automatic feed links, post
 * formats, and post thumbnails.
 * @uses register_nav_menu() To add support for a navigation menu.
 * @uses set_post_thumbnail_size() To set a custom post thumbnail size.
 *
 * @since Open Unicef 1.0
 */
function openunicef_setup() {
	/*
	 * Makes Open Unicef available for translation.
	 *
	 * Translations can be added to the /languages/ directory.
	 * If you're building a theme based on Open Unicef, use a find and
	 * replace to change 'openunicef' to the name of your theme in all
	 * template files.
	 */
	load_theme_textdomain( 'openunicef', get_template_directory() . '/languages' );

	/*
	 * This theme styles the visual editor to resemble the theme style,
	 * specifically font, colors, icons, and column width.
	 */
	add_editor_style( array( 'css/editor-style.css', 'genericons/genericons.css', openunicef_fonts_url() ) );

	// Adds RSS feed links to <head> for posts and comments.
	add_theme_support( 'automatic-feed-links' );

	/*
	 * Switches default core markup for search form, comment form,
	 * and comments to output valid HTML5.
	 */
	add_theme_support( 'html5', array(
		'search-form', 'comment-form', 'comment-list', 'gallery', 'caption'
	) );

	/*
	 * This theme supports all available post formats by default.
	 * See https://codex.wordpress.org/Post_Formats
	 */
	add_theme_support( 'post-formats', array(
		'aside', 'audio', 'chat', 'gallery', 'image', 'link', 'quote', 'status', 'video'
	) );

	// This theme uses wp_nav_menu() in one location.
	register_nav_menu( 'primary', __( 'Navigation Menu', 'openunicef' ) );

	/*
	 * This theme uses a custom image size for featured images, displayed on
	 * "standard" posts and pages.
	 */
	add_theme_support( 'post-thumbnails' );
	set_post_thumbnail_size( 604, 270, true );

	// This theme uses its own gallery styles.
	add_filter( 'use_default_gallery_style', '__return_false' );
}
add_action( 'after_setup_theme', 'openunicef_setup' );

/**
 * Return the Google font stylesheet URL, if available.
 *
 * The use of Source Sans Pro and Bitter by default is localized. For languages
 * that use characters not supported by the font, the font can be disabled.
 *
 * @since Open Unicef 1.0
 *
 * @return string Font stylesheet or empty string if disabled.
 */
function openunicef_fonts_url() {
	$fonts_url = '';

	/* Translators: If there are characters in your language that are not
	 * supported by Source Sans Pro, translate this to 'off'. Do not translate
	 * into your own language.
	 */
	$source_sans_pro = _x( 'on', 'Source Sans Pro font: on or off', 'openunicef' );

	/* Translators: If there are characters in your language that are not
	 * supported by Bitter, translate this to 'off'. Do not translate into your
	 * own language.
	 */
	$bitter = _x( 'on', 'Bitter font: on or off', 'openunicef' );

	if ( 'off' !== $source_sans_pro || 'off' !== $bitter ) {
		$font_families = array();

		if ( 'off' !== $source_sans_pro )
			$font_families[] = 'Source Sans Pro:300,400,700,300italic,400italic,700italic';

		if ( 'off' !== $bitter )
			$font_families[] = 'Bitter:400,700';

		$query_args = array(
			'family' => urlencode( implode( '|', $font_families ) ),
			'subset' => urlencode( 'latin,latin-ext' ),
		);
		$fonts_url = add_query_arg( $query_args, '//fonts.googleapis.com/css' );
	}

	return $fonts_url;
}

/**
 * Enqueue scripts and styles for the front end.
 *
 * @since Open Unicef 1.0
 */
function openunicef_scripts_styles() {
	/*
	 * Adds JavaScript to pages with the comment form to support
	 * sites with threaded comments (when in use).
	 */
	if ( is_singular() && comments_open() && get_option( 'thread_comments' ) )
		wp_enqueue_script( 'comment-reply' );

	// Adds Masonry to handle vertical alignment of footer widgets.
	if ( is_active_sidebar( 'sidebar-1' ) )
		wp_enqueue_script( 'jquery-masonry' );

	// Loads JavaScript file with functionality specific to Open Unicef.
	wp_enqueue_script( 'openunicef-script', get_template_directory_uri() . '/js/functions.js', array( 'jquery' ), '20150330', true );

	// Add Source Sans Pro and Bitter fonts, used in the main stylesheet.
	wp_enqueue_style( 'openunicef-fonts', openunicef_fonts_url(), array(), null );

	// Add Genericons font, used in the main stylesheet.
	wp_enqueue_style( 'genericons', get_template_directory_uri() . '/genericons/genericons.css', array(), '3.03' );

	// Loads our main stylesheet.
	wp_enqueue_style( 'openunicef-style', get_stylesheet_uri(), array(), '2013-07-18' );

	// Loads the Internet Explorer specific stylesheet.
	wp_enqueue_style( 'openunicef-ie', get_template_directory_uri() . '/css/ie.css', array( 'openunicef-style' ), '2013-07-18' );
	wp_style_add_data( 'openunicef-ie', 'conditional', 'lt IE 9' );
}
add_action( 'wp_enqueue_scripts', 'openunicef_scripts_styles' );

/**
 * Filter the page title.
 *
 * Creates a nicely formatted and more specific title element text for output
 * in head of document, based on current view.
 *
 * @since Open Unicef 1.0
 *
 * @param string $title Default title text for current view.
 * @param string $sep   Optional separator.
 * @return string The filtered title.
 */
function openunicef_wp_title( $title, $sep ) {
	global $paged, $page;

	if ( is_feed() )
		return $title;

	// Add the site name.
	$title .= get_bloginfo( 'name', 'display' );

	// Add the site description for the home/front page.
	$site_description = get_bloginfo( 'description', 'display' );
	if ( $site_description && ( is_home() || is_front_page() ) )
		$title = "$title $sep $site_description";

	// Add a page number if necessary.
	if ( ( $paged >= 2 || $page >= 2 ) && ! is_404() )
		$title = "$title $sep " . sprintf( __( 'Page %s', 'openunicef' ), max( $paged, $page ) );

	return $title;
}
add_filter( 'wp_title', 'openunicef_wp_title', 10, 2 );

/**
 * Register two widget areas.
 *
 * @since Open Unicef 1.0
 */
function openunicef_widgets_init() {
	register_sidebar( array(
		'name'          => __( 'Main Widget Area', 'openunicef' ),
		'id'            => 'sidebar-1',
		'description'   => __( 'Appears in the footer section of the site.', 'openunicef' ),
		'before_widget' => '<aside id="%1$s" class="widget %2$s">',
		'after_widget'  => '</aside>',
		'before_title'  => '<h3 class="widget-title">',
		'after_title'   => '</h3>',
	) );

	register_sidebar( array(
		'name'          => __( 'Secondary Widget Area', 'openunicef' ),
		'id'            => 'sidebar-2',
		'description'   => __( 'Appears on posts and pages in the sidebar.', 'openunicef' ),
		'before_widget' => '<aside id="%1$s" class="widget %2$s">',
		'after_widget'  => '</aside>',
		'before_title'  => '<h3 class="widget-title">',
		'after_title'   => '</h3>',
	) );

	register_sidebar( array(
		'name'          => __( 'Story Widget Area', 'openunicef' ),
		'id'            => 'story-widget',
		'description'   => __( 'Appears on posts and pages in the sidebar.', 'openunicef' ),
		'before_widget' => '<aside id="%1$s" class="widget %2$s">',
		'after_widget'  => '</aside>',
		'before_title'  => '<h3 class="widget-title">',
		'after_title'   => '</h3>',
	) );
}
add_action( 'widgets_init', 'openunicef_widgets_init' );

if ( ! function_exists( 'openunicef_paging_nav' ) ) :
/**
 * Display navigation to next/previous set of posts when applicable.
 *
 * @since Open Unicef 1.0
 */
function openunicef_paging_nav() {
	global $wp_query;

	// Don't print empty markup if there's only one page.
	if ( $wp_query->max_num_pages < 2 )
		return;
	?>
	<nav class="navigation paging-navigation" role="navigation">
		<h1 class="screen-reader-text"><?php _e( 'Posts navigation', 'openunicef' ); ?></h1>
		<div class="nav-links">

			<?php if ( get_next_posts_link() ) : ?>
			<div class="nav-previous"><?php next_posts_link( __( '<span class="meta-nav">&larr;</span> Older posts', 'openunicef' ) ); ?></div>
			<?php endif; ?>

			<?php if ( get_previous_posts_link() ) : ?>
			<div class="nav-next"><?php previous_posts_link( __( 'Newer posts <span class="meta-nav">&rarr;</span>', 'openunicef' ) ); ?></div>
			<?php endif; ?>

		</div><!-- .nav-links -->
	</nav><!-- .navigation -->
	<?php
}
endif;

if ( ! function_exists( 'openunicef_post_nav' ) ) :
/**
 * Display navigation to next/previous post when applicable.
*
* @since Open Unicef 1.0
*/
function openunicef_post_nav() {
	global $post;

	// Don't print empty markup if there's nowhere to navigate.
	$previous = ( is_attachment() ) ? get_post( $post->post_parent ) : get_adjacent_post( false, '', true );
	$next     = get_adjacent_post( false, '', false );

	if ( ! $next && ! $previous )
		return;
	?>
	<nav class="navigation post-navigation" role="navigation">
		<h1 class="screen-reader-text"><?php _e( 'Post navigation', 'openunicef' ); ?></h1>
		<div class="nav-links">

			<?php previous_post_link( '%link', _x( '<span class="meta-nav">&larr;</span> %title', 'Previous post link', 'openunicef' ) ); ?>
			<?php next_post_link( '%link', _x( '%title <span class="meta-nav">&rarr;</span>', 'Next post link', 'openunicef' ) ); ?>

		</div><!-- .nav-links -->
	</nav><!-- .navigation -->
	<?php
}
endif;

if ( ! function_exists( 'openunicef_entry_meta' ) ) :
/**
 * Print HTML with meta information for current post: categories, tags, permalink, author, and date.
 *
 * Create your own openunicef_entry_meta() to override in a child theme.
 *
 * @since Open Unicef 1.0
 */
function openunicef_entry_meta() {
	if ( is_sticky() && is_home() && ! is_paged() )
		echo '<span class="featured-post">' . esc_html__( 'Sticky', 'openunicef' ) . '</span>';

	if ( ! has_post_format( 'link' ) && 'post' == get_post_type() )
		openunicef_entry_date();

	// Translators: used between list items, there is a space after the comma.
	$categories_list = get_the_category_list( __( ', ', 'openunicef' ) );
	if ( $categories_list ) {
		echo '<span class="categories-links">' . $categories_list . '</span>';
	}

	// Translators: used between list items, there is a space after the comma.
	$tag_list = get_the_tag_list( '', __( ', ', 'openunicef' ) );
	if ( $tag_list ) {
		echo '<span class="tags-links">' . $tag_list . '</span>';
	}

	// Post author
	if ( 'post' == get_post_type() ) {
		printf( '<span class="author vcard"><a class="url fn n" href="%1$s" title="%2$s" rel="author">%3$s</a></span>',
			esc_url( get_author_posts_url( get_the_author_meta( 'ID' ) ) ),
			esc_attr( sprintf( __( 'View all posts by %s', 'openunicef' ), get_the_author() ) ),
			get_the_author()
		);
	}
}
endif;

if ( ! function_exists( 'openunicef_entry_date' ) ) :
/**
 * Print HTML with date information for current post.
 *
 * Create your own openunicef_entry_date() to override in a child theme.
 *
 * @since Open Unicef 1.0
 *
 * @param boolean $echo (optional) Whether to echo the date. Default true.
 * @return string The HTML-formatted post date.
 */
function openunicef_entry_date( $echo = true ) {
	if ( has_post_format( array( 'chat', 'status' ) ) )
		$format_prefix = _x( '%1$s on %2$s', '1: post format name. 2: date', 'openunicef' );
	else
		$format_prefix = '%2$s';

	$date = sprintf( '<span class="date"><a href="%1$s" title="%2$s" rel="bookmark"><time class="entry-date" datetime="%3$s">%4$s</time></a></span>',
		esc_url( get_permalink() ),
		esc_attr( sprintf( __( 'Permalink to %s', 'openunicef' ), the_title_attribute( 'echo=0' ) ) ),
		esc_attr( get_the_date( 'c' ) ),
		esc_html( sprintf( $format_prefix, get_post_format_string( get_post_format() ), get_the_date() ) )
	);

	if ( $echo )
		echo $date;

	return $date;
}
endif;

if ( ! function_exists( 'openunicef_the_attached_image' ) ) :
/**
 * Print the attached image with a link to the next attached image.
 *
 * @since Open Unicef 1.0
 */
function openunicef_the_attached_image() {
	/**
	 * Filter the image attachment size to use.
	 *
	 * @since Twenty thirteen 1.0
	 *
	 * @param array $size {
	 *     @type int The attachment height in pixels.
	 *     @type int The attachment width in pixels.
	 * }
	 */
	$attachment_size     = apply_filters( 'openunicef_attachment_size', array( 724, 724 ) );
	$next_attachment_url = wp_get_attachment_url();
	$post                = get_post();

	/*
	 * Grab the IDs of all the image attachments in a gallery so we can get the URL
	 * of the next adjacent image in a gallery, or the first image (if we're
	 * looking at the last image in a gallery), or, in a gallery of one, just the
	 * link to that image file.
	 */
	$attachment_ids = get_posts( array(
		'post_parent'    => $post->post_parent,
		'fields'         => 'ids',
		'numberposts'    => -1,
		'post_status'    => 'inherit',
		'post_type'      => 'attachment',
		'post_mime_type' => 'image',
		'order'          => 'ASC',
		'orderby'        => 'menu_order ID',
	) );

	// If there is more than 1 attachment in a gallery...
	if ( count( $attachment_ids ) > 1 ) {
		foreach ( $attachment_ids as $attachment_id ) {
			if ( $attachment_id == $post->ID ) {
				$next_id = current( $attachment_ids );
				break;
			}
		}

		// get the URL of the next image attachment...
		if ( $next_id )
			$next_attachment_url = get_attachment_link( $next_id );

		// or get the URL of the first image attachment.
		else
			$next_attachment_url = get_attachment_link( reset( $attachment_ids ) );
	}

	printf( '<a href="%1$s" title="%2$s" rel="attachment">%3$s</a>',
		esc_url( $next_attachment_url ),
		the_title_attribute( array( 'echo' => false ) ),
		wp_get_attachment_image( $post->ID, $attachment_size )
	);
}
endif;

/**
 * Return the post URL.
 *
 * @uses get_url_in_content() to get the URL in the post meta (if it exists) or
 * the first link found in the post content.
 *
 * Falls back to the post permalink if no URL is found in the post.
 *
 * @since Open Unicef 1.0
 *
 * @return string The Link format URL.
 */
function openunicef_get_link_url() {
	$content = get_the_content();
	$has_url = get_url_in_content( $content );

	return ( $has_url ) ? $has_url : apply_filters( 'the_permalink', get_permalink() );
}

if ( ! function_exists( 'openunicef_excerpt_more' ) && ! is_admin() ) :
/**
 * Replaces "[...]" (appended to automatically generated excerpts) with ...
 * and a Continue reading link.
 *
 * @since Open Unicef 1.4
 *
 * @param string $more Default Read More excerpt link.
 * @return string Filtered Read More excerpt link.
 */
function openunicef_excerpt_more( $more ) {
	$link = sprintf( '<a href="%1$s" class="more-link">%2$s</a>',
		esc_url( get_permalink( get_the_ID() ) ),
			/* translators: %s: Name of current post */
			sprintf( __( 'Continue reading %s <span class="meta-nav">&rarr;</span>', 'openunicef' ), '<span class="screen-reader-text">' . get_the_title( get_the_ID() ) . '</span>' )
		);
	return ' &hellip; ' . $link;
}
add_filter( 'excerpt_more', 'openunicef_excerpt_more' );
endif;

/**
 * Extend the default WordPress body classes.
 *
 * Adds body classes to denote:
 * 1. Single or multiple authors.
 * 2. Active widgets in the sidebar to change the layout and spacing.
 * 3. When avatars are disabled in discussion settings.
 *
 * @since Open Unicef 1.0
 *
 * @param array $classes A list of existing body class values.
 * @return array The filtered body class list.
 */
function openunicef_body_class( $classes ) {
	if ( ! is_multi_author() )
		$classes[] = 'single-author';

	if ( is_active_sidebar( 'sidebar-2' ) && ! is_attachment() && ! is_404() )
		$classes[] = 'sidebar';

	if ( ! get_option( 'show_avatars' ) )
		$classes[] = 'no-avatars';

	return $classes;
}
add_filter( 'body_class', 'openunicef_body_class' );

/**
 * Adjust content_width value for video post formats and attachment templates.
 *
 * @since Open Unicef 1.0
 */
function openunicef_content_width() {
	global $content_width;

	if ( is_attachment() )
		$content_width = 724;
	elseif ( has_post_format( 'audio' ) )
		$content_width = 484;
}
add_action( 'template_redirect', 'openunicef_content_width' );

/**
 * Add postMessage support for site title and description for the Customizer.
 *
 * @since Open Unicef 1.0
 *
 * @param WP_Customize_Manager $wp_customize Customizer object.
 */
function openunicef_customize_register( $wp_customize ) {
	$wp_customize->get_setting( 'blogname' )->transport         = 'postMessage';
	$wp_customize->get_setting( 'blogdescription' )->transport  = 'postMessage';
	$wp_customize->get_setting( 'header_textcolor' )->transport = 'postMessage';
}
add_action( 'customize_register', 'openunicef_customize_register' );

/**
 * Enqueue Javascript postMessage handlers for the Customizer.
 *
 * Binds JavaScript handlers to make the Customizer preview
 * reload changes asynchronously.
 *
 * @since Open Unicef 1.0
 */
function openunicef_customize_preview_js() {
	wp_enqueue_script( 'openunicef-customizer', get_template_directory_uri() . '/js/theme-customizer.js', array( 'customize-preview' ), '20141120', true );
}
add_action( 'customize_preview_init', 'openunicef_customize_preview_js' );


/**
 * Modification started in default script
 *
 * @author DFA
 *
 * @date 18MAY2015
 */

 ### Function to remove wordPress version Number ###

function wpbeginner_remove_version() {
return '';
}

add_filter('the_generator', 'wpbeginner_remove_version');

### Function to remove wordPress version Number appended in the url. ###

function at_remove_wp_ver_css_js( $src ) {
    if ( strpos( $src, 'ver=' ) )
        $src = remove_query_arg( 'ver', $src );
    return $src;
}

add_filter( 'style_loader_src', 'at_remove_wp_ver_css_js', 9999 );
add_filter( 'script_loader_src', 'at_remove_wp_ver_css_js', 9999 );

### Script to remove unnecessary meta-data from your WordPress site ###

remove_action( 'wp_head', 'wp_generator' ) ; 
remove_action( 'wp_head', 'wlwmanifest_link' ) ; 
remove_action( 'wp_head', 'rsd_link' ) ;

### Restrict HTML tags in comment box ###

add_filter( 'pre_comment_content', 'wp_specialchars' );

### Function to hide detailed error message at the time of user login. ###

function no_errors_please(){
  		return 'Please enter correct credentials !';
}
add_filter( 'login_errors', 'no_errors_please' );

### Function to customize Login Page Logo ###

function my_custom_login_logo()
{
    //echo '<style  type="text/css"> h1 a {  background-image:url(' . get_bloginfo('template_directory') . '/images/logo_admin.png)  !important; } </style>';

	//echo '<style  type="text/css"> h1 a {  background-image:url()  !important; } </style>';
	echo '<style  type="text/css"> h1 {  display:none  !important; } </style>';
}
add_action('login_head',  'my_custom_login_logo');


### Function to customize Login Page Logo link & ALT text  (will use when we get logo image) ###

function change_wp_login_url()
{
    //echo bloginfo('url');  // OR ECHO YOUR OWN URL
	echo '';
}
add_filter('login_headerurl', 'change_wp_login_url');

### Function to customize wordPress footer ###

// Admin footer modification
 
function remove_footer_admin ()
{
    echo '<span id="footer-thankyou">Developed by <a href="http://dataforall.org/" target="_blank">DFA</a></span>';
}
add_filter('admin_footer_text', 'remove_footer_admin');


### Function to remove WP version from admin ###

function my_footer_shh() {
    remove_filter( 'update_footer', 'core_update_footer' ); 
}

add_action('admin_menu','my_footer_shh');


### Function how to change Howdy text in WordPress admin bar ###

function replace_howdy( $wp_admin_bar ) {
 $my_account=$wp_admin_bar->get_node('my-account');
 $newtitle = str_replace( 'Howdy,', 'Welcome, ', $my_account->title );
 $wp_admin_bar->add_node( array(
 'id' => 'my-account',
 'title' => $newtitle,
 ) );
}
 
add_filter( 'admin_bar_menu', 'replace_howdy',25 );


### Script to remove feed url from header ###

remove_action('wp_head', 'feed_links', 2);


### Function to remove Top Level WordPress Dashboard Menu Items ###

function remove_menus(){  
  //remove_menu_page( 'index.php' );                  //Dashboard
  remove_menu_page( 'tools.php' );                  //Tools
  remove_menu_page( 'upload.php' );                 //Media
  remove_menu_page( 'edit.php' );                   //Posts  
  //remove_menu_page( 'edit.php?post_type=page' );    //Pages
  remove_menu_page( 'edit-comments.php' );          //Comments
  remove_menu_page( 'themes.php' );                 //Appearance
  remove_menu_page( 'plugins.php' );                //Plugins
  remove_menu_page( 'users.php' );                  //Users  
  remove_menu_page( 'options-general.php' );        //Settings  
}
 
 add_action( 'admin_menu', 'remove_menus' );

 ### Function to hide HELP link, ACF link, LOCK-DOWN link from admin ###

function mytheme_remove_help_tabs() {
    $screen = get_current_screen();
    $screen->remove_help_tabs();

	echo '<style>	
			#wp-admin-bar-wp-logo, #wp-admin-bar-new-content, #wp-admin-bar-comments, #wp-version-message, #screen-options-link-wrap, #toplevel_page_edit-post_type-acf, #toplevel_page_bws_plugins, #toplevel_page_lockdown-wp-admin {display:none;}		
		</style>';
}

add_action('admin_head', 'mytheme_remove_help_tabs');



### Function to add custom taxonomy for "Resource Partners, Recipient Countries, Sectors, Grant Description, Report Type"  ###

function add_custom_taxonomies(){
	
  register_taxonomy('resource_partners', 'post-document', array(
			'hierarchical' => true,   
			'labels' => array(
			  'name' => _x( 'Resource Partners', 'taxonomy general name' ),
			  'singular_name' => _x( 'Resource Partner', 'taxonomy singular name' ),
			  'search_items' =>  __( 'Search Resource Partners' ),
			  'all_items' => __( 'All Resource Partners' ),
			  'parent_item' => __( 'Parent Resource Partner' ),
			  'parent_item_colon' => __( 'Parent Resource Partner:' ),
			  'edit_item' => __( 'Edit Resource Partner' ),
			  'update_item' => __( 'Update Resource Partner' ),
			  'add_new_item' => __( 'Add New Resource Partner' ),
			  'new_item_name' => __( 'New Resource Partner Name' ),
			  'menu_name' => __( 'Resource Partners' ),
			),    
    'rewrite' => array(
      'slug' => 'resource-partners',
      'with_front' => false,
      'hierarchical' => true
    ),
  ));

  register_taxonomy('recipient_countries', 'post-document', array(
			'hierarchical' => true,   
			'labels' => array(
			  'name' => _x( 'Recipient Countries', 'taxonomy general name' ),
			  'singular_name' => _x( 'Recipient Country', 'taxonomy singular name' ),
			  'search_items' =>  __( 'Search Recipient Countries' ),
			  'all_items' => __( 'All Recipient Countries' ),
			  'parent_item' => __( 'Parent Recipient Country' ),
			  'parent_item_colon' => __( 'Parent Recipient Country:' ),
			  'edit_item' => __( 'Edit Recipient Country' ),
			  'update_item' => __( 'Update Recipient Country' ),
			  'add_new_item' => __( 'Add New Recipient Country' ),
			  'new_item_name' => __( 'New Recipient Country Name' ),
			  'menu_name' => __( 'Recipient Countries' ),
			),    
    'rewrite' => array(
      'slug' => 'recipient-countries',
      'with_front' => false,
      'hierarchical' => true
    ),
  ));


  register_taxonomy('sectors', 'post-document', array(
			'hierarchical' => true,   
			'labels' => array(
			  'name' => _x( 'Sectors', 'taxonomy general name' ),
			  'singular_name' => _x( 'Sector', 'taxonomy singular name' ),
			  'search_items' =>  __( 'Search Sectors' ),
			  'all_items' => __( 'All Sectors' ),
			  'parent_item' => __( 'Parent Sector' ),
			  'parent_item_colon' => __( 'Parent Sector:' ),
			  'edit_item' => __( 'Edit Sector' ),
			  'update_item' => __( 'Update Sector' ),
			  'add_new_item' => __( 'Add New Sector' ),
			  'new_item_name' => __( 'New Sector Name' ),
			  'menu_name' => __( 'Sectors' ),
			),    
    'rewrite' => array(
      'slug' => 'sectors',
      'with_front' => false,
      'hierarchical' => true
    ),
  ));
  

  register_taxonomy('grant_description', 'post-document', array(
			'hierarchical' => true,   
			'labels' => array(
			  'name' => _x( 'Grant Description', 'taxonomy general name' ),
			  'singular_name' => _x( 'Grant Description', 'taxonomy singular name' ),
			  'search_items' =>  __( 'Search Grant Description' ),
			  'all_items' => __( 'All Grant Description' ),
			  'parent_item' => __( 'Parent Grant Description' ),
			  'parent_item_colon' => __( 'Parent Grant Description:' ),
			  'edit_item' => __( 'Edit Grant Description' ),
			  'update_item' => __( 'Update Grant Description' ),
			  'add_new_item' => __( 'Add New Grant Description' ),
			  'new_item_name' => __( 'New Grant Description Name' ),
			  'menu_name' => __( 'Grant Description' ),
			),    
    'rewrite' => array(
      'slug' => 'grant-description',
      'with_front' => false,
      'hierarchical' => true
    ),
  ));


  register_taxonomy('report_type', 'post-document', array(
			'hierarchical' => true,   
			'labels' => array(
			  'name' => _x( 'Report Type', 'taxonomy general name' ),
			  'singular_name' => _x( 'Report Type', 'taxonomy singular name' ),
			  'search_items' =>  __( 'Search Report Type' ),
			  'all_items' => __( 'All Report Type' ),
			  'parent_item' => __( 'Parent Report Type' ),
			  'parent_item_colon' => __( 'Parent Report Type:' ),
			  'edit_item' => __( 'Edit Report Type' ),
			  'update_item' => __( 'Update Report Type' ),
			  'add_new_item' => __( 'Add New Report Type' ),
			  'new_item_name' => __( 'New Report Type Name' ),
			  'menu_name' => __( 'Report Type' ),
			),    
    'rewrite' => array(
      'slug' => 'report-type',
      'with_front' => false,
      'hierarchical' => true
    ),
  ));


}

add_action( 'init', 'add_custom_taxonomies', 0 );


/*
Custom Post Type: Document
*/

define("DOCUMENT_POST_TYPE", "post-document");

function create_document_post_type()
{

	register_post_type( DOCUMENT_POST_TYPE,
		array(
			'labels' => array(
					'name' => __( 'Documents' ),
					'singular_name' => __( 'Document' ),
					'add_new'		=> __( 'Add New Document' ),
					'add_new_item'	=> __( 'Add New Document' ),
					'edit_item'		=> __( 'Edit Document' ),
					'new_item'		=> __( 'New Document' ),
					'view_item'		=> __( 'View Document' ),
					'search_items'	=> __( 'Search Document' )
				),
				'rewrite' => array ('slug' => 'post-document' ),
				'public' => true,
				'capability_type' => 'page',
				'has_archive' => true,
				'taxonomies' => array('category'),
				'hierarchical' => true,
				'supports' => array('title','excerpt')
		)
	);	
}

function register_post_types()
{
	create_document_post_type();
}

function my_rewrite_flush()
{
	register_post_types();
	flush_rewrite_rules();
}

register_activation_hook( __FILE__, 'my_rewrite_flush' );
add_action('init', 'register_post_types');


/*
AJAX implementation to show DOC 
*/


add_action( 'wp_ajax_nopriv_load-filter', 'prefix_load_cat_posts' );
add_action( 'wp_ajax_load-filter', 'prefix_load_cat_posts' );

global $showingNoOfRec;
$showingNoOfRec = 10;

function prefix_load_cat_posts () {
    
    //echo "<pre>";
    //print_r(get_cat_ID("Thematic Reports"));exit;
    //print_r($_POST);exit;
	$showingNoOfRec = 10;

	$fetchDocDetails = '';
	$createCondition = '';

    $catName = trim($_POST['cat']);
	$taxnomyName = trim($_POST['section']);
	$noOfPageToShow = trim($_POST['showRec']);

	

	if(isset($catName) && isset($taxnomyName)){		
		

		// Script to fetch doc data
		$allowedFileExt = array('xlsx','xls','pdf','doc','docx','ppt','.pptx');

		//$subCatList = $catId;

		//get sub-cat if any		 
		 $get_libraryList = array('taxonomy' => $taxnomyName,'hide_empty' => 0,'child_of' => $catId,'orderby' => 'name','order' => 'ASC');

		 $subCategories = get_categories( $get_libraryList );	
		 
		 /*
		 if(count($subCategories) > 0){
		 $subCatlist = '';						
			foreach ($subCategories as $subCat) {
				$subCatList .= ','.$subCat->cat_ID;
			}
		 }
		 */
         $_SESSION['CATEGORY'] = array();
		 if(($taxnomyName == 'category')){							   				
			   if( $catName == 'Show All'){
					$_SESSION['CATEGORY'] = '';
			   }else{
                    
                   if( $catName == 'Thematic Reports'){
                       
                        $cross_cutting      = isset($_POST["cross_cutting"]) ? $_POST["cross_cutting"] : "0";
                        $geographic_area    = isset($_POST["geographic_area"]) ? $_POST["geographic_area"] : "0";
                        $year               = isset($_POST["year"]) ? $_POST["year"] : "0";
                        $report_type        = isset($_POST["report_type"]) ? $_POST["report_type"] : "0";
                        
                        $allFilterBoxCategories        = isset($_POST["allFilterBoxCategories"]) ? $_POST["allFilterBoxCategories"] : [];
                        
                        $_SESSION['CATEGORY'] = [];
                        
                        if( ($cross_cutting == "0") &&  ($geographic_area == "0") && ($year == "0") && ($report_type == "0") )  {
                            $_SESSION['CATEGORY'] = $allFilterBoxCategories;
                        }else{
                            if( ($cross_cutting != "0") )  {
                                $_SESSION['CATEGORY'][] = $cross_cutting;
                            } 
                            if(  ($geographic_area != "0") )  {
                               $_SESSION['CATEGORY'][] = $geographic_area  ;
                            } 
                            if( ($year != "0") )  {
                               $_SESSION['CATEGORY'][] = $year;     
                            } 
                            if( ($report_type != "0") )  {
                                $_SESSION['CATEGORY'][]  = $report_type;
                            } 
                        }
                        
                   }else{
                       $_SESSION['CATEGORY'][] = get_cat_ID($catName);
                   }
                    
					
			   }
			   
		}
		

		 if($taxnomyName == 'resource_partners'){
				$catIdDetail = get_term_by('name', $catName, $taxnomyName);				
				$catId = $catIdDetail->term_id;

				$createCondition[] =array(
				  'taxonomy'	=> 'resource_partners',
				  'field'		=> 'term_id',
				  'terms'		=> $catId,
				  'operator'	=> 'IN'
			   );		  

				if( $catName == 'Show All'){
					$_SESSION['RESOURCE-PARTNERS'] = '';
			   }else{
					$_SESSION['RESOURCE-PARTNERS'] = $createCondition;
			   }			    
				
		}



		if($taxnomyName == 'recipient_countries'){

				$catIdDetail = get_term_by('name', $catName, $taxnomyName);				
				$catId = $catIdDetail->term_id;

				$createCondition[] =array(
				  'taxonomy'	=> 'recipient_countries',
				  'field'		=> 'term_id',
				  'terms'		=> $catId,
				  'operator'	=> 'IN'
			   );

			   if( $catName == 'Show All'){
					$_SESSION['RECIPIENT-COUNTRIES'] = '';
			   }else{
					$_SESSION['RECIPIENT-COUNTRIES'] = $createCondition;
			   }
				
				
		}

		if($taxnomyName == 'sectors'){

				$catIdDetail = get_term_by('name', $catName, $taxnomyName);				
				$catId = $catIdDetail->term_id;

				$createCondition[] =array(
				  'taxonomy'	=> 'sectors',
				  'field'		=> 'term_id',
				  'terms'		=> $catId,
				  'operator'	=> 'IN'
			   );

			   if( $catName == 'Show All'){
					$_SESSION['SECTORS'] = '';
			   }else{
					$_SESSION['SECTORS'] = $createCondition;
			   }
				
				
		}

		if($taxnomyName == 'grant_description'){

				$catIdDetail = get_term_by('name', $catName, $taxnomyName);				
				$catId = $catIdDetail->term_id;

				$createCondition[] =array(
				  'taxonomy'	=> 'grant_description',
				  'field'		=> 'term_id',
				  'terms'		=> $catId,
				  'operator'	=> 'IN'
			   );

			   if( $catName == 'Show All'){
					$_SESSION['GRANT-DESCRIPTION'] = '';
			   }else{
					$_SESSION['GRANT-DESCRIPTION'] = $createCondition;
			   }
		}

		if($taxnomyName == 'report_type'){
				
				$catIdDetail = get_term_by('name', $catName, $taxnomyName);				
				$catId = $catIdDetail->term_id;

				$createCondition[] =array(
				  'taxonomy'	=> 'report_type',
				  'field'		=> 'term_id',
				  'terms'		=> $catId,
				  'operator'	=> 'IN'
			   );

			   if( $catName == 'Show All'){
					$_SESSION['REPORT-TYPE'] = '';
			   }else{
					$_SESSION['REPORT-TYPE'] = $createCondition;
			   }			    
		}

		$taxnomyCondition['relation']	= 'AND';

		if($_SESSION['CATEGORY'] != ''){
			$documentCategory = $_SESSION['CATEGORY'];		
		}else{
			$documentCategory = '';
		}


		 if(isset($_SESSION['RESOURCE-PARTNERS'])){

				$taxnomyCondition[] = $_SESSION['RESOURCE-PARTNERS'];			
		}


		if(isset($_SESSION['RECIPIENT-COUNTRIES'])){

				$taxnomyCondition[] = $_SESSION['RECIPIENT-COUNTRIES'];			
		}


		if(isset($_SESSION['SECTORS'])){

				$taxnomyCondition[] = $_SESSION['SECTORS'];			
		}


		if(isset($_SESSION['GRANT-DESCRIPTION'])){

				$taxnomyCondition[] = $_SESSION['GRANT-DESCRIPTION'];			
		}

		if(isset($_SESSION['REPORT-TYPE'])){

				$taxnomyCondition[] = $_SESSION['REPORT-TYPE'];			
		}


		if ( !empty($_SESSION['RESOURCE-PARTNERS']) ) $argsUserIDs[] = &$_SESSION['RESOURCE-PARTNERS'];			
		if ( !empty($_SESSION['RECIPIENT-COUNTRIES']) ) $argsUserIDs[] = &$_SESSION['RECIPIENT-COUNTRIES'];
		if ( !empty($_SESSION['SECTORS']) ) $argsUserIDs[] = &$_SESSION['SECTORS'];
		if ( !empty($_SESSION['GRANT-DESCRIPTION']) ) $argsUserIDs[] = &$_SESSION['GRANT-DESCRIPTION'];
		if ( !empty($_SESSION['REPORT-TYPE']) ) $argsUserIDs[] = &$_SESSION['REPORT-TYPE'];
        
        $orderBy            = "title";
        $orderByDirection   = "ASC";
        
        
        if( isset($_POST["orderby"]) && ($_POST["orderby"] != "") ){
            list($orderBy, $orderByDirection) =  explode("@@", $_POST["orderby"]);              
        }  
        
         /* New changed filter logic start*/
       $andCnd = [];
       if( $catName == 'Thematic Reports'){               
           
           
            $cross_cutting      = isset($_POST["cross_cutting"]) ? $_POST["cross_cutting"] : "0";
            $geographic_area    = isset($_POST["geographic_area"]) ? $_POST["geographic_area"] : "0";
            $year               = isset($_POST["year"]) ? $_POST["year"] : "0";
            $report_type        = isset($_POST["report_type"]) ? $_POST["report_type"] : "0";
            
            if( ($cross_cutting == "0") &&  ($geographic_area == "0") && ($year == "0") && ($report_type == "0") )  {
                $andCnd = $argsUserIDs;
            }else{
                foreach($documentCategory as $k => $v){
                    $andCnd[] = array(
                       'taxonomy' => 'category',
                       'terms' => array($v),
                       'field' => 'id'
                     );
                }       
                $andCnd['relation'] = 'AND';
            }            
       }else{
           $andCnd = $argsUserIDs;
       }
       /* New changed filter logic end*/ 
		
		$fetchTotalPostCat = array(
            'posts_per_page'	=> -1,
            'offset'			=> 0,
            'category__in'		=> $documentCategory,
            'meta_key'		    => false,
            'orderby'			=> $orderBy,
            'order'				=> $orderByDirection,
            'post_type'			=> 'post-document',
            'post_status'		=> 'publish',
            'suppress_filters'	=> true,
            //'tax_query'			=> $argsUserIDs
            'tax_query'			=> $andCnd
		);



		$fetchPostCat = array(
            'posts_per_page'	=> $showingNoOfRec,
            'offset'            => $noOfPageToShow,
            'category__in'		=> $documentCategory,
            'meta_key'          => false,
            'orderby'           => $orderBy,
            'order'             => $orderByDirection,
            'post_type'         => 'post-document',
            'post_status'		=> 'publish',
            'suppress_filters'	=> true,
            //'tax_query'		=> $argsUserIDs,
            'tax_query'			=> $andCnd
            //'s'        => 'Enterprise Risk Management Memo'
		);	
		 
		//echo '<pre>'; print_r( $fetchPostCat); die();
        $doc_keyword = trim($_POST['doc_keyword']);
        
        if( $doc_keyword != ""){
            $fetchPostCat["s"]         = $doc_keyword;
            $fetchTotalPostCat["s"]    = $doc_keyword;            
        }
			
		$the_posts = new WP_Query( $fetchPostCat );
		$count_posts_query_fn = $the_posts->post_count; //counting post from the query

		$the_posts_total = new WP_Query( $fetchTotalPostCat );
		$count_posts_query_total = $the_posts_total->post_count; 

		$count_posts_fn =  wp_count_posts('post-document'); 
		$published_posts_fn = $count_posts_fn->publish; // total count of publish post

		$countPages_fn = ceil($count_posts_query_total/$count_posts_query_fn);

		//echo $count_posts_query_total.'-----'.$count_posts_query_fn.'---'.$countPages_fn; die();
		

		ob_start();

		if ( $the_posts->have_posts() ) :

			$fetchDocDetails .='<ul>';
			$fetchDocDetails .='<input type="hidden" id="totNoOfPages" value="'.$countPages_fn.'" />';
            $fetchDocDetails .='<input type="hidden" id="published_posts" value="'.$count_posts_query_total.'" />';
			//$fetchDocDetails .='<li style="text-align:right;font-size:12px;">'.$count_posts_query_fn.' of '.$published_posts_fn.'</li>';
			while ( $the_posts->have_posts() ) : $the_posts->the_post(); 

				$pdf_doc_option = get_field('pdf_doc_option');

				if((isset($pdf_doc_option)) && ($pdf_doc_option == 1)){
					$uploadFile_url = get_field( 'external_link' );
				}else{
					$uploadFile_field = get_field('upload_file');
					$uploadFile_url = wp_get_attachment_url( $uploadFile_field );
				}							

				$uploadFile_ext = strtolower(substr(strrchr($uploadFile_url, "."), 1));

				if(($uploadFile_ext != '') && ($uploadFile_ext == 'xlsx')){
					$fetchthumbImage = get_template_directory_uri().'/assets/xlsx-icon.png';
				}else if(($uploadFile_ext != '') && ($uploadFile_ext == 'xls')){
					$fetchthumbImage = get_template_directory_uri().'/assets/xls-icon.png';
				}else if(($uploadFile_ext != '') && ($uploadFile_ext == 'pdf')){
					$fetchthumbImage = get_template_directory_uri().'/assets/pdf-icon.png';
				}else if(($uploadFile_ext != '') && ($uploadFile_ext == 'doc')){
					$fetchthumbImage = get_template_directory_uri().'/assets/doc-icon.png';
				}else if(($uploadFile_ext != '') && ($uploadFile_ext == 'docx')){
					$fetchthumbImage = get_template_directory_uri().'/assets/docx-icon.png';
				}else if(($uploadFile_ext != '') && ($uploadFile_ext == 'ppt')){
					$fetchthumbImage = get_template_directory_uri().'/assets/ppt-icon.png';
				}else if(($uploadFile_ext != '') && ($uploadFile_ext == 'pptx')){
					$fetchthumbImage = get_template_directory_uri().'/assets/pptx-icon.png';
				}else{
					$fetchthumbImage = get_template_directory_uri().'/assets/word-icon.png';
				}

				//$fetchDocDetails .= '<div class="doc-plc"><div class="title">'.get_the_title().'</div><a href="'.$uploadFile_url.'" target="_blank"><img src="'.$fetchthumbImage.'" /></a></div>';

				$date =  (get_field('date') != '') ? date_format(date_create(''.get_field('date').''),'d-m-Y') : '';		

				$fetchDocDetails .= '<li>
						<div class="img-bx"> <img src="'.$fetchthumbImage.'"></div>
						<div class="img-title"><a href="'.$uploadFile_url.'" target="_blank">'.get_the_title().'</a>';
						if($date != '') { $fetchDocDetails .= '<span class="img-date" > '.$date.' </span>'; }
						$fetchDocDetails .='</div>';
						$fetchDocDetails .='<div class="img-sub-title">'.get_the_excerpt().'</div>';						
				$fetchDocDetails .= '</li>';


			endwhile;
			$fetchDocDetails .='</ul>';
		endif; 
		wp_reset_postdata();
		wp_reset_query(); 

		if(trim($fetchDocDetails) == ''){
			$fetchDocDetails = '<div class="doc-plc" style="border:0px;">No document found.</div>';
		}
	}else{
		$fetchDocDetails = '<div class="doc-plc" style="border:0px;">Some error occured.</div>';
	}

 echo $fetchDocDetails;
 die();   
}


add_action('init', 'myStartSession', 1);
add_action('wp_logout', 'myEndSession');
add_action('wp_login', 'myEndSession');

function myStartSession() {
    if(!session_id()) {
        session_start();
    }
}

function myEndSession() {
    session_destroy ();
}


/*
Hide the category from category listing if there is sub-category, in ADMIN doc section
*/

add_action( 'admin_footer-post.php',     'wpse_98274_disable_top_categories_checkboxes' );
add_action( 'admin_footer-post-new.php', 'wpse_98274_disable_top_categories_checkboxes' );

/**
 * Disable parent checkboxes in Post Editor.
 */
function wpse_98274_disable_top_categories_checkboxes() {
    global $post_type;

    if ( 'post-document' != $post_type )
        return;
    ?>
        <script type="text/javascript">
            jQuery( "#category-all ul.children" ).each( function() {
                jQuery(this).closest( "ul" ).parent().children().children( "input" ).attr( 'disabled', 'disabled' )
            });
        </script>
    <?php
}

function curl_get_contents($url) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_HEADER, 0);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_URL, $url);
    $data = curl_exec($ch);
    curl_close($ch);
    return $data;
}

$site_base_url = get_site_url();
global $hosted_folder_name;
$hosted_folder_name = "";
if (!empty($site_base_url)) {
    $site_bas_Exp = @explode("/", $site_base_url);
    if (count($site_bas_Exp)>1){
        $hosted_folder_name = !empty($site_bas_Exp[count($site_bas_Exp)-1]) ? $site_bas_Exp[count($site_bas_Exp)-1] : "";
    }
    if (in_array(strtolower($hosted_folder_name), array("open_unicef", "odp-frontend-wp", "open.unicef.org.staging"))) { //Add test server folder name
        $hosted_folder_name = "/".$hosted_folder_name;
    } else {
        $hosted_folder_name = "";
    }
}

/* #########  Adding a new field at general settings page start  #########*/
function default_year_api_init() {
 	// Add the section to general settings so we can add our
 	// fields to it
 	add_settings_section(
		'default_year_section',
		'Set default year',
		'default_year_section_callback_function',
		'general'
	);
 	
 	// Add the field with the names and function to use for our new
 	// settings, put it in our new section
 	add_settings_field(
		'openunicef_default_year',
		'Default year',
		'default_year_setting_callback_function',
		'general',
		'default_year_section'
	);
 	
 	// Register our setting so that $_POST handling is done for us and
 	// our callback function just has to echo the <input>
 	register_setting( 'general', 'openunicef_default_year' );
 } // eg_settings_api_init()
 
  
 // ------------------------------------------------------------------
 // Settings section callback function
 // ------------------------------------------------------------------
 //
 // This function is needed if we added a new section. This function 
 // will be run at the start of our section
 //
 
 function default_year_section_callback_function() {
 	//echo '<p>Set default year for front end</p>';
 }
 
 // ------------------------------------------------------------------
 // Callback function for our example setting
 // ------------------------------------------------------------------
 //
 // creates a checkbox true/false option. Other types are surely possible
 //
 
 function default_year_setting_callback_function() {
 	//echo '<input name="eg_setting_name" id="eg_setting_name" type="checkbox" value="1" class="code" ' . 
	//checked( 1, get_option( 'eg_setting_name' ), false ) . ' /> Explanation text';	
	$years = range((date("Y")-1), date("Y"));	
	$years = array_merge( array("None"),   $years);	
	//echo "<pre>";
	//print_r($years);
	//echo "</pre>";
	//echo date("Y"); 
	$default_year = get_option( "openunicef_default_year", '0000');
	//echo $default_year;
	echo '<select name="openunicef_default_year" id="openunicef_default_year" >';
	foreach($years as $k => $v){
		//array_merge()
		$val = ($v != "None") ? $v : "0000";
		$sel = ($default_year == $val) ? "selected" : "";
		echo '<option value="'.$val.'" '.$sel.'>'.$v.'</option>';		
	}
	echo '</select>';	
	//exit;
 }
 
 add_action( 'admin_init', 'default_year_api_init' );
 /* #########  Adding a new field at general settings page end  #########*/