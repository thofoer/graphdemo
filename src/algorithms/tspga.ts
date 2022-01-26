import { Graph, Path, NodeId } from "../types";
import { FRAME_MILLIS, ReportGaFindingCallback, ReportGaStatusCallback } from ".";
import { probCheck } from "./utils";


type PathFitness = { fitness: number, path: NodeId[], weight: number };

const defaultRandom = (min?: number, max?: number): number => { return min!==undefined && max!==undefined ? (min + Math.floor((max-min) * Math.random())) : Math.random() }


const ga = (
    graph: Graph,   
    populationSize: number,
    stagnationMax: number,
    mutationChance: number,
    mutationGrade: number,
    crossoverChance: number,
    onReportStatus: ReportGaStatusCallback,    
    onReportFinding: ReportGaFindingCallback<Path>,
    random: (min?: number, max?: number)=>number = defaultRandom,
  ) => {

    const createStartRoute = (start: NodeId) => {
        const res: NodeId[] = [];
        const nodesLeft: Set<NodeId> = new Set(graph.nodeIds);

        res.push(start);
        nodesLeft.delete(start);

        let curr = start;
        while (nodesLeft.size  > 0) {
            const n2: NodeId[] = Array.from(nodesLeft);
            const nearest = n2.map( n => {
                return { dist: graph.distanceBetween(curr, n), target: n }
            }
            ).sort( (a,b)=>a.dist!-b.dist!).first();

            res.push(nearest.target);
            nodesLeft.delete(nearest.target);
        }
        return res;
    }

    const createPopulation = () => {
        const res: PathFitness[] = [];
        for (let n of graph.nodeIds) {
            const newPath = createStartRoute(n);
            res.push( { fitness: 0, weight: 0, path: newPath});
        }
        
        for (let i=0; i<populationSize-res.length; i++) {
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
        const len = path.path.length;
        const index = random(0, len);
        const offset = random(1, mutationGrade);        
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
            let searchIx = p2.path.indexOf(newPath[i-1 === -1 ? len-1 : i-1]);
            while (newPath.includes(p2.path[searchIx%len])) {
                searchIx++;
            }
            newPath[i%len] = p2.path[searchIx%len];
        }

        return { fitness: 0, weight: 0, path: newPath};
    }

    const nextGeneration = (pop: PathFitness[]) => {
        const res: PathFitness[] = [];
        if (bestPath) {
            res.push(bestPath);
            res.push(bestPath);
        }
        for (let i=0; i<populationSize-res.length; i++) {
            const p1 = selectPath(pop);
            const p2 = selectPath(pop);
            const c = probCheck(crossoverChance) ? crossover(p1, p2) : p1;
            if (probCheck(mutationChance)) {
                mutate(c);
            }
            res.push(c);
        }
        return calculateFitness(res);
    }

    const cancelCallback = () => {
        cancelled = true;
    }

    const setPopsizeCallback = (n: number) => {        
        console.log("Popsize", n)
        populationSize = n;
    }

    const setMutationChanceCallback = (n: number) => {
        console.log("mutationChance", n)
        mutationChance = n;
    }

    const setMutationGradeCallback = (n: number) => {
        console.log("mutationGrade", n)
        mutationGrade = n;
    }

    const setCrossoverChanceCallback = (n: number) => {
        console.log("crossoverChance", n)
        crossoverChance = n;
    }

    const setStagnationMaxCallback = (n: number) => {
        console.log("stagnationMax", n)
        stagnationMax = n;
    }

    const startTime = Date.now();
    let lastFrame = startTime;
    let pop = calculateFitness(createPopulation());
    let bestWeight = Infinity;
    let cancelled = false;
            
    let lastImprovement = 0;
    let genNumber = 0;
    let bestPath: PathFitness|undefined;

    const iter = () => {
    
        let running = true;

        while (running && !cancelled && stagnationMax > genNumber-lastImprovement) {
            genNumber++;
            pop = nextGeneration(pop);
            if (pop[0].weight<bestWeight) {
                bestPath = pop[0];
                bestWeight=pop[0].weight;
                onReportFinding(new Path( pop[0].path, pop[0].weight, graph.props.bidirectional), genNumber);
                lastImprovement = genNumber;
            }

            const now = Date.now();
            if (now - lastFrame > FRAME_MILLIS || cancelled ||stagnationMax <= genNumber-lastImprovement) {
              running = false;
              lastFrame = now;
              const millis = now - startTime;
              onReportStatus(genNumber, millis, !(stagnationMax > genNumber-lastImprovement && !cancelled));
             
            }
        }        

        if (stagnationMax > genNumber-lastImprovement && !cancelled) {
           window.requestAnimationFrame(iter);
        }
    }    
    window.requestAnimationFrame(iter);

    return {
        cancel: cancelCallback,        
        setPopsize: setPopsizeCallback ,    
        setMutationChance:    setMutationChanceCallback,    
        setMutationGrade:    setMutationGradeCallback,
        setCrossoverChance:    setCrossoverChanceCallback,
        setStagnationMax: setStagnationMaxCallback,   
    }        
}   
   

  export { ga };