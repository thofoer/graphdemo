import { FC, useCallback, useContext, useState } from "react";
import { Graph, Path } from "../../types";
import { GaStatusReportComp } from "../StatusReportComp/GaStatusReportComp";
import { PathList } from "../PathList/PathList";
import { HighlightContext, LogContext } from "../../App";
import { Card } from "react-bootstrap";
import TspGaSettings from "./TspGaSettings";
import { ga } from "../../algorithms/tspga";


export const TspGeneticAlgorithmComp: FC = () => {

    const [isRunning, setRunning] = useState(false);
    const [cancelHandler, setCancelHandler] = useState<()=>void>();
    const [popSizeHandler, setPopSizeHandler] = useState<(n: number)=>void>();
    const [mutationChanceHandler, setMutationChanceHandler] = useState<(n: number)=>void>();
    const [mutationGradeHandler, setMutationGradeHandler] = useState<(n: number)=>void>();
    const [crossoverChanceHandler, setCrossoverChanceHandler] = useState<(n: number)=>void>();
    const [stagnationMaxHandler, setStagnationMaxHandler] = useState<(n: number)=>void>();

    const [resultShortestPath, setResultShortestPath] = useState<Path>();
    const [result, setResult] = useState<Path[]>([]);

    const log = useContext(LogContext);
    const highlight = useContext(HighlightContext);

    const [maxGen, setMaxGen] = useState<number>(0);
    const [lastFindingGen, setLastFindingGen] = useState<number>(0);    
    const [generation, setGeneration] = useState<number>(0);
    const [elapsedMillis, setElapsedMillis] = useState<number>(0);

    const start = (graph: Graph, popSize: number, mutationChance: number, mutationGrade: number, crossoverChance: number, stagnationMax: number) => {
        
        setResult([]);
        setMaxGen(()=>stagnationMax);
        setGeneration(()=>0);
        setLastFindingGen(()=>0);
        const callbacks =  ga(graph, popSize, stagnationMax, mutationChance, mutationGrade, crossoverChance, handleReportStatus, handleReportFinding);
        const {
            cancel,        
            setPopsize,    
            setMutationChance,    
            setMutationGrade,
            setCrossoverChance,
            setStagnationMax 
        } = callbacks;
        
        setCancelHandler(()=>cancel);
        console.log("set popsizehandler", setPopsize);
        setPopSizeHandler(()=>setPopsize);
        setMutationChanceHandler(()=>setMutationChance);
        setMutationGradeHandler(()=>setMutationGrade);
        setCrossoverChanceHandler(()=>setCrossoverChance);
        setStagnationMaxHandler(()=>setStagnationMax);
        setRunning(true);
    
    }

    const handleReportFinding = useCallback( (finding: Path, genNumber: number) => {       
        const closedPath: Path = Path.copy(finding);
        closedPath.nodes.push(closedPath.nodes.first());
        log(`Neue Rundreise gefunden: ${closedPath.strRep()}`);        
        setResult( old => [ closedPath, ...old] );
        highlight(closedPath);
        setLastFindingGen(() => genNumber);
        setResultShortestPath(()=>closedPath);
    },
    [log, highlight]);


    const handleReportStatus = (generation: number, elapsedMillis: number, finished: boolean) => {      
        setGeneration(()=>generation);
        setElapsedMillis(()=>elapsedMillis);
        setRunning(()=>!finished);
    }

    const handleCancel = () => {        
        if (cancelHandler) {            
            cancelHandler();
            setRunning(false);
            log("Abbruch.")
        }
    }

    const onChangePopSize = (popSize: number) => {        
        if (popSizeHandler){            
            popSizeHandler(popSize);
        }   
    }
    const onChangeStagnationMax = (n: number) => {
        if (stagnationMaxHandler){            
            stagnationMaxHandler(n);
            setMaxGen(()=>n);
            console.log("m>",maxGen)
        }   
    }
    const onChangeMutationChance = (n: number) => {
        if (mutationChanceHandler){            
            mutationChanceHandler(n);
        }   
    }
    const onChangeMutationGrade = (n: number) => {
        if (mutationGradeHandler){            
            mutationGradeHandler(n);
        }   
    }
    const onChangeCrossoverChance = (n: number) => {
        if (crossoverChanceHandler){            
            crossoverChanceHandler(n);
        }   
    }

    return (
        <>
        <TspGaSettings 
            isRunning={isRunning} 
            start={start} 
            cancel={handleCancel} 
            onChangeCrossoverChance={onChangeCrossoverChance} 
            onChangeMutationChance={onChangeMutationChance} 
            onChangeMutationGrade={onChangeMutationGrade} 
            onChangePopSize={onChangePopSize} 
            onChangeStagnationMax={onChangeStagnationMax}
        />
        <GaStatusReportComp progress={ Math.floor(100*(generation-lastFindingGen) / maxGen )} generation={generation} elapsedMillis={elapsedMillis}/>

        <Card className="m-3">
            <Card.Header>Kürzester gefundener Pfad                 
            </Card.Header>
            <Card.Body>
                {resultShortestPath ? resultShortestPath.strRep() : "keine Lösung"
                }
            </Card.Body>
        </Card>


        <PathList paths={result} />
        </>
    );
}