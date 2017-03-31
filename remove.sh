#!/bin/bash
#PBS -k oe
#PBS -l select=1:ncpus=48
#PBS -N exectimer-20
#PBS -l walltime=500:00:00
#PBS -m bea
#PBS -M ffarzat@cos.ufrj.br
cd $PBS_O_WORKDIR
echo "Removendo /scratch/41061a/ffarzat1981/libstemp"
rm -rf /scratch/41061a/ffarzat1981/libstemp
echo "Removendo /scratch/41061a/ffarzat1981/.tmp_to_remove"
rm -rf /scratch/41061a/ffarzat1981/.tmp_to_remove
echo "Removendo /scratch/41061a/ffarzat1981/tmp_to_remove"
rm -rf /scratch/41061a/ffarzat1981/tmp_to_remove
echo "concluído"