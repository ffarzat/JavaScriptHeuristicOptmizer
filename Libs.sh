#!/bin/bash

### Exectimer		
	qsub Exectimer/exectimer-0.sh
	qsub Exectimer/exectimer-10.sh
	qsub Exectimer/exectimer-20.sh		
	qsub Exectimer/exectimer-30.sh		
	qsub Exectimer/exectimer-40.sh		
	qsub Exectimer/exectimer-50.sh

### Express
	qsub Express/Express-0.sh
	qsub Express/Express-10.sh
	qsub Express/Express-20.sh 			
	qsub Express/Express-30.sh	
	qsub Express/Express-40.sh
	qsub Express/Express-50.sh

### Jade			
    qsub Jade/Jade-20.sh
    qsub Jade/Jade-30.sh
	qsub Jade/Jade-40.sh
	qsub Jade/Jade-50.sh

### Gulp
	qsub Gulp/RD-gulp-cccr.sh
	qsub Gulp/GA-0-gulp-cccr.sh
	qsub Gulp/GA-10-gulp-cccr.sh
	qsub Gulp/GA-20-gulp-cccr.sh	
	qsub Gulp/GA-30-gulp-cccr.sh
	qsub Gulp/GA-40-gulp-cccr.sh
	qsub Gulp/GA-50-gulp-cccr.sh

### Lodash		
	qsub Lodash/Lodash-0.sh
	qsub Lodash/Lodash-20.sh
	qsub Lodash/Lodash-30.sh
	qsub Lodash/Lodash-40.sh
	qsub Lodash/Lodash-50.sh

### Node-Browserify
    qsub Node-browserrify/Job0.sh
	qsub Node-browserrify/Job40.sh
    qsub Node-browserrify/Job50.sh