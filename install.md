# Install

> Really can't stand @isaacs any more.

1. Even never add `'node_modules'` into .gitignore file
2. Untested APIs
3. Singleton everywhere

### Notes about install npmjs.org

add a 'error: forbidden' document to /registry

	Error: forbidden failed checking doc.forbidden or doc._deleted
	
\_design/app -> \_design/scratch

editing `/usr/local/etc/couchdb/local.ini` and adding `secure_rewrites = false` on line 11 in the `httpd` section.

	Error: insecure_rewrite_rule too many ../.. segments