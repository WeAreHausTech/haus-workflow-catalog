## Naming conventions

- ACF field keys: `snake_case` (e.g. `hero_title`, `cta_button_url`)
- PHP widget classes: `My_Plugin_Widget_Name` extending `\Elementor\Widget_Base`
- JetEngine content type slugs: `kebab-case` (e.g. `team-member`, `project-case`)
- ACF JSON directory: `acf-json/` in theme or plugin root — must be committed to version control
- JetEngine export JSON: `jet-engine-exports/` directory — committed to version control

## Do / don't

DO: Update ALL `get_field('old_key')` / `the_field('old_key')` call sites before or simultaneously with renaming an ACF field key — DON'T: rename ACF field key without searching and updating every callsite
DO: Commit `acf-json/` directory to version control — DON'T: rely on database-only ACF field group definitions across environments
DO: Escape all output with appropriate function: `esc_html()`, `esc_url()`, `esc_attr()`, `wp_kses_post()` — DON'T: echo unescaped ACF field values directly
DO: Register Elementor widgets inside the `elementor/widgets/register` hook — DON'T: register widgets outside this hook (causes load-order errors)
DO: Check return value of `get_field()` before using it (`if ($value = get_field(...)) { ... }`) — DON'T: assume `get_field()` always returns a usable value
DO: Export JetEngine content type config to JSON and commit it — DON'T: make JetEngine config changes only in the database

## Forbidden patterns

NEVER: ACF field renamed without updating all `get_field()` / `the_field()` callsites — returns empty values silently
NEVER: Dynamic output without an escaping function — XSS vulnerability
NEVER: Reference ACF field by label string (use the field key) — labels change; keys are stable identifiers
NEVER: JetEngine config change not exported to JSON and committed — config lost on DB reset or environment sync
NEVER: Elementor widget registered outside `elementor/widgets/register` hook — causes class-not-found errors
NEVER: `acf-json/` directory excluded from version control — field group changes cannot be deployed reliably
