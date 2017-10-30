<?php 
    $hide = array(
        'admin' => array(
            'options' => array(
                'general' => array(
                    'li#wp-admin-bar-updates',
                    'tr.plugin-update-tr',
                    'span.update-plugins',
                    'li.upgrade',
                    'li.recently_activated',
                    'p#footer-upgrade',
                    'div.update-nag',
                    'span#wp-version-message',
                    'div.available-theme div.action-links > p',
                    'div#current-theme div p > strong',
                ),
                'hide_plugin_existence' => array(
                    'tr#dephue-data-design-hide-update-notifications-developer-edition',    
                ),
            ),
        ),
        'front' => array(
            'options' => array(
                'general' => array(
                    'li#wp-admin-bar-updates',
                ),    
            ),    
        ),
    );
    
    // Really should be checking that these elements exist
    $hide = $hide[ $realm ][ 'options' ];
    
    $selectors = array();
    // Implode selectors into a comma-separated list
    if( array_key_exists( 'general', $hide ) )
    {
        $selectors = implode( ',', $hide['general'] );
        unset( $hide['general'] );    
    }
    // See if there are any options
    if( count( $hide ) )
    {
        foreach( $hide as $option => $selector_array )
        {
            if( 
                true === array_key_exists( $option, $config ) 
                && true === $config[ $option ]
            )
            {
                $selectors .= ',' . implode( ',', $selector_array );    
            }
        }
    }
    if( count( $selectors ) == 0 ) return;
    // Output javascript and css
    echo trim( '
        <script type="text/javascript">
            //<![CDATA[
                if( typeof jQuery != "undefined" )
                {
                    jQuery( document ).ready( function () {
                        var selectors = "' . $selectors . '";
                        jQuery( selectors ).remove();
                        // Fix up the plugins page
                        if( window.location.pathname.indexOf( "/plugins.php" ) != -1 )
                        {   
                            jQuery( "body.plugins-php ul > li.all > a > span.count" ).text( "(" + jQuery( "table.plugins tbody#the-list tr" ).length.toString() + ")" ).show();
                            jQuery( "body.plugins-php div.tablenav-pages span.displaying-num" ).text( jQuery( "table.plugins tbody#the-list tr" ).length.toString() + " items" ).show();
                            jQuery( "body.plugins-php ul > li.active > a > span.count" ).text( "(" + jQuery( "table.plugins tbody#the-list tr.active" ).length.toString() +")" ).show();
                            jQuery( "body.plugins-php ul > li.inactive > a > span.count" ).text( "(" + jQuery( "table.plugins tbody#the-list tr.inactive" ).length.toString() +")" ).show();
                            jQuery( jQuery( "body.plugins-php ul.subsubsub > li" )[ jQuery( "body.plugins-php ul.subsubsub > li > a > span.count" ).length - 1 ] ).html( jQuery( jQuery( "body.plugins-php ul.subsubsub > li" )[ jQuery( "body.plugins-php ul.subsubsub > li > a > span.count" ).length - 1 ] ).html().replace( "|", "" ) );
                        }
                    } );        
                }    
            //]]>
        </script>
        <style type="text/css">
            ' . $selectors . '
            {
                display: none !important;
            }
            body.plugins-php ul > li > a > span.count,
            body.plugins-php div.tablenav-pages span.displaying-num
            {
                display: none;    
            }
        </style>
    ' );