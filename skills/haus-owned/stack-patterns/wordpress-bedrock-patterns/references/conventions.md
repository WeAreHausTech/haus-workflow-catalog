## Naming conventions

- Application config: `config/application.php` — PHP constants and environment bindings
- Environment overrides: `config/environments/production.php`, `config/environments/development.php`
- Must-use plugins: `web/app/mu-plugins/` (not `web/wp-content/mu-plugins/`)
- Regular plugins: `web/app/plugins/` (Composer-installed; never uploaded via WP admin)
- Themes: `web/app/themes/<theme-name>/`
- WP core: `web/wp/` — treated as read-only Composer dependency
- Uploads: `web/app/uploads/` (gitignored)

## Do / don't

DO: Install and manage all plugins via `composer.json` only — DON'T: install or update plugins via the WP admin dashboard
DO: Add every new environment variable to `.env.example` with a descriptive example value or blank marker — DON'T: commit real secret values in `.env.example`
DO: Treat `web/wp/` as a Composer-managed read-only directory — DON'T: edit any file under `web/wp/` (overwritten on `composer update`)
DO: Reference `WP_HOME` and `WP_SITEURL` from env vars in `config/application.php` — DON'T: hardcode URLs in config files
DO: Use `Config::define()` / `env()` helper for all env var access in config files — DON'T: call `getenv()` or `$_ENV` directly in application code
DO: Change WP core version by updating `composer.json` and running `composer update roots/wordpress` — DON'T: change WP version by editing files in `web/wp/`

## Forbidden patterns

NEVER: Secret or credential value in `config/application.php` — committed to version control; use env vars
NEVER: Reference `web/wp-content/` path — Bedrock uses `web/app/` as the content directory
NEVER: WP core version change without running `composer update` — `web/wp/` becomes inconsistent
NEVER: Plugin activated via WP admin that is not tracked in `composer.json` — disappears on next deploy
NEVER: `.env` file committed to version control — contains real credentials
NEVER: `define()` in `web/wp/wp-config.php` — that file is Composer-managed and will be overwritten
