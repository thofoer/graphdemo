import React, { FC, useState } from "react";
import { Button, Card, Col, FormControl, FormGroup, FormLabel, Row } from "react-bootstrap";
import FormRange from "react-bootstrap/esm/FormRange";
import { useSelector } from "react-redux";
import { graphSelector } from "../../store/graphObjectSlice";
import { Graph } from "../../types";

interface OwnProps {
    isRunning: boolean;
    start: (graph: Graph, popSize: number, mutationChance: number, mutationGrade: number, crossoverChance: number, stagnationMax: number) => void;
    cancel: () => void;
    onChangePopSize: (popSize: number) => void;
    onChangeStagnationMax: (popSize: number) => void;
    onChangeMutationChance: (popSize: number) => void;
    onChangeMutationGrade: (popSize: number) => void;
    onChangeCrossoverChance: (popSize: number) => void;
}

const TspGaSettings: FC<OwnProps> = (
    {
        isRunning,
        start,
        cancel,
        onChangePopSize,
        onChangeStagnationMax,
        onChangeMutationChance,
        onChangeMutationGrade,
        onChangeCrossoverChance,
    }
) => {
        
    const graph = useSelector(graphSelector).graphObject;

    const [popSize, setPopSize] = useState<number>(50);
    const [stagnationMax, setStagnationMax] = useState<number>(100000);
    const [mutationChance, setMutationChance] = useState<number>(0.1);
    const [mutationGrade, setMutationGrade] = useState<number>(3);
    const [crossoverChance, setCrossoverChance] = useState<number>(0.5);

    const handleStart = () => {
        if (graph && graph instanceof Graph) {
            start(graph, popSize, mutationChance, mutationGrade, crossoverChance, stagnationMax);
        }
    }


    console.log("render tsga settings");

    return (
        <>        
        
            <Card className="m-3">
                <Card.Header>Genetischer Algorithmus</Card.Header>
                <Card.Body>
                    <Row className="d-flex p-3 mt-3">
                        <Col className="m-1" xl={3}>
                            <FormLabel className="mb-4" as={Row}>Populationsgröße</FormLabel>
                            <FormLabel className="mb-4" as={Row}>Stagnationsmaximum</FormLabel>
                            <FormLabel className="mb-4" as={Row}>Crossover-Wahrscheinlichkeit</FormLabel>
                            <FormLabel className="mb-4" as={Row}>Mutationswahrscheinlichkeit</FormLabel>
                            <FormLabel as={Row}>Mutationsgrad</FormLabel>
                        </Col>
                        <Col className="m-1" xl={5}>
                        <FormRange              
                            className="mb-4"  
                            min={10}
                            max={500}
                            inputMode="numeric"
                            defaultValue={popSize}
                            draggable={false}
                            step={1}
                            onChange={(e) =>  setPopSize(+e.target.value)}
                            onMouseUp={(e) => onChangePopSize(popSize)}
                        />
                        <FormRange              
                            className="mb-4"  
                            min={10000}
                            max={1000000}
                            inputMode="numeric"
                            defaultValue={stagnationMax}
                            draggable={false}
                            step={10000}
                            onChange={(e) => setStagnationMax(+e.target.value)}
                            onMouseUp={(e) => onChangeStagnationMax(stagnationMax)}
                        />
                        <FormRange              
                            className="mb-4"  
                            min={0}
                            max={1}
                            inputMode="numeric"
                            defaultValue={crossoverChance}
                            draggable={false}
                            step={0.01}
                            onChange={(e) => setCrossoverChance(+e.target.value)}
                            onMouseUp={(e) => onChangeCrossoverChance(crossoverChance)}
                        />
                        <FormRange              
                            className="mb-4"  
                            min={0}
                            max={1}
                            inputMode="numeric"
                            defaultValue={mutationChance}
                            draggable={false}
                            step={0.01}
                            onChange={(e) => setMutationChance(+e.target.value)}
                            onMouseUp={(e) => onChangeMutationChance(mutationChance)}
                        />
                         <FormRange              
                            className="mb-4"  
                            min={0}
                            max={10}
                            inputMode="numeric"
                            defaultValue={mutationGrade}
                            draggable={false}
                            step={1}
                            onChange={(e) => setMutationGrade(+e.target.value)}
                            onMouseUp={(e) => onChangeMutationGrade(mutationGrade)}                          
                        />
                        </Col>
                        <Col  className="m-1" xl={2}>
                            <FormControl
                                className="mb-2"  
                                style={{ width: "6em" }}
                                as="input"
                                readOnly
                                value={popSize}
                            />
                            <FormControl
                                className="mb-2"  
                                style={{ width: "6em" }}
                                as="input"
                                readOnly
                                value={stagnationMax}
                            />
                             <FormControl
                                className="mb-2"  
                                style={{ width: "6em" }}
                                as="input"
                                readOnly
                                value={`${Math.floor(crossoverChance*100)} %`}
                            />
                            <FormControl
                                className="mb-2"  
                                style={{ width: "6em" }}
                                as="input"
                                readOnly
                                value={`${Math.floor(mutationChance*100)} %`}
                            />
                            <FormControl
                                className="mb-2"  
                                style={{ width: "6em" }}
                                as="input"
                                readOnly
                                value={mutationGrade}
                            />
                        </Col>
                    </Row>

                    <FormGroup className="d-flex align-items-end mt-3">
                            <Button onClick={handleStart} style={{marginRight: "1em", minWidth: "6em"}} disabled={isRunning}>Start</Button>
                            <Button disabled={!isRunning} onClick={cancel} style={{marginRight: "1em", minWidth: "6em"}}>Abbruch</Button>                        
                    </FormGroup>
                </Card.Body>
            </Card>
        
        </>
    );
}

export default React.memo(TspGaSettings, (prevProps, nextProps) => prevProps.isRunning === nextProps.isRunning);