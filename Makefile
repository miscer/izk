test:
	./node_modules/.bin/mocha -r should --compilers coffee:coffee-script

izk.js: src/izk.coffee
	coffee -o lib -c src/izk.coffee

chrome: izk.js
	cp lib/izk.js chrome/
	cp lib/jquery.js chrome/
