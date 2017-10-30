<?php
/**
 * Plugin Name: Dephue Data Design Hide Update Notifications - Developer Edition
 * Plugin URI: http://plugins.dephuedatadesign.com/hide-update-notifications-developer-edition
 * Description: Hides WordPress update notifications.
 * Version: 0.2.1
 * Author: Anthony T. Dephue <adephue@gmail.com>
 * License: GPL2
 */

/**
* CONFIGURABLE SETTINGS
*/
$ddd_51f2207ac52a5161fe44aeb14e9f3024_hunde_config = array(
    // Options: true or false
    'hide_plugin_existence'     => true,
    // List of $user_login          
    'show_to_user_logins'       => array( '' ),   
    // Strings to look for in $user_emails Ex: 'company' would match jim@company.com and company_default@domain.com
    'show_to_user_email_match'  => array( '' ),
    // Native WordPress roles to show to
    'show_to_user_role'         => array( '' ), 
);         
                               
/**
* END CONFIGURABLE SETTINGS
*/
if( ! class_exists( 'ddd_51f2207ac52a5161fe44aeb14e9f3024_hunde' ) ):
    class ddd_51f2207ac52a5161fe44aeb14e9f3024_hunde {
        
        private $_version;
        
        private $_config;
                        
        private $_templates = array(
            '3' => array(
                'tpl' => 'default',
                // Example
                'x' => array(
                    'tpl' => '3x',
                    'y' => array(
                        'tpl' => '3xy',
                    ),
                ), 
            ),
        
        );
        
        /**
        * Recursive function iterates through $_templates
        * Returns the highest possible template file to execute.
        * 
        * @param mixed $templates
        * @param mixed $tpl
        * @param mixed $exploded_version
        */
        private function template ( $templates = null, $tpl = 'default', $exploded_version = null )
        {
            
            if( null === $templates ) $templates = $this->_templates;
            if( null === $exploded_version ) $exploded_version = explode( '.', $this->_version() );        
            $version_element = array_shift( $exploded_version );
            
            // Grab the first element off of $exploded_version and see if it is present in $templates
            if( 
                true === array_key_exists( $version_element, $templates ) 
            )
            {           
                if(
                    true === array_key_exists( 'tpl', $templates[ $version_element ] )
                    && $templates[ $version_element ]['tpl'] != ''
                )
                {
                    $tpl = $templates[ $version_element ]['tpl'];    
                }
                
                return $this->template( $templates[ $version_element ], $tpl, $exploded_version );    
            }
            
            return $tpl;
                    
        }
        
        function __construct ()
        {
            global $wp_version, $ddd_51f2207ac52a5161fe44aeb14e9f3024_hunde_config;
            $this->_version( $wp_version );
            /**
            * Added for version 0.2.0
            * Get the config array from the WP options table
            * 
            * @var ddd_51f2207ac52a5161fe44aeb14e9f3024_hunde
            */
            $this->_config( $ddd_51f2207ac52a5161fe44aeb14e9f3024_hunde_config ); 
            unset( $ddd_51f2207ac52a5161fe44aeb14e9f3024_hunde_config );
            // Check for overrides
            $this->overrides();     
        }
        
        public function admin_head () { return $this->hide(); }
        
        public function wp_head() { return $this->hide( 'front' ); }
        
        private function check_user ()
        {   
            // Check the user
            if( false === ( ( $current_user = wp_get_current_user() ) instanceof WP_User ) )
            {
                // No user to check against, they would never see admin notices anyway
                // return false;
            }
            $config = $this->_config();
            if( 
                true === array_key_exists( 'show_to_user_logins', $config ) 
                && $current_user->user_login != ''
                && in_array( $current_user->user_login, $config['show_to_user_logins'] )
            )
            {
                return true;
            }
            if( 
                true === array_key_exists( 'show_to_user_email_match', $config ) 
                && true === is_array( $config['show_to_user_email_match'] )
                && 0 < count( $config['show_to_user_email_match'] )
                && $current_user->user_email != ''
            )
            {
                foreach( $config['show_to_user_email_match'] as $str )
                {
                    if( 
                        $str !== ''
                        && false !== strpos( $current_user->user_email, $str ) 
                    ) 
                    {
                        return true;    
                    }
                }
            } 
            if( 
                true === array_key_exists( 'show_to_user_role', $config ) 
                && true === is_array( $config['show_to_user_role'] )
                && 0 < count( $config['show_to_user_role'] )
            )
            {
                
                foreach( $config['show_to_user_role'] as $role )
                {
                    if( 
                        $role !== ''
                        && true === in_array( $role, (array) $current_user->roles ) 
                    ) 
                    {
                        return true;    
                    }
                }
            } 
            false;   
        }
        
        public function admin_menu ()
        {
            if( true === $this->check_user() ) return;
            global $submenu;
            switch( $this->_version() )
            {
                case '3.6':
                default:
                    foreach( $submenu['index.php'] as $i => $items )
                    {
                        foreach( $items as $str )
                        {
                            if( $str == 'update-core.php' )
                            {
                                unset( $submenu['index.php'][$i] );
                                break 2;
                            }
                        }
                    }
                break;
            }        
        } 
        
        private function hide ( $realm = 'admin' )
        {
            // First, see if we should abort the hiding based on config
            if( true === $this->check_user() ) return;
            // Now, call the template file
            if( file_exists( ( $file = dirname( __FILE__ ) . DIRECTORY_SEPARATOR . 'assets/tpl' . DIRECTORY_SEPARATOR . $this->template() . '.tpl.php' ) ) )
            {
                $config = $this->_config();
                include_once( $file );
            } 
            return; 
        }
        
        private function _version ( $wp_version = null )
        {
            // Get
            if( null === $wp_version ) return $this->_version;
            // Set
            $this->_version = $wp_version;
        }
        
        private function _hide ()
        {
            return $this->_hide;
        }
        
        private function _config( $config = null )
        {
            // get
            if( null === $config ) return $this->_config;
            // set
            $this->set_config( $config );
        }
        
        /**
        * Added for v0.2.0
        * 
        * Method will check the WP options table for a config array.
        */
        private function set_config ( $config )
        {
            // If the config isn't in the options table, add it, then return the config
            if( ( $options_config = get_option( 'ddd_51f2207ac52a5161fe44aeb14e9f3024_hunde_config', null ) ) === null )
            {
                
                update_option( 'ddd_51f2207ac52a5161fe44aeb14e9f3024_hunde_config', $config );
                $this->_config = $config;
                return;
            }    
            // Compare the code-defined array and options table array
            // Add any necessary keys.  
            if( is_array( $options_config ) )
            {
                $update_needed = false;
                foreach( $config as $key => $val )
                {
                    if( array_key_exists( $key, $options_config ) === false )
                    {
                        $update_needed = true;
                        $options_config[ $key ] = $val;
                    }
                }    
                if( $update_needed === true )
                {
                    update_option( 'ddd_51f2207ac52a5161fe44aeb14e9f3024_hunde_config', $options_config );
                }
                $this->_config = $options_config;
                return;
            }
            // $config wasn't an array
            $this->_config = $config;
            return;
        }
        
        /**
        * Added for v0.2.0
        * Override the hide existence option when the correct param is set in the query string
        */
        private function hide_existence_override ()
        {
            if( array_key_exists( 'hide_plugin_existence', $this->_config ) )
            {
                $this->_config['hide_plugin_existence'] = false;
            }    
        }
        
        private function overrides ()
        {
            /**
            * A more user-friendly way to override the hiding of the plugin. Should assist with uninstalls for users that cannot edit code directly.
            */
            if(
                true === isset( $_GET )
                && true === array_key_exists( 'show_hunde', $_GET )
                && strtolower( $_GET['show_hunde'] ) === '51f2207ac52a5161fe44aeb14e9f3024'
            )
            {
                $this->hide_existence_override();  
            }
            /**
            * Force the code-defined config to be loaded into the WP options table  
            */
            if(
                true === isset( $_GET )
                && true === array_key_exists( 'update_hunde', $_GET )
                && strtolower( $_GET['update_hunde'] ) === '51f2207ac52a5161fe44aeb14e9f3024'
            )
            {
                global $ddd_51f2207ac52a5161fe44aeb14e9f3024_hunde_config;
                update_option( 'ddd_51f2207ac52a5161fe44aeb14e9f3024_hunde_config', $ddd_51f2207ac52a5161fe44aeb14e9f3024_hunde_config ); 
                add_action( 'admin_notices', array( __CLASS__, 'notice_config_updated' ) ); 
            }
        } 
        
        public static function notice_config_updated( )
        {   
            echo trim( "
                <div class=\"updated\"><p>Dephue Data Design Hide Update Notifications - Developer Edition:<br />The code-based configuration was loaded into the WordPress `wp_options` table.</p></div>
            " );
        }
        
    }
    if( function_exists( 'add_action' ) )
    {
        $obj = new ddd_51f2207ac52a5161fe44aeb14e9f3024_hunde;
        add_action( 'admin_head', array( &$obj, 'admin_head' ) );
        add_action( 'admin_menu', array( &$obj, 'admin_menu' ) );
        add_action( 'wp_head', array( &$obj, 'wp_head' ) );
    }
endif;