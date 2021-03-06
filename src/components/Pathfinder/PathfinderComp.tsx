import { FC, useCallback, useContext, useState } from "react";
import { findAllPaths, findShortestPath } from "../../algorithms/findPaths";
import { QueueStrategy } from "../../algorithms/queueStrategies";
import { CalcResult, Graph, Path } from "../../types";
import  PathfinderSettings from "./PathfinderSettings";
import { StatusReportComp } from "../StatusReportComp/StatusReportComp";
import { PathList } from "../PathList/PathList";
import { LogContext } from "../../App";
import { formatNumber, formatTime } from "../../algorithms/utils";
import { Card } from "react-bootstrap";



export const PathfinderComp: FC = () => {
    
    const [isRunning, setRunning] = useState(false);
    const [cancelHandler, setCancelHandler] = useState<()=>void>();

    const [queueSize, setQueueSize] = useState<number>(0);
    const [stepCount, setStepCount] = useState<number>(0);
    const [elapsedMillis, setElapsedMillis] = useState<number>(0);

    const [result, setResult] = useState<Path[]>([]);
    const [resultShortestPath, setResultShortestPath] = useState<CalcResult<Path | null>>();

    const log = useContext(LogContext);

    const handleReportStatus = (stepCount: number, queueSize: number, elapsedMillis: number) => {
        setQueueSize(()=>queueSize);
        setStepCount(()=>stepCount);
        setElapsedMillis(()=>elapsedMillis);
    }
    
    const handleReportResult = useCallback( (allPaths: Path[], stepCount: number, elapsedMillis: number) => {        
        setRunning(false);
        log(`Es wurden ${formatNumber(allPaths.length)} unterschiedliche Pfade gefunden (Schritte: ${formatNumber(stepCount)} Zeit: ${formatTime(elapsedMillis)})`);
        setResult(allPaths);
    }, [log]);

    const handleCancel = () => {        
        if (cancelHandler) {            
            cancelHandler();
            setRunning(false);
            log("Abbruch.")
        }
    }


    const start = useCallback((graph: Graph, startNode: string, targetNode: string, strategy: QueueStrategy) => {        
        
        log("-------------------Starte Pfadsuche-------------------------");
        setRunning(true);
        setResult([]);
        const shortestPathResult = findShortestPath(graph, startNode, targetNode, strategy);            
        setResultShortestPath(shortestPathResult);
        log(`K??rzester Pfad: ${shortestPathResult.data ? shortestPathResult.data.strRep() : "keine L??sung"} (${shortestPathResult.stepCount} Schritte, Zeit: ${formatTime(shortestPathResult.timeInMillis!)})`)
        const ch = findAllPaths(graph, startNode, targetNode, strategy, handleReportStatus, handleReportResult);            
        setCancelHandler(() => ch);                      
    
    }, [ handleReportResult, log]);
        
    return (
        <>
        <PathfinderSettings isRunning={isRunning} start={start} cancel={handleCancel}/>
        <StatusReportComp queueSize={queueSize} stepCount={stepCount} elapsedMillis={elapsedMillis}/>

        <Card className="m-3">
            <Card.Header>K??rzester Pfad {resultShortestPath && 
               <> ({formatNumber(resultShortestPath.stepCount)} Schritte)</>
            }</Card.Header>
            <Card.Body>
                {resultShortestPath && 
                resultShortestPath.data ? resultShortestPath.data.strRep() : "keine L??sung"
                }
            </Card.Body>
        </Card>


        <PathList paths={result} />
        </>
    );
}

