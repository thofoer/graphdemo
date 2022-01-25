import { Graph, Path, NodeId } from "../types";
import { PathQueue, QueueStrategy } from "./queueStrategies";
import { FRAME_MILLIS, ReportFindingCallback, ReportResultCallback, ReportStatusCallback } from ".";
import { probCheck } from "./utils";

const POPULATION_SIZE = 40;
const MAX_GENERATIONS = 500000;
const MAX_GENERATIONS_STAGNATION = 50000;
const MUTATIONS_PROB = 0.1;
const MUTATION_GRADE = 3;

type PathFitness = { fitness: number, path: NodeId[], weight: number };

const defaultRandom = (min?: number, max?: number): number => { return min!==undefined && max!==undefined ? (min + Math.floor((max-min) * Math.random())) : Math.random() }


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

    const mutate1 = (path: PathFitness) => {
        const index1 = random(0, path.path.length);
        const index2 = random(0, path.path.length);        
        const temp = path.path[index1];
        path.path[index1] = path.path[index2];
        path.path[index2] = temp;        
    }

    const mutate2 = (path: PathFitness) => {
        const len = path.path.length;
        const index = random(0, len);
        const offset = random(1, MUTATION_GRADE);        
        const temp = path.path[index];
        path.path[index] = path.path[(index+offset) % len];
        path.path[(index+offset) % len] = temp;        
    }

    const crossover = (p1: PathFitness, p2: PathFitness) => {
        const len = p1.path.length;
        const index = random(0, len);
        const size = Math.floor(random(len/4, 3*len/4));
        const newPath: NodeId[] = Array(len);
        for (let i = index; i<index+size; i++) {
            newPath[i%len] = p1.path[i%len];
        }
        for (let i = index+size; i<index+len; i++) {
            let searchIx = p2.path.indexOf(newPath[i-1 == -1 ? len-1 : i-1]);
            while (newPath.includes(p2.path[searchIx%len])) {
                searchIx++;
            }
            newPath[i%len] = p2.path[searchIx%len];
        }
        //console.log("p1", p1.path)
        //console.log("p2", p2.path)
        //console.log("c", newPath)
        return { fitness: 0, weight: 0, path: newPath};
    }

    const nextGeneration = (pop: PathFitness[]) => {
        const res: PathFitness[] = [];
        
        for (let i=0; i<pop.length*2; i++) {
            const p1 = selectPath(pop);
            const p2 = selectPath(pop);
            const c = crossover(p1, p2);
            if (probCheck(MUTATIONS_PROB)) {
                mutate2(c);
            }
            res.push(c);
        }
        return calculateFitness(res.slice(0,pop.length));
    };




    let pop = calculateFitness(createPopulation());
    let bestWeight = Infinity;
    //crossover(pop[0], pop[1]);
    
    let lastImprovement = 0;
    for (let i=0; i<MAX_GENERATIONS && i-lastImprovement < MAX_GENERATIONS_STAGNATION; i++) {
        pop = nextGeneration(pop);
        if (pop[0].weight<bestWeight) {
            bestWeight=pop[0].weight;
            console.log(bestWeight);
            lastImprovement = i;
        }
    }
    console.log("Best="+bestWeight);
  
  };


  export { ga };