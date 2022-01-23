import { Graph, Path, NodeId } from "../types";
import { PathQueue, QueueStrategy } from "./queueStrategies";
import { FRAME_MILLIS, ReportFindingCallback, ReportResultCallback, ReportStatusCallback } from ".";

const POPULATION_SIZE = 20;

type PathFitness = { fitness: number, path: Path };



const ga = (
    graph: Graph,    
    random: ()=>number = Math.random
    // onReportStatus: ReportStatusCallback,
    // onReportResult: ReportResultCallback<Path | null>,
    // onReportFinding: ReportFindingCallback<Path>
  ) => {
  
    const createPopulation = () => {
        const res: PathFitness[] = [];
        const paths = [];
        let weightSum = 0;
        for (let i=0; i<POPULATION_SIZE; i++) {
            const newPop = graph.nodeIds.slice().sample();
            newPop.push(newPop[0]);
            const newPath = graph.pathForNodes(newPop);
            paths.push(newPath);
            weightSum += 1/newPath.weight;
        }
        paths.sort( (a,b) => a.weight - b.weight);
    
        for (let i=0; i<POPULATION_SIZE; i++) {
            res.push( {fitness: ((1/paths[i].weight/weightSum)), path: paths[i]} );
          
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

    const mutate = (path: Path) => {
        
    }

    const nextGeneration = (pop: PathFitness[]) => {
        
        for (let i=0; i<pop.length; i++) {
    
        }
    };


    const pop = createPopulation()
    let bestPath = pop[0].path;


    console.log(pop);

  
  
  };


  export { ga };