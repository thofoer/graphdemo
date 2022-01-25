import { FC, useCallback, useContext, useState } from "react";
import { useSelector } from "react-redux";
import { findShortestRoundtrip } from "../../algorithms/roundtrip";
import { QueueStrategy } from "../../algorithms/queueStrategies";
import { graphSelector } from "../../store/graphSlice";
import { StatusReportComp } from "../StatusReportComp/StatusReportComp";
import { PathList } from "../PathList/PathList";
import { HighlightContext, LogContext } from "../../App";
import { formatNumber, formatTime } from "../../algorithms/utils";
import { Card } from "react-bootstrap";
import { Path } from "../../types";
import RoundtripSettings from "./RoundtripSettings";



export const RoundtripComp: FC = () => {

    const graph = useSelector(graphSelector).graph;

    const [isRunning, setRunning] = useState(false);
    const [cancelHandler, setCancelHandler] = useState<()=>void>();

    const [queueSize, setQueueSize] = useState<number>(0);
    const [stepCount, setStepCount] = useState<number>(0);
    const [elapsedMillis, setElapsedMillis] = useState<number>(0);

    const [result, setResult] = useState<Path|null>();
    const [paths, setPaths] = useState<Path[]>([]);

    const log = useContext(LogContext);
    const highlight = useContext(HighlightContext);

    const handleReportStatus = (stepCount: number, queueSize: number, elapsedMillis: number) => {
        setQueueSize(()=>queueSize);
        setStepCount(()=>stepCount);
        setElapsedMillis(()=>elapsedMillis);
    }
    
    const handleReportFinding = useCallback( (finding: Path) => {        
        log(`Neue Rundreise gefunden: ${finding.strRep()}`);
        setResult(finding);
        setPaths( old => [...old, finding] );
        highlight(finding);
    },[log, highlight]);

    const handleReportResult = useCallback( (result: Path|null, stepCount: number, elapsedMillis: number) => {        
        setRunning(false);
        log(`Die kürzeste Rundereise ist: ${result ? result.strRep() : "nicht möglich"} (Schritte: ${formatNumber(stepCount)} Zeit: ${formatTime(elapsedMillis)})`);
        setResult(result);
    }, [log]);

    const handleCancel = () => {        
        if (cancelHandler) {            
            cancelHandler();
            setRunning(false);
            log("Abbruch.")
        }
    }

    const start = useCallback((strategy: QueueStrategy) => {
        if (graph) {
            setResult(null);
            setPaths([]);
            log("-------------------Starte TSP-------------------------");
            setRunning(true);                        
            const ch = findShortestRoundtrip(graph, strategy, handleReportStatus, handleReportResult, handleReportFinding);            
            setCancelHandler(() => ch);                      
        }
    }, [graph, handleReportResult, handleReportFinding, log]);


    return (
        <>
        <RoundtripSettings isRunning={isRunning} start={start} cancel={handleCancel}/>
        <StatusReportComp queueSize={queueSize} stepCount={stepCount} elapsedMillis={elapsedMillis}/>

        <Card className="m-3">
            <Card.Header>Kürzester Pfad {isRunning && <>bisher</>}</Card.Header>
            <Card.Body>
                {result && 
                result ? result.strRep() : "keine Lösung"
                }
            </Card.Body>
        </Card>    
        <PathList paths={paths} />   
        </>
    );

}