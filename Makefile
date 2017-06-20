
references-translate: /projects/references-translate/bundle.js /projects/references-translate/index.html

/projects/references-translate/%:
	wget -q -N "https://raw.githubusercontent.com/edpop/references-translate/master/dist/$(notdir $@)" -P projects/references-translate/
