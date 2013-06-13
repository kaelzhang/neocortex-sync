# Install

> Really can't stand @isaacs any more.

1. Even never add `'node_modules'` into .gitignore file
2. Untested APIs
3. Singletons everywhere

### Notes about install npmjs.org

##### Error: forbidden failed checking doc.forbidden or doc._deleted

add a 'error: forbidden' document to /registry

	
	
##### \_design/app -> \_design/scratch

##### Error: insecure_rewrite_rule too many ../.. segments

editing `/usr/local/etc/couchdb/local.ini` and adding `secure_rewrites = false` on line 11 in the `httpd` section.

	

##### vhosts? -> 

	vim /usr/local/etc/couchdb/local.ini


##### 413 Request Entity Too Large
	server {
        client_max_body_size 20M;
    }