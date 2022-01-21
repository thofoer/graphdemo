import { FC, useCallback, useContext, useState } from "react";
import { useSelector } from "react-redux";
import { findAllPaths } from "../../algorithms/findPaths";
import { QueueStrategy } from "../../algorithms/queueStrategies";
import { graphSelector } from "../../store/graphSlice";
import { Path } from "../../types";
import  PathfinderSettings from "./PathfinderSettings";
import { StatusReportComp } from "../StatusReportComp/StatusReportComp";
import { PathList } from "../PathList/PathList";
import { LogContext } from "../../App";
import { formatNumber, formatTime } from "../../algorithms/utils";
import { Card } from "react-bootstrap";



export const PathfinderComp: FC = () => {
    
    const graph = useSelector(graphSelector).graph;

    const [isRunning, setRunning] = useState(false);
    const [cancelHandler, setCancelHandler] = useState<()=>void>();

    const [queueSize, setQueueSize] = useState<number>(0);
    const [stepCount, setStepCount] = useState<number>(0);
    const [elapsedMillis, setElapsedMillis] = useState<number>(0);

    const [result, setResult] = useState<Path[]>([]);

    const log = useContext(LogContext);

    const handleReportStatus = (stepCount: number, queueSize: number, elapsedMillis: number) => {
        setQueueSize(()=>queueSize);
        setStepCount(()=>stepCount);
        setElapsedMillis(()=>elapsedMillis);
    }
    
    const handleReportResult = (allPaths: Path[], elapsedMillis: number) => {        
        setRunning(false);
        log(`Es wurden ${formatNumber(allPaths.length)} unterschiedliche Pfade gefunden (Zeit: ${formatTime(elapsedMillis)})`);
        setResult(allPaths);
    }

    const handleCancel = () => {        
        if (cancelHandler) {
            console.log("CANCEL");
            cancelHandler();
            setRunning(false);
        }
    }

    const start = useCallback((startNode: string, targetNode: string, strategy: QueueStrategy) => {
        if (graph) {
            setRunning(true);
            const ch = findAllPaths(graph, startNode, targetNode, strategy, handleReportStatus, handleReportResult);            
            setCancelHandler(() => ch);
        }
    }, [graph]);
        
    return (
        <>
        <PathfinderSettings isRunning={isRunning} start={start} cancel={handleCancel}/>
        <StatusReportComp queueSize={queueSize} stepCount={stepCount} elapsedMillis={elapsedMillis}/>

        <Card className="m-3">
            <Card.Header>Kürzester Pfad</Card.Header>
            <Card.Body>
           
            </Card.Body>
        </Card>


        <PathList paths={result} />
        </>
    );
}

