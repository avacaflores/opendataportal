<?php
/**
 * The base configurations of the WordPress.
 *
 * This file has the following configurations: MySQL settings, Table Prefix,
 * Secret Keys, and ABSPATH. You can find more information by visiting
 * {@link https://codex.wordpress.org/Editing_wp-config.php Editing wp-config.php}
 * Codex page. You can get the MySQL settings from your web host.
 *
 * This file is used by the wp-config.php creation script during the
 * installation. You don't have to use the web site, you can just copy this file
 * to "wp-config.php" and fill in the values.
 *
 * @package WordPress
 */


//Using environment variables for DB connection information

$connectstr_dbhost = '';
$connectstr_dbname = '';
$connectstr_dbusername = '';
$connectstr_dbpassword = '';

foreach ($_SERVER as $key => $value) {
    if (strpos($key, "MYSQLCONNSTR_") !== 0) {
        continue;
    }
    
    $connectstr_dbhost = preg_replace("/^.*Data Source=(.+?);.*$/", "\\1", $value);
    $connectstr_dbname = preg_replace("/^.*Database=(.+?);.*$/", "\\1", $value);
    $connectstr_dbusername = preg_replace("/^.*User Id=(.+?);.*$/", "\\1", $value);
    $connectstr_dbpassword = preg_replace("/^.*Password=(.+?)$/", "\\1", $value);
}


// ** MySQL settings - You can get this info from your web host ** //

/** The name of the database for WordPress */
/** define('DB_NAME', $connectstr_dbname);

/** MySQL database username */
/** define('DB_USER', $connectstr_dbusername);

/** MySQL database password */
/** define('DB_PASSWORD', $connectstr_dbpassword);

/** MySQL hostname */
/** define('DB_HOST', $connectstr_dbhost);

/** Database Charset to use in creating database tables. */
/** define('DB_CHARSET', 'utf8');

/** The Database Collate type. Don't change this if in doubt. */
/** define('DB_COLLATE', '');


/** The name of the database for WordPress */
define('DB_NAME', 'open_unicef_org');

/** MySQL database username */
define('DB_USER', 'azure');

/** MySQL database password */
define('DB_PASSWORD', '6#vWHD_$');

/** MySQL hostname */
/** define('DB_HOST', 'localhost:50138'); */
define('DB_HOST', $connectstr_dbhost);

/** Database Charset to use in creating database tables. */
define('DB_CHARSET', 'utf8mb4');

/** The Database Collate type. Don't change this if in doubt. */
define('DB_COLLATE', '');


/**#@+
 * Authentication Unique Keys and Salts.
 *
 * Change these to different unique phrases!
 * You can generate these using the {@link https://api.wordpress.org/secret-key/1.1/salt/ WordPress.org secret-key service}
 * You can change these at any point in time to invalidate all existing cookies. This will force all users to have to log in again.
 *
 * @since 2.6.0
 */
define('AUTH_KEY',         'cW*@kb6Y^k<%=/%M^M6IKhia_nr9|L~VO:3].Fu>]39d?&yUiAs|dG0;[l5G|Z1M');
define('SECURE_AUTH_KEY',  '-wR>A@_7=Yu#]H_:>k=DCb|+-tqq7p2M;meQ4S/AH;Tdh2,Wn2)>MXKo%MT!/5oL');
define('LOGGED_IN_KEY',    'n;G-=#z)4x8@J]j!(^pzJ||j%7rR0?! #KDUb<R>+u,8+wNb3,.|A[FpzH<OC?&>');
define('NONCE_KEY',        'g@P ,l=Jj|n?-?2Am,)Zyr?`|AQ$5.i _b)i1|=0`(F3NCy<6S584/]d}LQ{f$Y_');
define('AUTH_SALT',        'N}]][#|+J-Z&U2J^=*9)57@+At:Lk <]6jMwj`5sBny pt;`mS~%~VtxXHwdrA<<');
define('SECURE_AUTH_SALT', '[J.&%uwinKM$T)$cZK_V.3VgyvL-QF%C`H>NEy5|oOyNddDFLC3n?}p(r:Wf@+mJ');
define('LOGGED_IN_SALT',   '0ya!.~qb@wZ~,N+vR~+NuY2@8#$4>X_R~G6bQV6XUui7^=ro_.WRc)zkP0wvK$8l');
define('NONCE_SALT',       '/a7-ZPW8HXu?!/TydXACyDa|(v&[BFtmLjLCiT(U1I%Dqk.hTH=o>(fqi(#.RYv$');

/**#@-*/

/**
 * WordPress Database Table prefix.
 *
 * You can have multiple installations in one database if you give each a unique
 * prefix. Only numbers, letters, and underscores please!
 */
$table_prefix  = 'uni_';

/**
 * For developers: WordPress debugging mode.
 *
 * Change this to true to enable the display of notices during development.
 * It is strongly recommended that plugin and theme developers use WP_DEBUG
 * in their development environments.
 */
define('WP_DEBUG', false);

/* That's all, stop editing! Happy blogging. */

/* Turn off Post/Page Revisions in ADMIN */

define('WP_POST_REVISIONS', false );

/** Absolute path to the WordPress directory. */
if ( !defined('ABSPATH') )
	define('ABSPATH', dirname(__FILE__) . '/');

/** Sets up WordPress vars and included files. */
require_once(ABSPATH . 'wp-settings.php');

/** Sets up for remove the file editing functionality thru admin */
define( 'DISALLOW_FILE_EDIT', true );


/** Sets up disable all core updates */
define( 'WP_AUTO_UPDATE_CORE', false );
