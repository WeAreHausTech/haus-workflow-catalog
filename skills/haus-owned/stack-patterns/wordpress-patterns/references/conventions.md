## Naming conventions

- Hook callbacks: `prefix_action_name` (plugin/theme prefix + snake_case description, e.g. `myplugin_enqueue_scripts`)
- Plugin main file: `plugin-slug/plugin-slug.php` (directory name matches file name)
- Custom Post Types: registered with `prefix_` slug (e.g. `myplugin_event`, `myplugin_resource`)
- Custom taxonomies: `prefix_` slug (e.g. `myplugin_category`)
- REST route namespace: `plugin-slug/v1` (e.g. `myplugin/v1/events`)
- Class names: `My_Plugin_Class_Name` (WordPress PSR-0 style, underscore-separated)

## Do / don't

DO: Specify explicit priority on all `add_action` / `add_filter` calls — DON'T: rely on default priority 10 when order relative to core hooks matters
DO: Always provide `permission_callback` on `register_rest_route` — DON'T: use `__return_true` as the permission callback for non-public endpoints
DO: Use `current_user_can()` + `check_admin_referer()` for all admin form submissions — DON'T: process admin POST data without nonce and capability checks
DO: Escape all output with `esc_html()`, `esc_url()`, `esc_attr()`, or `wp_kses_post()` — DON'T: echo variable data without escaping
DO: Use `$wpdb->prepare()` for all custom queries with variable input — DON'T: concatenate user input into SQL strings
DO: Prefix all functions, classes, and globals with a unique plugin prefix — DON'T: use generic names that conflict with other plugins

## Forbidden patterns

NEVER: Direct database query without `$wpdb->prepare()` — SQL injection vulnerability
NEVER: REST endpoint registered without `permission_callback` — WordPress throws a notice and defaults to public access
NEVER: Dynamic output echoed without an escaping function — XSS vulnerability
NEVER: Edit WP core files — overwritten on every update
NEVER: `__return_true` as `permission_callback` for a REST route that modifies data — grants write access to unauthenticated users
NEVER: Enqueue scripts without a version parameter — browser caching will serve stale files after updates
