import { FC, useContext } from "react";
import { Card, ListGroup, ListGroupItem } from "react-bootstrap";
import { Path } from "../../types";
import { formatNumber } from "../../algorithms/utils";
import { HighlightContext } from "../../App";

const MAX_ENTRIES = 50;

interface OwnProps {
    paths: Path[];
}

export const PathList: FC<OwnProps> = ({paths}) => {

    const highlight = useContext(HighlightContext);

    return (
        <Card className="m-3">
            <Card.Header>Alle Pfade ({formatNumber(paths.length)})</Card.Header>
            <Card.Body>
            <ListGroup style={{overflow: "auto", maxHeight: "500px"}}>
                { (paths.length < MAX_ENTRIES ? paths : paths.slice(0, MAX_ENTRIES)).map((p) => (
                    <ListGroupItem
                        as="li"
                        key={p.strRep()}                        
                        action
                        onClick={highlight.bind(null, p)}
                    >
                        {p.strRep()}
                    </ListGroupItem>
                ))}
                {(paths.length>MAX_ENTRIES) &&  
                    <ListGroupItem
                        as="li"
                        key="ausgeblendet"
                        action                        
                    >
                        <i>{paths.length-MAX_ENTRIES} weitere...</i>
                    </ListGroupItem>                        
                }
            </ListGroup>
            </Card.Body>
        </Card>
    );
}