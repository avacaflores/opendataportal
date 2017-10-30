=== Dephue Data Design Hide Update Notifications - Developer Edition ===
Contributors: adephue
Donate link: https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=4R35MJWMEK3NY
Tags: admin, update, upgrade, hide
Requires at least: 3.0
Tested up to: 3.7.1
Stable tag: 0.2.1
License: GPLv2 or later

Dephue Data Design Hide Update Notifications - Developer Edition hides update notifications from users.

== Description ==

Dephue Data Design Hide Update Notifications - Developer Edition hides update notifications from users. The plugin also (optionally) hides it's own existence. Granular control over who sees update notifications is possible based on login name, user email, or native WordPress role. This is labeled "Developer Edition" because there is no administrative interface; all changes must be made directly in the code.

Notes:

* Please read the instructions; there is no administrative interface. Changes are made in the plugin file's code.
* General instructions are in the FAQ
* Uninstall instructions are in the FAQ
* Everything you need to know is in the FAQ
* So read the FAQ
* This is still in 'beta' because it has not been test on WP < 3.5.2
* The plugin has only been tested on PHP 5.3.x in a Linux environment
* There is no web-facing interface, all configuration is done in the plugin file itself
* The plugin does not remove the ability to perform updates, it simply hides the mechanisms used to do so

What gets removed:

* The update notification in the fixed-position WordPress Admin Bar (top of the scrren).
* The "Updates" submenu item in the Dashboard menu.
* The circular image containing the number of updates available to plugins.
* The main yellow-highlighted update nag at the top of the dashboard.
* The Update to [...] button in the Right Now area of the dashboard.
* The "Get Version [...]" text at the bottom right of the admin dashboard.
* On the plugins page: The "Update Available (x)" text.
* Plugins page: Text below plugin that reads "There is a new version of [...] available. [...]".
* Themes page: Text that reads "There is a new version of [...] available. [...]".

How it works:

* The plugin attempts to use jQuery and CSS to remove items from the DOM and/or hide them.
* The "Updates" submenu item has to be manually removed from an array before it is rendered. 

== Installation ==

Upload the plugin to your blog and activate it. If the plugin disappears from the list of plugins it is working as intended. Uninstall instructions are in the FAQ.

== Frequently Asked Questions ==

= I activated the plugin and it disappeared from my list of plugins. Why? =

This is default behavior. The plugin was intended to hide update/upgrade notices. If the plugin was disabled, the notices would show again. You can turn this behavior off in the plugin file itself. Follow the instructions below for updating your the plugin's config values.

= OK, so it works. But how do I deactivate/uninstall it? =

There are three ways.  The easiest way is to just delete the plugin folder out of the plugins directory. Or, you can add a key=value pair to the query string. Add show_hunde=51f2207ac52a5161fe44aeb14e9f3024 (Ex: [...]/plugins.php?show_hunde=51f2207ac52a5161fe44aeb14e9f3024 or [...]/plugins.php?key=value&show_hunde=51f2207ac52a5161fe44aeb14e9f3024). Adding this to the query string and then loading the page will force the plugin to display on the page.  You can then deactivate and delete. Finally, edit the source code of the main plugin file. The instructions are in the code.

= How do you control the behavior of this plugin? There is no admin menu item or control panel. =

Correct. There is currently only a developer edition of the plugin and it is configured in the code of the plugin itself. To update your config values, enter them into the array found at the top of the main plugin file (there are comments in the code). Afterward, append the following key/value pair to the query string of /wp-admin/plugins.php: update_hunde=51f2207ac52a5161fe44aeb14e9f3024 

= What config values are available and what do they control? =

The config array is located at the top of the main plugin file. It is an associative array. The following elements are present and behave as follows:
* 'hide_plugin_existence': this is a boolean true/false. On true, the plugin will disappear from the list of plugins. On false, it will still hide updates, but remain listed in the list of plugins found in /wp-admin/plugins.php
* 'show_to_user_logins': this array of string will allow you to specify who will be able to see update notifications. Example: array( 'admin', 'john' ) would effectively disable the functionality of the plugin for those two users ~REGARDLESS OF ROLE OR CAPABILITY~
* 'show_to_user_email_match': an array of strings that will be matched against the user's e-mail address. This would allow you to show the updates to everyone with a common substring in their e-mail address. Example: array( 'company1.com', 'company2.com' ) would effectively disable the plugin for anyone with e-mail addresses containing either string. It would also disable the plugin for an e-mail address like: company1@somedomain.com
* 'show_to_user_role': an array of WordPress roles. Example: array( 'Administrator' ) would disable the plugin for all Administrators. If you specify a role that can't see updates to begin with, they are not going to see them by adding them to this config element. 

= How will I know when to update my site? =

The control over who sees updates is very granular. Add your e-mail address or login name to the config and you will be able to see updates. Otherwise, when an update is available, there is no version listed in the lower right hand corner of the admin dashboard.

== Screenshots ==

1. Update reminders are removed from the admin menu.
2. Plugin update reminders are removed and the plugin itself is masked (optional).
3. Update reminders are removed from the themes control panel.
4. Adding show_hunde=51f2207ac52a5161fe44aeb14e9f3024 to the query string will force the plugin to expose it's existence.
5. Adding update_hunde=51f2207ac52a5161fe44aeb14e9f3024 to the query string will cause the plugin to update the database-stored config with what is in the plugin file code.

== Changelog ==

= 0.2.1 =
* Tested on 3.7 and 3.7.1

= 0.2.0 =
* The config for the plugin is now loaded into the `wp_options` table. As such, future upgrades will not affect already stored config.
* For now, the way to update the database-stored config with changes made in the code is to append the following key=value pair to /wp-admin/plugins.php: update_hunde=51f2207ac52a5161fe44aeb14e9f3024
* This adds an extra step in updating config, but it prevents configs from being erased during upgrades.
* This update ~WILL~ erase your existing config, so back it up first. After the update, re-insert your config values and run the config update as outlined in the FAQ to get your settings into the options database table.
* Tested on 3.7rc2

= 0.1.3 =
* Added jQuery to alter the number of items listed at the header and footer of the list of plugins (right-hand side, reads "x items").

= 0.1.2 =
* Added jQuery that will modify plugin count on plugins.php to help hide the existence of the plugin.
* Added ability to use query string to expose plugin for easier deactivation/uninstall.

= 0.1.1 =
* Internal changes when determining what actions to take based on WordPress version
* Added method to force exposure of plugin through query string.
* Upgrading WILL cause all configs in the code to reset. Be prepared to re-implement them.

= 0.0.1 =
* Initial release
* Tested on stable releases back to 3.5.2
* Tested on a LAMP stack; PHP v5.3.x
