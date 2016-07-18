#!/bin/bash

### Exectimer
	echo "Exectimer/exectimer-0.sh" && 	qsub Exectimer/exectimer-0.sh
	echo "Exectimer/exectimer-10.sh" && qsub Exectimer/exectimer-10.sh
	echo "Exectimer/exectimer-20.sh" && qsub Exectimer/exectimer-20.sh		
	echo "Exectimer/exectimer-30.sh" && qsub Exectimer/exectimer-30.sh		
	echo "Exectimer/exectimer-40.sh" && qsub Exectimer/exectimer-40.sh		
	echo "Exectimer/exectimer-50.sh" && qsub Exectimer/exectimer-50.sh

### Express
	echo "Express/Express-0.sh" && qsub Express/Express-0.sh
	echo "Express/Express-10.sh" && qsub Express/Express-10.sh
	echo "Express/Express-20.sh" && qsub Express/Express-20.sh 			
	echo "Express/Express-30.sh" && qsub Express/Express-30.sh	
	echo "Express/Express-40.sh" && qsub Express/Express-40.sh
	echo "Express/Express-50.sh" && qsub Express/Express-50.sh

### Gulp
	echo "Gulp/RD-gulp-cccr.sh" && qsub Gulp/RD-gulp-cccr.sh
	echo "Gulp/GA-0-gulp-cccr.sh" && qsub Gulp/GA-0-gulp-cccr.sh
	echo "Gulp/GA-10-gulp-cccr.sh" && qsub Gulp/GA-10-gulp-cccr.sh
	echo "Gulp/GA-20-gulp-cccr.sh" && qsub Gulp/GA-20-gulp-cccr.sh	
	### echo "Gulp/GA-30-gulp-cccr.sh" && qsub Gulp/GA-30-gulp-cccr.sh
	### echo "Gulp/GA-40-gulp-cccr.sh" && qsub Gulp/GA-40-gulp-cccr.sh
	echo "Gulp/GA-50-gulp-cccr.sh" && qsub Gulp/GA-50-gulp-cccr.sh

### Jade			
    echo "Jade/Jade-20.sh" && qsub Jade/Jade-20.sh
    echo "Jade/Jade-30.sh" && qsub Jade/Jade-30.sh
	echo "Jade/Jade-40.sh" && qsub Jade/Jade-40.sh
	echo "qsub Jade/Jade-50.sh" && qsub Jade/Jade-50.sh

### Lodash		
	echo "Lodash/Lodash-0.sh" && qsub Lodash/Lodash-0.sh
	echo "Lodash/Lodash-20.sh" && qsub Lodash/Lodash-20.sh
	echo "Lodash/Lodash-30.sh" && qsub Lodash/Lodash-30.sh
	echo "Lodash/Lodash-40.sh" && qsub Lodash/Lodash-40.sh
	echo "Lodash/Lodash-50.sh" && qsub Lodash/Lodash-50.sh

### Minimist
	echo "minimist.sh" && qsub minimist.sh

### Moment

### Node-Browserify
    echo "Node-browserrify/Job0.sh" && qsub Node-browserrify/Job50.sh

### Plivo-node
	echo "Plivo-node.sh" && qsub Plivo-node.sh

### Tleaf
	echo "Tleaf.sh" && qsub Tleaf.sh

### Underscore		
	### echo "Underscore/underscore-0.sh" && qsub Underscore/underscore-0.sh
	echo "Underscore/Underscore-10.sh" && qsub Underscore/Underscore-10.sh
	echo "Underscore/Underscore-20.sh" && qsub Underscore/Underscore-20.sh
	echo "Underscore/Underscore-30.sh" && qsub Underscore/Underscore-30.sh
	echo "Underscore/Underscore-40.sh" && qsub Underscore/Underscore-40.sh
	echo "Underscore/Underscore-50.sh" && qsub Underscore/Underscore-50.sh

### UUID
	echo "uuid.sh" && qsub uuid.sh