#!/bin/bash
#PBS -k oe
#PBS -l select=1:ncpus=10
#PBS -l walltime=500:00:00
#PBS -N Copia-clients
### Request email when job begins and ends
#PBS -m bea
### Specify email address to use for notification.
#PBS -M ffarzat@cos.ufrj.br

for i in {10..19}
do
   echo "Rodada $i"

   STR=/scratch/41061a/ffarzat1981/clients/rodada$i
   mkdir /scratch/41061a/ffarzat1981/clients/rodada$i

   for i in {0..5}
   do
		mkdir $STR/$i

		cp -r /home/users/ffarzat1981/Otimizador/JavaScriptHeuristicOptmizer/Libraries/pug $STR/$i
		echo "c-> pug $i ok"
#		cp -r /home/users/ffarzat1981/Otimizador/JavaScriptHeuristicOptmizer/Libraries/jquery $STR/$i
#		echo "c-> jquery $i ok"
#		cp -r /home/users/ffarzat1981/Otimizador/JavaScriptHeuristicOptmizer/Libraries/lodash $STR/$i
#		echo "c-> lodash $i ok"
#		cp -r /home/users/ffarzat1981/Otimizador/JavaScriptHeuristicOptmizer/Libraries/moment $STR/$i
#		echo "c-> moment $i ok"
#		cp -r /home/users/ffarzat1981/Otimizador/JavaScriptHeuristicOptmizer/Libraries/node-browserify $STR/$i
#		echo "c-> node-browserify $i ok"
#		cp -r /home/users/ffarzat1981/Otimizador/JavaScriptHeuristicOptmizer/Libraries/pug $STR/$i
#		echo "c-> pug $i ok"
#		cp -r /home/users/ffarzat1981/Otimizador/JavaScriptHeuristicOptmizer/Libraries/UglifyJS2 $STR/$i
#		echo "c-> UglifyJS2 $i ok"
#		cp -r /home/users/ffarzat1981/Otimizador/JavaScriptHeuristicOptmizer/Libraries/underscore $STR/$i
#		echo "c-> underscore $i ok"
   done
done


