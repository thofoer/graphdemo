import { Graph, Path, NodeId } from "../types";
import { PathQueue, QueueStrategy } from "./queueStrategies";
import { FRAME_MILLIS, ReportFindingCallback, ReportResultCallback, ReportStatusCallback } from ".";

const POPULATION_SIZE = 100;

type PathFitness = { fitness: number, path: NodeId[], weight: number };

const defaultRandom = (min?: number, max?: number): number => { return min!=undefined && max!=undefined ? (min + Math.floor((max-min) * Math.random())) : Math.random() }


const ga = (
    graph: Graph,    
    random: (min?: number, max?: number)=>number = defaultRandom
    // onReportStatus: ReportStatusCallback,
    // onReportResult: ReportResultCallback<Path | null>,
    // onReportFinding: ReportFindingCallback<Path>
  ) => {
  
    const createPopulation = () => {
        const res: PathFitness[] = [];
        
        for (let i=0; i<POPULATION_SIZE; i++) {
            const newPath = graph.nodeIds.slice().sample();
            res.push( { fitness: 0, weight: 0, path: newPath});
        }        
        return res;
    }

    const calculateFitness = (pop: PathFitness[]) => {
        const res: PathFitness[] = [];        
        let weightSum = 0;
        for (let i=0; i<pop.length; i++) {     
            const newPathFitness = { fitness: 0, path: pop[i].path, weight: graph.weightForClosedPath(pop[i].path) };
            res.push(newPathFitness);
            weightSum += 1/newPathFitness.weight;
        }
        res.sort( (a,b) => a.weight - b.weight);
    
        for (let i=0; i<pop.length; i++) {
            res[i] = { ...res[i], fitness: (1/res[i].weight/weightSum) };
          
        }
        return res;
    }
    
    const selectPath = (pop: PathFitness[]) => {
        let i = 0;
        let r = random();
        while(r>0) {
            r -= pop[i].fitness;
            i++;
        }
        return pop[i-1];
    }

    const mutate = (path: PathFitness) => {
        const index1 = random(0, path.path.length);
        const index2 = random(0, path.path.length);        
        const temp = path.path[index1];
        path.path[index1] = path.path[index2];
        path.path[index2] = temp;        
    }

    const nextGeneration = (pop: PathFitness[]) => {
        const res: PathFitness[] = [];
        
        for (let i=0; i<pop.length; i++) {
            const p1 = selectPath(pop);
            mutate(p1);
            res.push(p1);
        }
        return calculateFitness(res);
    };

    let pop = calculateFitness(createPopulation());
    let bestWeight = Infinity;
    for (let i=0; i<100000; i++) {
        pop = nextGeneration(pop);
        if (pop[0].weight<bestWeight) {
            bestWeight=pop[0].weight;
            console.log(bestWeight);
        }
    }
    console.log("Best="+bestWeight);
  
  };


  export { ga };